"""Feedback CRUD router."""

import logging
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import get_current_user
from database import get_supabase
from schemas.feedback import (
    FeedbackCreate,
    FeedbackCreateResponse,
    FeedbackResponse,
    PendingFeedbackItem,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["feedback"])


@router.post("", response_model=FeedbackCreateResponse)
async def create_or_update_feedback(
    data: FeedbackCreate,
    user: dict = Depends(get_current_user),
):
    """Create or upsert feedback for an analysis or spec."""
    db = get_supabase()
    user_id = user["id"]

    # Verify ownership of the target analysis/spec
    if data.analysis_id:
        result = (
            db.table("failure_analyses")
            .select("id, user_id")
            .eq("id", data.analysis_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Analysis not found")
        if result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not your analysis")
    elif data.spec_id:
        result = (
            db.table("spec_requests")
            .select("id, user_id")
            .eq("id", data.spec_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Spec not found")
        if result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not your spec")

    now = datetime.now(timezone.utc).isoformat()
    payload = data.model_dump(exclude_none=True, mode="json")
    payload.pop("feedback_source", None)

    # Check for existing feedback (upsert)
    existing_q = db.table("analysis_feedback").select("id").eq("user_id", user_id)
    if data.analysis_id:
        existing_q = existing_q.eq("analysis_id", data.analysis_id)
    else:
        existing_q = existing_q.eq("spec_id", data.spec_id)
    existing = existing_q.execute()

    if existing.data:
        feedback_id = existing.data[0]["id"]
        db.table("analysis_feedback").update({
            **payload,
            "feedback_source": data.feedback_source.value if data.feedback_source else "in_app",
            "updated_at": now,
        }).eq("id", feedback_id).execute()
    else:
        feedback_id = str(uuid.uuid4())
        record = {
            "id": feedback_id,
            "user_id": user_id,
            **payload,
            "feedback_source": data.feedback_source.value if data.feedback_source else "in_app",
            "created_at": now,
            "updated_at": now,
        }
        db.table("analysis_feedback").insert(record).execute()

    # Count how many feedback entries exist for similar analyses (cases_improved)
    cases_improved = 0
    try:
        count_result = (
            db.table("analysis_feedback")
            .select("id", count="exact")
            .eq("was_helpful", True)
            .execute()
        )
        cases_improved = count_result.count or 0
    except Exception:
        pass

    return FeedbackCreateResponse(
        id=feedback_id,
        message="Feedback saved successfully",
        cases_improved=cases_improved,
    )


@router.get("/pending/list", response_model=list[PendingFeedbackItem])
async def list_pending_feedback(
    user: dict = Depends(get_current_user),
):
    """Get analyses >24h old with no feedback for the current user."""
    db = get_supabase()
    user_id = user["id"]
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()

    # Get all completed analyses older than 24h
    analyses_result = (
        db.table("failure_analyses")
        .select("id, material_category, failure_mode, substrate_a, substrate_b, created_at, status")
        .eq("user_id", user_id)
        .eq("status", "completed")
        .lt("created_at", cutoff)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )

    if not analyses_result.data:
        return []

    # Get all feedback for this user's analyses
    analysis_ids = [a["id"] for a in analyses_result.data]
    feedback_result = (
        db.table("analysis_feedback")
        .select("analysis_id")
        .eq("user_id", user_id)
        .in_("analysis_id", analysis_ids)
        .execute()
    )

    feedback_ids = {f["analysis_id"] for f in feedback_result.data}

    # Return analyses without feedback
    pending = []
    for a in analyses_result.data:
        if a["id"] not in feedback_ids:
            pending.append(
                PendingFeedbackItem(
                    analysis_id=a["id"],
                    material_category=a.get("material_category"),
                    failure_mode=a.get("failure_mode"),
                    substrate_a=a.get("substrate_a"),
                    substrate_b=a.get("substrate_b"),
                    created_at=a.get("created_at"),
                    status=a.get("status"),
                )
            )

    return pending


@router.get("/{analysis_id}", response_model=FeedbackResponse)
async def get_feedback(
    analysis_id: str,
    user: dict = Depends(get_current_user),
):
    """Get feedback for a specific analysis."""
    db = get_supabase()

    result = (
        db.table("analysis_feedback")
        .select("*")
        .eq("analysis_id", analysis_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Feedback not found")

    return FeedbackResponse(**result.data[0])
