"""Stripe billing integration router."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request

from dependencies import get_current_user
from config import settings
from schemas.billing import (
    CheckoutRequest,
    CheckoutResponse,
    PortalResponse,
    SeatSummaryResponse,
    SeatUpdateRequest,
    SeatUpdateResponse,
    SeatInviteRequest,
    SeatInviteResponse,
)
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




def _seats_for_plan(plan: str) -> int:
    p = (plan or "free").lower()
    return {
        "free": 1,
        "pro": 1,
        "quality": 3,
        "team": 3,
        "enterprise": 10,
    }.get(p, 1)


@router.get("/seats", response_model=SeatSummaryResponse)
@router.get("/api/billing/seats", response_model=SeatSummaryResponse, include_in_schema=False)
async def get_seat_summary(user: dict = Depends(get_current_user)):
    plan = (user.get("plan") or "free").lower()
    included = _seats_for_plan(plan)
    used = max(1, int(user.get("team_members_count") or 1))
    return SeatSummaryResponse(
        plan=plan,
        seats_included=included,
        seats_used=used,
        seats_available=max(0, included - used),
    )


@router.post("/seats", response_model=SeatUpdateResponse)
@router.post("/api/billing/seats", response_model=SeatUpdateResponse, include_in_schema=False)
async def update_seats(
    data: SeatUpdateRequest,
    user: dict = Depends(get_current_user),
):
    if data.seats < 1:
        raise HTTPException(status_code=400, detail="seats must be >= 1")

    try:
        checkout_url = create_checkout_session(
            user=user,
            # Use Team price for seat scaling by default.
            price_id=settings.stripe_price_id_team,
            success_url=data.success_url,
            cancel_url=data.cancel_url,
            quantity=data.seats,
        )
        return SeatUpdateResponse(checkout_url=checkout_url)
    except Exception as e:
        logger.exception(f"Seat update checkout failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create seat update checkout")


@router.post("/seats/invite", response_model=SeatInviteResponse)
@router.post("/api/billing/seats/invite", response_model=SeatInviteResponse, include_in_schema=False)
async def invite_seat_member(
    data: SeatInviteRequest,
    user: dict = Depends(get_current_user),
):
    # Contract façade endpoint: invites are handled by app-level notification/email flow.
    # For now return accepted and let frontend orchestrate actual invite messaging.
    if "@" not in data.email:
        raise HTTPException(status_code=400, detail="invalid email")
    return SeatInviteResponse(ok=True, invited_email=data.email, role=data.role or "member")


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
