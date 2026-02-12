"""Schemas for failure analysis."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RootCause(BaseModel):
    cause: str
    category: str
    confidence: float = Field(ge=0, le=1)
    explanation: str
    evidence: List[str] = []


class Recommendation(BaseModel):
    title: str
    description: str
    priority: str
    implementation_steps: List[str] = []


class FailureAnalysisCreate(BaseModel):
    material_category: str
    material_subcategory: Optional[str] = None
    material_product: Optional[str] = None
    failure_mode: str
    failure_description: Optional[str] = None
    substrate_a: Optional[str] = None
    substrate_b: Optional[str] = None
    # New structured fields (optional)
    industry: Optional[str] = None
    production_impact: Optional[str] = None

    temperature_range: Optional[str] = None
    humidity: Optional[str] = None
    chemical_exposure: Optional[str] = None
    time_to_failure: Optional[str] = None
    application_method: Optional[str] = None
    surface_preparation: Optional[str] = None
    cure_conditions: Optional[str] = None
    photos: Optional[List[str]] = None
    test_results: Optional[str] = None
    additional_notes: Optional[str] = None


class FailureAnalysisResponse(BaseModel):
    id: str
    user_id: str
    material_category: str
    material_subcategory: Optional[str] = None
    material_product: Optional[str] = None
    failure_mode: str
    failure_description: Optional[str] = None
    substrate_a: Optional[str] = None
    substrate_b: Optional[str] = None

    # Structured + derived fields
    substrate_a_normalized: Optional[str] = None
    substrate_b_normalized: Optional[str] = None
    industry: Optional[str] = None
    production_impact: Optional[str] = None
    root_cause_category: Optional[str] = None

    temperature_range: Optional[str] = None
    humidity: Optional[str] = None
    chemical_exposure: Optional[str] = None
    time_to_failure: Optional[str] = None
    application_method: Optional[str] = None
    surface_preparation: Optional[str] = None
    cure_conditions: Optional[str] = None
    photos: Optional[List[str]] = None
    test_results: Optional[str] = None
    additional_notes: Optional[str] = None
    root_causes: List[RootCause] = []
    contributing_factors: List[str] = []
    recommendations: List[Recommendation] = []
    prevention_plan: Optional[str] = None
    confidence_score: Optional[float] = None
    status: str = "pending"
    processing_time_ms: Optional[int] = None
    similar_cases: Optional[List[dict]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class FailureAnalysisListItem(BaseModel):
    id: str
    material_category: str
    material_subcategory: Optional[str] = None
    failure_mode: str
    root_cause_category: Optional[str] = None
    confidence_score: Optional[float] = None
    status: str
    created_at: Optional[datetime] = None
