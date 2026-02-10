"""
Billing and subscription Pydantic schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional


class CheckoutRequest(BaseModel):
    """Request to create Stripe checkout session."""
    price_id: str = Field(..., description="Stripe price ID for the plan")
    success_url: Optional[str] = Field(None, description="URL to redirect after successful payment")
    cancel_url: Optional[str] = Field(None, description="URL to redirect if payment canceled")


class CheckoutResponse(BaseModel):
    """Response containing Stripe checkout session URL."""
    session_id: str
    checkout_url: str


class PortalRequest(BaseModel):
    """Request to create Stripe customer portal session."""
    return_url: Optional[str] = Field(None, description="URL to return to after managing subscription")


class PortalResponse(BaseModel):
    """Response containing Stripe portal URL."""
    portal_url: str


class WebhookEvent(BaseModel):
    """Stripe webhook event (for logging/debugging)."""
    type: str
    customer_id: Optional[str] = None
    subscription_id: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
