"""
Billing and subscription endpoints (Stripe integration).
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from supabase import Client
from typing import Dict, Any, Optional
from database import get_db, get_service_db
from dependencies import get_current_user
from schemas.billing import CheckoutRequest, CheckoutResponse, PortalRequest, PortalResponse
from services.stripe_service import stripe_service
from config import settings
import stripe


router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    checkout_request: CheckoutRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Create Stripe Checkout Session for subscription upgrade.
    
    Accepts either price_id directly or tier name (pro/team) which resolves to price_id.
    Returns checkout URL for user to complete payment.
    """
    if not settings.stripe_secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Billing is not configured"
        )

    user_id = current_user['id']
    user_email = current_user['email']
    
    # Resolve price_id from tier if not provided directly
    price_id = checkout_request.price_id
    if not price_id and checkout_request.tier:
        tier_map = {
            'pro': settings.stripe_price_id_pro,
            'team': settings.stripe_price_id_team,
        }
        price_id = tier_map.get(checkout_request.tier)
        if not price_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown tier: {checkout_request.tier}. Valid tiers: pro, team"
            )
    
    if not price_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either price_id or tier must be provided"
        )
    
    # Default URLs if not provided
    success_url = checkout_request.success_url or f"{settings.frontend_url}/dashboard?upgrade=success"
    cancel_url = checkout_request.cancel_url or f"{settings.frontend_url}/pricing?upgrade=canceled"
    
    try:
        result = await stripe_service.create_checkout_session(
            user_id=user_id,
            user_email=user_email,
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url,
            db=db
        )
        
        return CheckoutResponse(
            session_id=result['session_id'],
            checkout_url=result['checkout_url']
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )


@router.post("/portal", response_model=PortalResponse)
async def create_portal_session(
    portal_request: PortalRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Create Stripe Customer Portal session.
    
    Returns portal URL for user to manage their subscription.
    """
    user_id = current_user['id']
    
    # Default return URL if not provided
    return_url = portal_request.return_url or f"{settings.frontend_url}/dashboard"
    
    try:
        portal_url = await stripe_service.create_portal_session(
            user_id=user_id,
            return_url=return_url,
            db=db
        )
        
        return PortalResponse(portal_url=portal_url)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create portal session: {str(e)}"
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
    db: Client = Depends(get_service_db)
):
    """
    Handle Stripe webhook events.
    
    This endpoint receives subscription updates from Stripe and updates user plans accordingly.
    Uses service role client to bypass RLS for admin operations.
    """
    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature header"
        )
    
    # Get raw body
    payload = await request.body()
    
    # Verify webhook signature
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=settings.stripe_webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payload: {str(e)}"
        )
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid signature: {str(e)}"
        )
    
    # Handle the event
    try:
        await stripe_service.handle_webhook_event(event, db)
        return {"status": "success"}
    
    except Exception as e:
        # Return 500 so Stripe retries the webhook delivery
        print(f"Error handling webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing error: {str(e)}"
        )
