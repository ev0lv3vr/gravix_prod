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


class SeatSummaryResponse(BaseModel):
    plan: str
    seats_included: int
    seats_used: int
    seats_available: int


class SeatUpdateRequest(BaseModel):
    seats: int
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class SeatUpdateResponse(BaseModel):
    checkout_url: str


class SeatInviteRequest(BaseModel):
    email: str
    role: Optional[str] = "member"


class SeatInviteResponse(BaseModel):
    ok: bool
    invited_email: str
    role: str
