"""
Billing and subscription Pydantic schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional


class CheckoutRequest(BaseModel):
    """Request to create Stripe checkout session.
    
    Accepts either a direct price_id or a tier name (pro/team).
    If tier is provided, the server resolves it to the correct price_id.
    """
    price_id: Optional[str] = Field(None, description="Stripe price ID for the plan")
    tier: Optional[str] = Field(None, description="Plan tier name: 'pro' or 'team'")
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
