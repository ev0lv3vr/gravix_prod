"""Stripe billing integration router."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from dependencies import get_current_user
from schemas.billing import CheckoutRequest, CheckoutResponse, PortalResponse
from services.stripe_service import (
    create_checkout_session,
    create_portal_session,
    handle_webhook,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    data: CheckoutRequest,
    user: dict = Depends(get_current_user),
):
    """Create a Stripe checkout session for subscription."""
    try:
        checkout_url = create_checkout_session(
            user=user,
            price_id=data.price_id,
            success_url=data.success_url,
            cancel_url=data.cancel_url,
        )
        return CheckoutResponse(checkout_url=checkout_url)
    except Exception as e:
        logger.exception(f"Checkout session creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


@router.post("/portal", response_model=PortalResponse)
async def create_billing_portal(
    user: dict = Depends(get_current_user),
):
    """Create a Stripe billing portal session."""
    try:
        portal_url = create_portal_session(user)
        return PortalResponse(portal_url=portal_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception(f"Portal session creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create portal session")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        result = handle_webhook(payload, sig_header)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception(f"Webhook handling failed: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")
