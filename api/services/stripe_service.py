"""
Stripe payment integration service.
"""
import stripe
from datetime import datetime
from config import settings
from typing import Dict, Any
from supabase import Client


if settings.stripe_secret_key:
    stripe.api_key = settings.stripe_secret_key


class StripeService:
    """Service for Stripe billing operations."""
    
    @staticmethod
    async def create_checkout_session(
        user_id: str,
        user_email: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        db: Client
    ) -> Dict[str, str]:
        """
        Create Stripe Checkout Session for subscription.
        
        Args:
            user_id: User ID
            user_email: User email
            price_id: Stripe price ID for the plan
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect if payment canceled
            db: Supabase client
            
        Returns:
            Dict with session_id and checkout_url
        """
        # Check if user already has a Stripe customer ID
        user_result = db.table("users").select("stripe_customer_id").eq("id", user_id).execute()
        
        customer_id = None
        if user_result.data and user_result.data[0].get('stripe_customer_id'):
            customer_id = user_result.data[0]['stripe_customer_id']
        else:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=user_email,
                metadata={"user_id": user_id}
            )
            customer_id = customer.id
            
            # Save customer ID to database
            db.table("users").update({"stripe_customer_id": customer_id}).eq("id", user_id).execute()
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1
                }
            ],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"user_id": user_id}
        )
        
        return {
            "session_id": session.id,
            "checkout_url": session.url
        }
    
    @staticmethod
    async def create_portal_session(
        user_id: str,
        return_url: str,
        db: Client
    ) -> str:
        """
        Create Stripe Customer Portal session.
        
        Args:
            user_id: User ID
            return_url: URL to return to after managing subscription
            db: Supabase client
            
        Returns:
            Portal URL string
        """
        # Get user's Stripe customer ID
        user_result = db.table("users").select("stripe_customer_id").eq("id", user_id).execute()
        
        if not user_result.data or not user_result.data[0].get('stripe_customer_id'):
            raise Exception("User does not have a Stripe customer ID")
        
        customer_id = user_result.data[0]['stripe_customer_id']
        
        # Create portal session
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url
        )
        
        return session.url
    
    @staticmethod
    async def handle_webhook_event(event: Dict[str, Any], db: Client) -> None:
        """
        Handle Stripe webhook events.
        
        Args:
            event: Stripe event dict
            db: Supabase client (service role for admin operations)
        """
        event_type = event.get('type')
        
        if event_type == 'customer.subscription.created':
            await StripeService._handle_subscription_created(event, db)
        
        elif event_type == 'customer.subscription.updated':
            await StripeService._handle_subscription_updated(event, db)
        
        elif event_type == 'customer.subscription.deleted':
            await StripeService._handle_subscription_deleted(event, db)
        
        elif event_type == 'invoice.payment_succeeded':
            await StripeService._handle_payment_succeeded(event, db)
        
        elif event_type == 'invoice.payment_failed':
            await StripeService._handle_payment_failed(event, db)
    
    @staticmethod
    async def _handle_subscription_created(event: Dict[str, Any], db: Client):
        """Handle new subscription creation."""
        subscription = event['data']['object']
        customer_id = subscription['customer']
        subscription_id = subscription['id']
        status = subscription['status']
        current_period_start = subscription['current_period_start']
        current_period_end = subscription['current_period_end']
        
        # Determine plan from price ID
        price_id = subscription['items']['data'][0]['price']['id']
        plan = 'pro' if price_id == settings.stripe_price_id_pro else 'team'
        
        # Find user by customer ID
        user_result = db.table("users").select("id").eq("stripe_customer_id", customer_id).execute()
        
        if user_result.data and len(user_result.data) > 0:
            user_id = user_result.data[0]['id']
            
            # Update user plan
            db.table("users").update({"plan": plan}).eq("id", user_id).execute()
            
            # Create or update subscription record
            db.table("subscriptions").upsert({
                "user_id": user_id,
                "stripe_subscription_id": subscription_id,
                "plan": plan,
                "status": status,
                "current_period_start": datetime.fromtimestamp(current_period_start).isoformat(),
                "current_period_end": datetime.fromtimestamp(current_period_end).isoformat()
            }).execute()
    
    @staticmethod
    async def _handle_subscription_updated(event: Dict[str, Any], db: Client):
        """Handle subscription updates."""
        subscription = event['data']['object']
        subscription_id = subscription['id']
        status = subscription['status']
        current_period_end = subscription['current_period_end']
        
        # Update subscription status
        db.table("subscriptions").update({
            "status": status,
            "current_period_end": datetime.fromtimestamp(current_period_end).isoformat()
        }).eq("stripe_subscription_id", subscription_id).execute()
        
        # If subscription is canceled or past_due, downgrade user to free
        if status in ['canceled', 'unpaid']:
            subscription_result = db.table("subscriptions").select("user_id").eq("stripe_subscription_id", subscription_id).execute()
            if subscription_result.data:
                user_id = subscription_result.data[0]['user_id']
                db.table("users").update({"plan": "free"}).eq("id", user_id).execute()
    
    @staticmethod
    async def _handle_subscription_deleted(event: Dict[str, Any], db: Client):
        """Handle subscription cancellation."""
        subscription = event['data']['object']
        subscription_id = subscription['id']
        
        # Downgrade user to free plan
        subscription_result = db.table("subscriptions").select("user_id").eq("stripe_subscription_id", subscription_id).execute()
        if subscription_result.data:
            user_id = subscription_result.data[0]['user_id']
            db.table("users").update({"plan": "free"}).eq("id", user_id).execute()
            
            # Update subscription status
            db.table("subscriptions").update({"status": "canceled"}).eq("stripe_subscription_id", subscription_id).execute()
    
    @staticmethod
    async def _handle_payment_succeeded(event: Dict[str, Any], db: Client):
        """Handle successful payment."""
        # Could log successful payments or send confirmation emails
        pass
    
    @staticmethod
    async def _handle_payment_failed(event: Dict[str, Any], db: Client):
        """Handle failed payment."""
        # Could send notification emails about payment failure
        pass


# Global instance
stripe_service = StripeService()
