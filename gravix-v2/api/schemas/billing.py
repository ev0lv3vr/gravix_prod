"""Schemas for billing and Stripe integration."""

from pydantic import BaseModel
from typing import Optional


class CheckoutRequest(BaseModel):
    price_id: Optional[str] = None
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    checkout_url: str


class PortalResponse(BaseModel):
    portal_url: str
