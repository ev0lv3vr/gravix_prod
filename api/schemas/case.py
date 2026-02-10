"""
Case library Pydantic schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CaseListItem(BaseModel):
    """Case library item for list views."""
    id: str
    slug: str
    title: str
    summary: Optional[str]
    material_category: str
    material_subcategory: Optional[str]
    failure_mode: str
    root_cause: Optional[str]
    industry: Optional[str]
    tags: List[str] = []
    views: int = 0
    helpful_votes: int = 0
    is_featured: bool = False
    created_at: datetime


class CaseDetail(BaseModel):
    """Full case details."""
    id: str
    slug: str
    title: str
    summary: Optional[str]
    
    # Categorization
    material_category: str
    material_subcategory: Optional[str]
    failure_mode: str
    industry: Optional[str]
    application_type: Optional[str]
    tags: List[str] = []
    
    # Content
    root_cause: Optional[str]
    contributing_factors: List[str] = []
    solution: Optional[str]
    prevention_tips: Optional[str]
    lessons_learned: Optional[str]
    
    # Engagement
    views: int = 0
    helpful_votes: int = 0
    is_featured: bool = False
    
    # Metadata
    created_at: datetime
    updated_at: datetime


class CaseSearchFilters(BaseModel):
    """Filters for searching case library."""
    material_category: Optional[str] = None
    material_subcategory: Optional[str] = None
    failure_mode: Optional[str] = None
    industry: Optional[str] = None
    tag: Optional[str] = None
    search_query: Optional[str] = None
