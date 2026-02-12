"""Schemas for the feedback system."""

from pydantic import BaseModel, Field, model_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class FeedbackOutcome(str, Enum):
    resolved = "resolved"
    partially_resolved = "partially_resolved"
    not_resolved = "not_resolved"
    different_cause = "different_cause"
    still_testing = "still_testing"
    abandoned = "abandoned"


class FeedbackSource(str, Enum):
    in_app = "in_app"
    email = "email"
    api = "api"


class SubstrateCorrection(BaseModel):
    field: str = Field(..., description="Which substrate field to correct (e.g. substrate_a)")
    original: Optional[str] = None
    corrected: str


class FeedbackCreate(BaseModel):
    analysis_id: Optional[str] = None
    spec_id: Optional[str] = None
    was_helpful: bool
    root_cause_confirmed: int = Field(
        default=0,
        ge=0,
        le=5,
        description="Which ranked root cause was correct (1-5), or 0 if none",
    )
    outcome: Optional[FeedbackOutcome] = None
    recommendation_implemented: List[str] = Field(default_factory=list)
    actual_root_cause: Optional[str] = None
    what_worked: Optional[str] = None
    what_didnt_work: Optional[str] = None
    time_to_resolution: Optional[str] = None
    estimated_cost_saved: Optional[float] = None
    substrate_corrections: List[SubstrateCorrection] = Field(default_factory=list)
    feedback_source: FeedbackSource = FeedbackSource.in_app

    @model_validator(mode="after")
    def check_exactly_one_target(self):
        if self.analysis_id and self.spec_id:
            raise ValueError("Provide analysis_id or spec_id, not both")
        if not self.analysis_id and not self.spec_id:
            raise ValueError("Provide either analysis_id or spec_id")
        return self


class FeedbackResponse(BaseModel):
    id: str
    analysis_id: Optional[str] = None
    spec_id: Optional[str] = None
    user_id: str
    was_helpful: bool
    root_cause_confirmed: int = 0
    outcome: Optional[str] = None
    recommendation_implemented: List[str] = []
    actual_root_cause: Optional[str] = None
    what_worked: Optional[str] = None
    what_didnt_work: Optional[str] = None
    time_to_resolution: Optional[str] = None
    estimated_cost_saved: Optional[float] = None
    substrate_corrections: List[dict] = []
    feedback_source: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class FeedbackCreateResponse(BaseModel):
    id: str
    message: str
    cases_improved: int = 0


class PendingFeedbackItem(BaseModel):
    analysis_id: str
    material_category: Optional[str] = None
    failure_mode: Optional[str] = None
    substrate_a: Optional[str] = None
    substrate_b: Optional[str] = None
    created_at: Optional[datetime] = None
    status: Optional[str] = None
