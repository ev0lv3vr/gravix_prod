"""Schemas for the public case library."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CaseListItem(BaseModel):
    id: str
    title: str
    summary: Optional[str] = None
    material_category: str
    material_subcategory: Optional[str] = None
    failure_mode: str
    root_cause: Optional[str] = None
    industry: Optional[str] = None
    tags: Optional[List[str]] = None
    views: int = 0
    helpful_votes: int = 0
    is_featured: bool = False
    slug: Optional[str] = None
    created_at: Optional[datetime] = None


class CaseDetail(CaseListItem):
    source_analysis_id: Optional[str] = None
    contributing_factors: Optional[List[str]] = None
    solution: Optional[str] = None
    prevention_tips: Optional[str] = None
    lessons_learned: Optional[str] = None
    application_type: Optional[str] = None
    meta_description: Optional[str] = None
    updated_at: Optional[datetime] = None
