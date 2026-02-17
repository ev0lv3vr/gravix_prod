"""Report templates router — list OEM report templates."""

import logging

from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user
from database import get_supabase
from schemas.templates import TemplateResponse, TemplateListItem

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/templates", tags=["templates"])


@router.get("", response_model=list[TemplateListItem])
async def list_templates(
    user: dict = Depends(get_current_user),
):
    """List available report templates."""
    db = get_supabase()

    result = (
        db.table("report_templates")
        .select("id, name, slug, description, oem_standard, is_active")
        .eq("is_active", True)
        .order("name", desc=False)
        .execute()
    )

    return [TemplateListItem(**item) for item in result.data]


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a single report template by ID."""
    db = get_supabase()

    result = (
        db.table("report_templates")
        .select("*")
        .eq("id", template_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Template not found")

    return TemplateResponse(**result.data[0])
