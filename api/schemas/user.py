"""
User-related Pydantic schemas.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date


class UserProfile(BaseModel):
    """User profile response."""
    id: str
    email: EmailStr
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    plan: str = "free"
    analyses_this_month: int = 0
    specs_this_month: int = 0
    analyses_reset_date: Optional[date] = None
    specs_reset_date: Optional[date] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    """User profile update request."""
    name: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = Field(None, max_length=255)


class UsageResponse(BaseModel):
    """User usage statistics response."""
    plan: str
    analyses_used: int
    analyses_limit: int
    analyses_remaining: int
    specs_used: int
    specs_limit: int
    specs_remaining: int
    reset_date: date
