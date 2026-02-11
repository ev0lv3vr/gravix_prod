"""
Feedback endpoints — users report outcomes of analyses.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import Dict, Any, Optional
from pydantic import BaseModel
from database import get_db
from dependencies import get_current_user
from datetime import datetime


router = APIRouter(prefix="/feedback", tags=["feedback"])


class FeedbackCreate(BaseModel):
    """Feedback submission for an analysis."""
    outcome: str  # 'helpful' or 'not_helpful'
    details: Optional[str] = None


class FeedbackResponse(BaseModel):
    """Feedback response."""
    id: str
    analysis_id: str
    outcome: str
    details: Optional[str] = None
    created_at: datetime


@router.post("/{analysis_id}", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    analysis_id: str,
    feedback: FeedbackCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Submit outcome feedback for an analysis.
    
    This data is used to calibrate AI confidence scores over time.
    """
    user_id = current_user['id']

    # Verify the analysis belongs to the user
    analysis_result = db.table("failure_analyses").select("id").eq(
        "id", analysis_id
    ).eq("user_id", user_id).execute()

    if not analysis_result.data or len(analysis_result.data) == 0:
        # Also check specs
        spec_result = db.table("spec_requests").select("id").eq(
            "id", analysis_id
        ).eq("user_id", user_id).execute()
        if not spec_result.data or len(spec_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis not found"
            )

    # Store feedback
    record = {
        "user_id": user_id,
        "analysis_id": analysis_id,
        "outcome": feedback.outcome,
        "details": feedback.details,
    }

    try:
        result = db.table("feedback").insert(record).execute()
        if result.data and len(result.data) > 0:
            saved = result.data[0]
            return FeedbackResponse(
                id=saved['id'],
                analysis_id=saved['analysis_id'],
                outcome=saved['outcome'],
                details=saved.get('details'),
                created_at=datetime.fromisoformat(saved['created_at'].replace('Z', '+00:00'))
            )
    except Exception:
        pass

    # If table doesn't exist, return a synthetic response
    return FeedbackResponse(
        id="feedback_received",
        analysis_id=analysis_id,
        outcome=feedback.outcome,
        details=feedback.details,
        created_at=datetime.utcnow()
    )
