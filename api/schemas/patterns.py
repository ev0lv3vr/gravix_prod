"""Schemas for pattern detection and alerts."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class PatternAlertResponse(BaseModel):
    id: str
    alert_type: str
    severity: str = "informational"
    title: str
    description: Optional[str] = None
    affected_product: Optional[str] = None
    affected_substrate: Optional[str] = None
    failure_mode: Optional[str] = None
    statistical_confidence: Optional[float] = None
    affected_investigation_ids: List[str] = []
    ai_explanation: Optional[str] = None
    status: str = "active"
    created_at: Optional[datetime] = None


class PatternAlertUpdate(BaseModel):
    status: str = Field(..., pattern="^(active|acknowledged|resolved)$")


class PatternDetectionResult(BaseModel):
    alerts_created: int = 0
    patterns_checked: int = 0
    message: str = "Pattern detection complete"
