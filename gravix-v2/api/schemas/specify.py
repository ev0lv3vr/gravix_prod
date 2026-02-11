"""Schemas for spec engine."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BondRequirements(BaseModel):
    shear_strength: Optional[str] = None
    tensile_strength: Optional[str] = None
    peel_strength: Optional[str] = None
    flexibility_required: bool = False
    gap_fill: Optional[str] = None
    other_requirements: Optional[str] = None


class EnvironmentalConditions(BaseModel):
    temp_min: Optional[str] = None
    temp_max: Optional[str] = None
    humidity: Optional[str] = None
    chemical_exposure: Optional[List[str]] = None
    uv_exposure: bool = False
    outdoor_use: bool = False


class CureConstraints(BaseModel):
    max_cure_time: Optional[str] = None
    preferred_method: Optional[str] = None
    heat_available: Optional[bool] = None
    uv_available: Optional[bool] = None
    max_temperature: Optional[str] = None


class SpecRequestCreate(BaseModel):
    material_category: str
    substrate_a: str
    substrate_b: str
    bond_requirements: Optional[BondRequirements] = None
    environment: Optional[EnvironmentalConditions] = None
    cure_constraints: Optional[CureConstraints] = None
    production_volume: Optional[str] = None
    application_method: Optional[str] = None
    additional_requirements: Optional[str] = None


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
    additional_requirements: Optional[str] = None
    recommended_spec: Optional[dict] = None
    product_characteristics: Optional[dict] = None
    application_guidance: Optional[dict] = None
    warnings: Optional[List[str]] = None
    alternatives: Optional[List[dict]] = None
    confidence_score: Optional[float] = None
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
