"""Schemas for report templates."""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TemplateResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    oem_standard: Optional[str] = None
    template_data: Optional[dict] = None
    is_active: bool = True
    created_at: datetime


class TemplateListItem(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    oem_standard: Optional[str] = None
    is_active: bool = True
