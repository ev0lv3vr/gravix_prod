"""Schemas for investigation comment system."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CommentCreate(BaseModel):
    discipline: str = Field(..., pattern="^(D1|D2|D3|D4|D5|D6|D7|D8)$")
    comment_text: str = Field(..., min_length=1, max_length=5000)
    parent_comment_id: Optional[str] = None


class CommentUpdate(BaseModel):
    comment_text: str = Field(..., min_length=1, max_length=5000)


class CommentResponse(BaseModel):
    id: str
    investigation_id: str
    parent_comment_id: Optional[str] = None
    discipline: str
    user_id: str
    comment_text: str
    is_resolution: bool = False
    is_pinned: bool = False
    created_at: datetime
    updated_at: datetime


class CommentToggleResponse(BaseModel):
    id: str
    is_pinned: bool
    is_resolution: bool
