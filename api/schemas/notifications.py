"""Schemas for notification system."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    investigation_id: Optional[str] = None
    notification_type: str
    title: str
    message: Optional[str] = None
    action_url: Optional[str] = None
    is_read: bool = False
    created_at: datetime


class UnreadCountResponse(BaseModel):
    unread_count: int


class NotificationPreferences(BaseModel):
    status_changes: bool = True
    new_comments: bool = True
    action_assigned: bool = True
    action_due_soon: bool = True
    team_member_added: bool = True
    investigation_closed: bool = True
    email_enabled: bool = False


class NotificationPreferencesResponse(BaseModel):
    id: str
    user_id: str
    status_changes: bool = True
    new_comments: bool = True
    action_assigned: bool = True
    action_due_soon: bool = True
    team_member_added: bool = True
    investigation_closed: bool = True
    email_enabled: bool = False
    updated_at: Optional[datetime] = None
