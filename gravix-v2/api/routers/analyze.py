"""Failure analysis CRUD router."""

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user
from database import get_supabase
from schemas.analyze import (
    FailureAnalysisCreate,
    FailureAnalysisResponse,
    FailureAnalysisListItem,
)
from services.ai_engine import analyze_failure
from services.usage_service import can_use_analysis, increment_analysis_usage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["analysis"])


@router.post("", response_model=FailureAnalysisResponse)
async def create_analysis(
    data: FailureAnalysisCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new failure analysis."""
    # Check usage limits
    if not can_use_analysis(user):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Monthly analysis limit reached. Upgrade your plan for unlimited analyses.",
        )

    db = get_supabase()
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Create record
    record = {
        "id": analysis_id,
        "user_id": user["id"],
        "status": "processing",
        "created_at": now,
        "updated_at": now,
        **data.model_dump(exclude_none=True),
    }

    db.table("failure_analyses").insert(record).execute()

    # Run AI analysis
    try:
        ai_result = await analyze_failure(data.model_dump(exclude_none=True))

        # Update record with results
        update_data = {
            "root_causes": ai_result.get("root_causes", []),
            "contributing_factors": ai_result.get("contributing_factors", []),
            "recommendations": ai_result.get("recommendations", []),
            "prevention_plan": ai_result.get("prevention_plan", ""),
            "confidence_score": ai_result.get("confidence_score", 0.0),
            "status": "completed",
            "processing_time_ms": ai_result.get("processing_time_ms"),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        db.table("failure_analyses").update(update_data).eq("id", analysis_id).execute()
        record.update(update_data)

        # Increment usage
        increment_analysis_usage(user["id"])

    except Exception as e:
        logger.exception(f"Analysis failed: {e}")
        db.table("failure_analyses").update(
            {"status": "failed", "updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", analysis_id).execute()
        record["status"] = "failed"

    return FailureAnalysisResponse(**record)


@router.get("", response_model=list[FailureAnalysisListItem])
async def list_analyses(user: dict = Depends(get_current_user)):
    """List all analyses for the current user."""
    db = get_supabase()
    result = (
        db.table("failure_analyses")
        .select("id, material_category, material_subcategory, failure_mode, confidence_score, status, created_at")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return [FailureAnalysisListItem(**item) for item in result.data]


@router.get("/{analysis_id}", response_model=FailureAnalysisResponse)
async def get_analysis(
    analysis_id: str,
    user: dict = Depends(get_current_user),
):
    """Get a specific analysis by ID."""
    db = get_supabase()
    result = (
        db.table("failure_analyses")
        .select("*")
        .eq("id", analysis_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return FailureAnalysisResponse(**result.data[0])
