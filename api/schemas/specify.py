"""
Material specification Pydantic schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class BondRequirements(BaseModel):
    """Bond performance requirements."""
    shear_strength: Optional[str] = None
    tensile_strength: Optional[str] = None
    peel_strength: Optional[str] = None
    flexibility_required: Optional[bool] = None
    gap_fill: Optional[str] = None
    other_requirements: Optional[str] = None


class EnvironmentalConditions(BaseModel):
    """Operating environment specifications."""
    temp_min: Optional[str] = None
    temp_max: Optional[str] = None
    humidity: Optional[str] = None
    chemical_exposure: Optional[List[str]] = None
    uv_exposure: Optional[bool] = None
    outdoor_use: Optional[bool] = None


class CureConstraints(BaseModel):
    """Cure method and time constraints."""
    max_cure_time: Optional[str] = None
    preferred_method: Optional[str] = None  # room_temp, heat, uv, two_part
    heat_available: Optional[bool] = None
    uv_available: Optional[bool] = None
    max_temperature: Optional[str] = None


class RecommendedSpec(BaseModel):
    """AI-generated material specification."""
    material_type: str
    chemistry: str
    subcategory: str
    rationale: str


class ProductCharacteristics(BaseModel):
    """Expected product characteristics."""
    viscosity_range: Optional[str] = None
    color: Optional[str] = None
    cure_time: Optional[str] = None
    expected_strength: Optional[str] = None
    temperature_resistance: Optional[str] = None
    flexibility: Optional[str] = None
    gap_fill_capability: Optional[str] = None


class ApplicationGuidance(BaseModel):
    """How to apply the specified material."""
    surface_preparation: List[str] = []
    application_tips: List[str] = []
    curing_notes: List[str] = []
    common_mistakes_to_avoid: List[str] = []


class AlternativeApproach(BaseModel):
    """Alternative material approach with trade-offs."""
    material_type: str
    chemistry: str
    advantages: List[str]
    disadvantages: List[str]
    when_to_use: str


class SpecRequestCreate(BaseModel):
    """Request body for creating material specification."""
    
    # Material category
    material_category: str = Field(..., description="adhesive, sealant, or coating")
    
    # Substrate information
    substrate_a: str = Field(..., description="Primary substrate material")
    substrate_b: str = Field(..., description="Secondary substrate material")
    
    # Requirements
    bond_requirements: BondRequirements
    environment: EnvironmentalConditions
    cure_constraints: CureConstraints
    
    # Production details
    production_volume: Optional[str] = Field(None, description="low, medium, high")
    application_method: Optional[str] = Field(None, description="manual, automated, robotic")
    
    # Additional context
    additional_requirements: Optional[str] = None


class SpecRequestResponse(BaseModel):
    """Full response for specification request."""
    id: str
    user_id: str
    
    # Input fields (echo back)
    material_category: str
    substrate_a: str
    substrate_b: str
    bond_requirements: Dict[str, Any]
    environment: Dict[str, Any]
    cure_constraints: Dict[str, Any]
    production_volume: Optional[str]
    application_method: Optional[str]
    additional_requirements: Optional[str]
    
    # Specification results
    recommended_spec: RecommendedSpec
    product_characteristics: ProductCharacteristics
    application_guidance: ApplicationGuidance
    warnings: List[str]
    alternatives: List[AlternativeApproach]
    
    # Metadata
    status: str
    ai_model_version: Optional[str]
    processing_time_ms: Optional[int]
    created_at: datetime
    updated_at: datetime


class SpecRequestListItem(BaseModel):
    """Simplified spec request for list views."""
    id: str
    material_category: str
    substrate_a: str
    substrate_b: str
    recommended_material_type: Optional[str]
    status: str
    created_at: datetime


class SpecRequestSummary(BaseModel):
    """Brief summary of spec (for dashboard)."""
    id: str
    substrate_a: str
    substrate_b: str
    recommended_material: str
    created_at: datetime
