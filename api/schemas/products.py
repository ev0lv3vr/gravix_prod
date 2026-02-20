"""Schemas for product specifications and TDS extraction."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ProductSpecificationCreate(BaseModel):
    product_name: str
    manufacturer: Optional[str] = None
    chemistry_type: Optional[str] = None
    recommended_substrates: Optional[List[str]] = []
    surface_prep_requirements: Optional[str] = None
    cure_schedule: Optional[Dict[str, Any]] = {}
    operating_temp_min_c: Optional[float] = None
    operating_temp_max_c: Optional[float] = None
    mechanical_properties: Optional[Dict[str, Any]] = {}
    shelf_life_months: Optional[int] = None
    mix_ratio: Optional[str] = None
    pot_life_minutes: Optional[int] = None
    fixture_time_minutes: Optional[int] = None
    tds_file_url: Optional[str] = None
    extraction_confidence: Optional[Dict[str, Any]] = {}
    manufacturer_claimed: Optional[bool] = False


class ProductSpecificationUpdate(BaseModel):
    product_name: Optional[str] = None
    manufacturer: Optional[str] = None
    chemistry_type: Optional[str] = None
    recommended_substrates: Optional[List[str]] = None
    surface_prep_requirements: Optional[str] = None
    cure_schedule: Optional[Dict[str, Any]] = None
    operating_temp_min_c: Optional[float] = None
    operating_temp_max_c: Optional[float] = None
    mechanical_properties: Optional[Dict[str, Any]] = None
    shelf_life_months: Optional[int] = None
    mix_ratio: Optional[str] = None
    pot_life_minutes: Optional[int] = None
    fixture_time_minutes: Optional[int] = None
    tds_file_url: Optional[str] = None
    extraction_confidence: Optional[Dict[str, Any]] = None
    manufacturer_claimed: Optional[bool] = None


class ProductSpecificationResponse(BaseModel):
    id: str
    product_name: str
    manufacturer: Optional[str] = None
    chemistry_type: Optional[str] = None
    recommended_substrates: Optional[List[str]] = []
    surface_prep_requirements: Optional[str] = None
    cure_schedule: Optional[Dict[str, Any]] = {}
    operating_temp_min_c: Optional[float] = None
    operating_temp_max_c: Optional[float] = None
    mechanical_properties: Optional[Dict[str, Any]] = {}
    shelf_life_months: Optional[int] = None
    mix_ratio: Optional[str] = None
    pot_life_minutes: Optional[int] = None
    fixture_time_minutes: Optional[int] = None
    tds_file_url: Optional[str] = None
    extraction_confidence: Optional[Dict[str, Any]] = {}
    manufacturer_claimed: Optional[bool] = False
    # Quality+ gated fields (public detail endpoint redacts for non-Quality tiers)
    field_failure_rate: Optional[float] = None
    common_failure_modes: Optional[List[str]] = []
    field_data: Optional[Dict[str, Any]] = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TDSExtractionResponse(BaseModel):
    product: ProductSpecificationResponse
    extraction_confidence: Dict[str, Any] = {}
    message: str = "TDS extraction complete"
