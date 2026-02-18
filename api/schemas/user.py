"""Schemas for user profile and usage."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserProfile(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    plan: str = "free"
    analyses_this_month: int = 0
    specs_this_month: int = 0
    analyses_reset_date: Optional[datetime] = None
    specs_reset_date: Optional[datetime] = None
    stripe_customer_id: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None


class UsageResponse(BaseModel):
    analyses_used: int
    analyses_limit: int
    specs_used: int
    specs_limit: int
    plan: str
    reset_date: Optional[datetime] = None


class DeleteAccountResponse(BaseModel):
    status: str = "deleted"
