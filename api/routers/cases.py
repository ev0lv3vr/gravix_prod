"""Public case library router."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from dependencies import get_current_user
from middleware.plan_gate import plan_gate
from database import get_supabase
from schemas.case import CaseListItem, CaseDetail

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("", response_model=list[CaseListItem])
async def list_cases(
    response: Response,
    material_category: Optional[str] = Query(None),
    failure_mode: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
):
    """List public cases with optional filters."""
    # Sprint 10.3: Cache case library for 2 minutes
    response.headers["Cache-Control"] = "public, max-age=120"
    
    db = get_supabase()
    query = db.table("cases").select("*")

    if material_category:
        query = query.eq("material_category", material_category)
    if failure_mode:
        query = query.eq("failure_mode", failure_mode)
    if industry:
        query = query.eq("industry", industry)

    result = (
        query.order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    return [CaseListItem(**item) for item in result.data]


@router.get("/{case_id}", response_model=CaseDetail)
async def get_case(
    case_id: str,
    user: dict = Depends(get_current_user),
    _gate: None = Depends(plan_gate("cases.details")),
):
    """Get a specific case by ID or slug."""
    db = get_supabase()

    # Try by ID first
    result = db.table("cases").select("*").eq("id", case_id).execute()

    # If not found, try by slug
    if not result.data:
        result = db.table("cases").select("*").eq("slug", case_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Case not found")

    # Increment view count
    case = result.data[0]
    try:
        db.table("cases").update(
            {"views": case.get("views", 0) + 1}
        ).eq("id", case["id"]).execute()
    except Exception:
        pass  # Non-critical

    return CaseDetail(**case)
