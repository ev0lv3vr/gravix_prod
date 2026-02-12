"""Stripe billing integration."""

import logging

import stripe

from config import settings
from database import get_supabase

logger = logging.getLogger(__name__)

stripe.api_key = settings.stripe_secret_key


def cancel_active_subscriptions(user: dict) -> list[str]:
    """Cancel any active Stripe subscriptions for a user.

    Returns a list of cancelled subscription IDs.

    Best-effort: if Stripe isn't configured or the user has no customer,
    returns an empty list.
    """

    if not settings.stripe_secret_key:
        return []

    customer_id = user.get("stripe_customer_id")
    if not customer_id:
        return []

    cancelled: list[str] = []

    subs = stripe.Subscription.list(customer=customer_id, status="all", limit=20)
    for sub in subs.data or []:
        status = (sub.get("status") if isinstance(sub, dict) else getattr(sub, "status", None))
        sub_id = (sub.get("id") if isinstance(sub, dict) else getattr(sub, "id", None))
        if not sub_id:
            continue

        # Cancel only active-ish subscriptions
        if status in ("active", "trialing", "past_due", "unpaid"):
            stripe.Subscription.delete(sub_id)
            cancelled.append(sub_id)

    return cancelled


def create_checkout_session(
    user: dict,
    price_id: str | None = None,
    success_url: str | None = None,
    cancel_url: str | None = None,
) -> str:
    """Create a Stripe checkout session. Returns the checkout URL."""
    # Use provided price_id or default to pro
    if not price_id:
        price_id = settings.stripe_price_id_pro

    # Get or create Stripe customer
    customer_id = user.get("stripe_customer_id")
    if not customer_id:
        customer = stripe.Customer.create(
            email=user.get("email", ""),
            metadata={"user_id": user["id"]},
        )
        customer_id = customer.id
        # Store customer ID
        db = get_supabase()
        db.table("users").update(
            {"stripe_customer_id": customer_id}
        ).eq("id", user["id"]).execute()

    frontend_url = settings.frontend_url
    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url or f"{frontend_url}/dashboard?checkout=success",
        cancel_url=cancel_url or f"{frontend_url}/pricing?checkout=cancel",
        metadata={"user_id": user["id"]},
    )

    return session.url


def create_portal_session(user: dict) -> str:
    """Create a Stripe billing portal session. Returns the portal URL."""
    customer_id = user.get("stripe_customer_id")
    if not customer_id:
        raise ValueError("User has no Stripe customer ID")

    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.frontend_url}/settings",
    )
    return session.url


def handle_webhook(payload: bytes, sig_header: str) -> dict:
    """Handle Stripe webhook events."""
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except stripe.error.SignatureVerificationError:
        raise ValueError("Invalid webhook signature")

    event_type = event["type"]
    data = event["data"]["object"]

    logger.info(f"Stripe webhook: {event_type}")

    db = get_supabase()

    if event_type == "customer.subscription.created":
        _handle_subscription_change(db, data, active=True)
    elif event_type == "customer.subscription.updated":
        status = data.get("status")
        _handle_subscription_change(db, data, active=(status == "active"))
    elif event_type == "customer.subscription.deleted":
        _handle_subscription_change(db, data, active=False)
    elif event_type == "invoice.payment_succeeded":
        logger.info(f"Payment succeeded for customer {data.get('customer')}")
    elif event_type == "invoice.payment_failed":
        logger.warning(f"Payment failed for customer {data.get('customer')}")
        # Could downgrade user or send notification

    return {"status": "ok", "event_type": event_type}


def _handle_subscription_change(db, subscription: dict, active: bool):
    """Update user plan based on subscription status."""
    customer_id = subscription.get("customer")
    if not customer_id:
        return

    # Find user by stripe customer ID
    result = db.table("users").select("id").eq("stripe_customer_id", customer_id).execute()
    if not result.data:
        logger.warning(f"No user found for Stripe customer {customer_id}")
        return

    user_id = result.data[0]["id"]

    # Determine plan from price ID
    plan = "free"
    if active:
        items = subscription.get("items", {}).get("data", [])
        if items:
            price_id = items[0].get("price", {}).get("id", "")
            if price_id == settings.stripe_price_id_pro:
                plan = "pro"
            elif price_id == settings.stripe_price_id_team:
                plan = "team"
            else:
                plan = "pro"  # Default paid plan

    db.table("users").update({"plan": plan}).eq("id", user_id).execute()
    logger.info(f"Updated user {user_id} to plan: {plan}")
