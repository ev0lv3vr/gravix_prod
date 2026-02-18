"""Schemas for failure analysis.

Sprint 4 (Form Field Expansion): Updated to accept expanded multi-select fields
from the frontend while maintaining backward compatibility with legacy payloads.
"""

from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Union
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
    failure_mode: str  # expanded: now includes "unknown_visual" option
    failure_description: Optional[str] = None
    substrate_a: Optional[str] = None
    substrate_b: Optional[str] = None
    # New structured fields (optional)
    industry: Optional[str] = None  # expanded option list
    production_impact: Optional[str] = None

    temperature_range: Optional[str] = None
    humidity: Optional[str] = None
    # chemical_exposure: accept both str and list[str] for backward compat
    chemical_exposure: Optional[Union[str, List[str]]] = None
    chemical_exposure_detail: Optional[List[str]] = None  # new: ["chem:brake_fluid", ...]
    chemical_exposure_other: Optional[str] = None  # new: free-form
    time_to_failure: Optional[str] = None
    application_method: Optional[str] = None
    # surface_preparation: accept both str and list[str] for backward compat
    surface_preparation: Optional[Union[str, List[str]]] = None
    surface_prep_detail: Optional[str] = None  # new: free-form detail
    cure_conditions: Optional[str] = None
    photos: Optional[List[str]] = None
    test_results: Optional[str] = None
    additional_notes: Optional[str] = None
    # Environment: accept expanded list of env:* tags
    environment: Optional[List[str]] = None  # new: ["env:high_humidity", "env:salt_spray", ...]
    sterilization_methods: Optional[List[str]] = None  # new: ["sterilization:autoclave", ...]

    # Sprint 11: AI-Forward fields
    product_name: Optional[str] = None
    defect_photos: Optional[List[str]] = None

    # Backward compat: accept legacy field name surface_prep → surface_preparation
    surface_prep: Optional[str] = None

    @model_validator(mode="after")
    def _backward_compat(self):
        """Coerce legacy single-value fields into the new format."""
        # surface_prep → surface_preparation
        if self.surface_prep and not self.surface_preparation:
            self.surface_preparation = self.surface_prep
        # Coerce str → list for multi-select fields
        if isinstance(self.surface_preparation, str):
            self.surface_preparation = [self.surface_preparation]
        if isinstance(self.chemical_exposure, str):
            self.chemical_exposure = [self.chemical_exposure]
        return self


class VisualAnalysisResult(BaseModel):
    image_url: str
    failure_mode_classification: Optional[str] = None
    surface_condition: Optional[dict] = None
    bond_line_assessment: Optional[str] = None
    coverage_assessment: Optional[str] = None
    ai_caption: Optional[str] = None
    confidence_score: Optional[float] = None


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
    chemical_exposure: Optional[Union[str, List[str]]] = None
    chemical_exposure_detail: Optional[List[str]] = None
    chemical_exposure_other: Optional[str] = None
    time_to_failure: Optional[str] = None
    application_method: Optional[str] = None
    surface_preparation: Optional[Union[str, List[str]]] = None
    surface_prep_detail: Optional[str] = None
    cure_conditions: Optional[str] = None
    photos: Optional[List[str]] = None
    test_results: Optional[str] = None
    additional_notes: Optional[str] = None
    environment: Optional[List[str]] = None
    sterilization_methods: Optional[List[str]] = None
    root_causes: List[RootCause] = []
    contributing_factors: List[str] = []
    recommendations: List[Recommendation] = []
    prevention_plan: Optional[str] = None
    confidence_score: Optional[float] = None
    knowledge_evidence_count: Optional[int] = None
    status: str = "pending"
    processing_time_ms: Optional[int] = None
    similar_cases: Optional[List[dict]] = None
    # Sprint 11: AI-Forward fields
    product_name: Optional[str] = None
    defect_photos: Optional[List[str]] = None
    visual_analysis: Optional[List[dict]] = None
    known_risks: Optional[List[str]] = None
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
