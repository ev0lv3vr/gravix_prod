"""
Case library endpoints (public failure case studies).
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import Optional
from database import get_db
from schemas.case import CaseListItem, CaseDetail
from schemas.common import PaginatedResponse
from datetime import datetime


router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("", response_model=PaginatedResponse[CaseListItem])
async def list_cases(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    material_category: Optional[str] = None,
    material_subcategory: Optional[str] = None,
    failure_mode: Optional[str] = None,
    industry: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    db: Client = Depends(get_db)
):
    """
    List public case library entries.
    
    Supports filtering by material category, subcategory, failure mode, industry, tags, and search query.
    No authentication required (public endpoint).
    """
    # Build query
    query = db.table("case_library").select("*", count="exact")
    
    # Apply filters
    if material_category:
        query = query.eq("material_category", material_category)
    if material_subcategory:
        query = query.eq("material_subcategory", material_subcategory)
    if failure_mode:
        query = query.eq("failure_mode", failure_mode)
    if industry:
        query = query.eq("industry", industry)
    if tag:
        query = query.contains("tags", [tag])
    if search:
        # Search in title and summary
        query = query.or_(f"title.ilike.%{search}%,summary.ilike.%{search}%")
    
    # Get total count
    count_result = query.execute()
    total = count_result.count if count_result.count is not None else 0
    
    # Get paginated results
    offset = (page - 1) * page_size
    result = query.order("created_at", desc=True).range(offset, offset + page_size - 1).execute()
    
    items = [
        CaseListItem(
            id=item['id'],
            slug=item['slug'],
            title=item['title'],
            summary=item.get('summary'),
            material_category=item['material_category'],
            material_subcategory=item.get('material_subcategory'),
            failure_mode=item['failure_mode'],
            root_cause=item.get('root_cause'),
            industry=item.get('industry'),
            tags=item.get('tags', []),
            views=item.get('views', 0),
            helpful_votes=item.get('helpful_votes', 0),
            is_featured=item.get('is_featured', False),
            created_at=datetime.fromisoformat(item['created_at'].replace('Z', '+00:00'))
        )
        for item in result.data
    ]
    
    return PaginatedResponse.create(items, total, page, page_size)


@router.get("/{id_or_slug}", response_model=CaseDetail)
async def get_case(
    id_or_slug: str,
    db: Client = Depends(get_db)
):
    """
    Get specific case by ID or slug.
    
    Returns full case details. Increments view count.
    No authentication required (public endpoint).
    """
    # Try to fetch by ID first, then by slug
    result = db.table("case_library").select("*").eq("id", id_or_slug).execute()
    
    if not result.data or len(result.data) == 0:
        # Try by slug
        result = db.table("case_library").select("*").eq("slug", id_or_slug).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Case not found"
            )
    
    case = result.data[0]
    case_id = case['id']
    
    # Increment view count atomically using RPC if available, otherwise
    # fall back to a simple increment (still a read-then-write but avoids
    # storing stale reads in the response).
    current_views = case.get('views', 0)
    try:
        # Use Supabase RPC for atomic increment if the function exists
        db.rpc("increment_case_views", {"case_id": case_id}).execute()
    except Exception:
        # Fallback: simple update (minor race window under high concurrency)
        db.table("case_library").update({"views": current_views + 1}).eq("id", case_id).execute()
    
    return CaseDetail(
        id=case['id'],
        slug=case['slug'],
        title=case['title'],
        summary=case.get('summary'),
        material_category=case['material_category'],
        material_subcategory=case.get('material_subcategory'),
        failure_mode=case['failure_mode'],
        industry=case.get('industry'),
        application_type=case.get('application_type'),
        tags=case.get('tags', []),
        root_cause=case.get('root_cause'),
        contributing_factors=case.get('contributing_factors', []),
        solution=case.get('solution'),
        prevention_tips=case.get('prevention_tips'),
        lessons_learned=case.get('lessons_learned'),
        views=current_views + 1,
        helpful_votes=case.get('helpful_votes', 0),
        is_featured=case.get('is_featured', False),
        created_at=datetime.fromisoformat(case['created_at'].replace('Z', '+00:00')),
        updated_at=datetime.fromisoformat(case['updated_at'].replace('Z', '+00:00'))
    )
