"""Schemas for spec engine.

Sprint 4 (Form Field Expansion): Updated to accept expanded multi-select fields
from the frontend while maintaining backward compatibility with legacy payloads.
"""

from pydantic import BaseModel, model_validator
from typing import Optional, List, Union
from datetime import datetime


class BondRequirements(BaseModel):
    shear_strength: Optional[str] = None
    tensile_strength: Optional[str] = None
    peel_strength: Optional[str] = None
    flexibility_required: bool = False
    gap_fill: Optional[str] = None
    gap_type: Optional[str] = None  # new: gap_type:interference_fit, gap_type:structural, etc.
    load_types: Optional[List[str]] = None  # new: ["load:shear", "load:peel", ...]
    other_requirements: Optional[str] = None

    # Backward compat: accept legacy single string load_type and coerce to list
    load_type: Optional[str] = None

    @model_validator(mode="after")
    def _coerce_load_type(self):
        """If old single load_type provided but load_types is empty, wrap it."""
        if self.load_type and not self.load_types:
            self.load_types = [self.load_type]
        return self


class EnvironmentalConditions(BaseModel):
    temp_min: Optional[str] = None
    temp_max: Optional[str] = None
    humidity: Optional[str] = None
    chemical_exposure: Optional[Union[str, List[str]]] = None
    chemical_exposure_detail: Optional[List[str]] = None  # new: ["chem:brake_fluid", ...]
    chemical_exposure_other: Optional[str] = None  # new: free-form text
    uv_exposure: bool = False
    outdoor_use: bool = False
    conditions: Optional[List[str]] = None  # new: ["env:high_humidity", "env:salt_spray", ...]
    sterilization_methods: Optional[List[str]] = None  # new: ["sterilization:autoclave", ...]

    @model_validator(mode="after")
    def _coerce_chemical_exposure(self):
        """Accept both string and list for chemical_exposure."""
        if isinstance(self.chemical_exposure, str):
            self.chemical_exposure = [self.chemical_exposure]
        return self


class CureConstraints(BaseModel):
    max_cure_time: Optional[str] = None
    preferred_method: Optional[str] = None
    heat_available: Optional[bool] = None
    uv_available: Optional[bool] = None
    max_temperature: Optional[str] = None
    # New multi-select fields
    process_capabilities: Optional[List[str]] = None  # ["cure_constraint:room_temp_only", ...]
    max_cure_temp_c: Optional[int] = None  # new: numeric max cure temp
    uv_shadow_areas: Optional[bool] = None  # new: True if shadow areas exist

    # Backward compat: accept legacy single string cure_constraint
    cure_constraint: Optional[str] = None

    @model_validator(mode="after")
    def _coerce_cure_constraint(self):
        """If old single cure_constraint provided but process_capabilities is empty, wrap it."""
        if self.cure_constraint and not self.process_capabilities:
            self.process_capabilities = [self.cure_constraint]
        return self


class SpecRequestCreate(BaseModel):
    material_category: str
    substrate_a: str
    substrate_b: str
    bond_requirements: Optional[BondRequirements] = None
    environment: Optional[EnvironmentalConditions] = None
    cure_constraints: Optional[CureConstraints] = None
    production_volume: Optional[str] = None
    application_method: Optional[str] = None
    required_fixture_time: Optional[str] = None
    additional_requirements: Optional[str] = None
    product_considered: Optional[str] = None  # new: frontend sends this


class SpecRequestResponse(BaseModel):
    id: str
    user_id: str
    material_category: str
    substrate_a: str
    substrate_b: str
    bond_requirements: Optional[dict] = None
    environment: Optional[dict] = None
    cure_constraints: Optional[dict] = None
    production_volume: Optional[str] = None
    application_method: Optional[str] = None
    required_fixture_time: Optional[str] = None
    additional_requirements: Optional[str] = None
    recommended_spec: Optional[dict] = None
    product_characteristics: Optional[dict] = None
    application_guidance: Optional[dict] = None
    warnings: Optional[List[str]] = None
    alternatives: Optional[List[dict]] = None
    confidence_score: Optional[float] = None
    knowledge_evidence_count: Optional[int] = None
    similar_cases: Optional[List[dict]] = None
    status: str = "pending"
    processing_time_ms: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class SpecRequestListItem(BaseModel):
    id: str
    material_category: str
    substrate_a: str
    substrate_b: str
    confidence_score: Optional[float] = None
    status: str
    created_at: Optional[datetime] = None
