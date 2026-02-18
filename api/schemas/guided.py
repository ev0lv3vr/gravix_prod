"""Schemas for guided investigation sessions."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class GuidedSessionStart(BaseModel):
    analysis_id: Optional[str] = None
    initial_context: Optional[Dict[str, Any]] = {}


class GuidedMessage(BaseModel):
    content: str
    photo_urls: Optional[List[str]] = None


class GuidedMessageResponse(BaseModel):
    role: str  # "assistant"
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_results: Optional[List[Dict[str, Any]]] = None
    phase: Optional[str] = None


class GuidedSessionResponse(BaseModel):
    id: str
    user_id: str
    analysis_id: Optional[str] = None
    session_state: Dict[str, Any] = {}
    messages: List[Dict[str, Any]] = []
    status: str = "active"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class GuidedSessionComplete(BaseModel):
    summary: Optional[str] = None
    root_causes: Optional[List[Dict[str, Any]]] = None
    recommendations: Optional[List[str]] = None
    create_investigation: bool = False


class GuidedSessionListItem(BaseModel):
    id: str
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    summary_preview: Optional[str] = None
    message_count: int = 0
