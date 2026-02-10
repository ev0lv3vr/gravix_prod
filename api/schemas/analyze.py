"""
Failure analysis Pydantic schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class RootCause(BaseModel):
    """Individual root cause with confidence score."""
    cause: str
    category: str  # surface_prep, material_compatibility, application, cure, environmental
    confidence: float = Field(ge=0.0, le=1.0)
    explanation: str
    evidence: List[str] = []


class Recommendation(BaseModel):
    """Recommendation for fixing or preventing failure."""
    title: str
    description: str
    priority: str  # immediate, short_term, long_term
    implementation_steps: List[str] = []


class FailureAnalysisCreate(BaseModel):
    """Request body for creating failure analysis."""
    
    # Material information
    material_category: str = Field(..., description="adhesive, sealant, or coating")
    material_subcategory: Optional[str] = Field(None, description="e.g., cyanoacrylate, epoxy")
    material_product: Optional[str] = Field(None, description="Specific product name if known")
    
    # Failure details
    failure_mode: str = Field(..., description="e.g., debonding, cracking, discoloration")
    failure_description: str = Field(..., min_length=10, description="Detailed description")
    
    # Substrate information
    substrate_a: Optional[str] = Field(None, description="Primary substrate material")
    substrate_b: Optional[str] = Field(None, description="Secondary substrate material")
    
    # Environmental conditions
    temperature_range: Optional[str] = None
    humidity: Optional[str] = None
    chemical_exposure: Optional[str] = None
    
    # Application details
    time_to_failure: Optional[str] = None
    application_method: Optional[str] = None
    surface_preparation: Optional[str] = None
    cure_conditions: Optional[str] = None
    
    # Additional data
    additional_notes: Optional[str] = None
    test_results: Optional[str] = None


class FailureAnalysisResponse(BaseModel):
    """Full response for failure analysis."""
    id: str
    user_id: str
    
    # Input fields (echo back)
    material_category: str
    material_subcategory: Optional[str]
    material_product: Optional[str]
    failure_mode: str
    failure_description: str
    substrate_a: Optional[str]
    substrate_b: Optional[str]
    temperature_range: Optional[str]
    humidity: Optional[str]
    chemical_exposure: Optional[str]
    time_to_failure: Optional[str]
    application_method: Optional[str]
    surface_preparation: Optional[str]
    cure_conditions: Optional[str]
    additional_notes: Optional[str]
    test_results: Optional[str]
    
    # Analysis results
    root_causes: List[RootCause]
    contributing_factors: List[str]
    recommendations: List[Recommendation]
    prevention_plan: str
    similar_cases: List[Dict[str, Any]] = []
    confidence_score: float
    
    # Metadata
    status: str
    ai_model_version: Optional[str]
    processing_time_ms: Optional[int]
    created_at: datetime
    updated_at: datetime


class FailureAnalysisListItem(BaseModel):
    """Simplified failure analysis for list views."""
    id: str
    material_category: str
    material_subcategory: Optional[str]
    failure_mode: str
    confidence_score: float
    status: str
    created_at: datetime


class FailureAnalysisSummary(BaseModel):
    """Brief summary of analysis (for dashboard)."""
    id: str
    failure_mode: str
    top_root_cause: str
    confidence: float
    created_at: datetime
