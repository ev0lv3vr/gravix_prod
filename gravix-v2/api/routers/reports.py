"""PDF report generation router."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response

from dependencies import get_current_user
from database import get_supabase
from services.pdf_generator import generate_analysis_pdf, generate_spec_pdf

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/analysis/{analysis_id}/pdf")
async def download_analysis_pdf(
    analysis_id: str,
    user: dict = Depends(get_current_user),
):
    """Generate and download a PDF report for a failure analysis."""
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

    analysis = result.data[0]
    if analysis.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Analysis is not yet completed")

    is_free = user.get("plan", "free") == "free"
    pdf_bytes = generate_analysis_pdf(analysis, is_free=is_free)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="gravix-analysis-{analysis_id[:8]}.pdf"'
        },
    )


@router.get("/spec/{spec_id}/pdf")
async def download_spec_pdf(
    spec_id: str,
    user: dict = Depends(get_current_user),
):
    """Generate and download a PDF report for a spec request."""
    db = get_supabase()
    result = (
        db.table("spec_requests")
        .select("*")
        .eq("id", spec_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Spec request not found")

    spec = result.data[0]
    if spec.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Spec is not yet completed")

    is_free = user.get("plan", "free") == "free"
    pdf_bytes = generate_spec_pdf(spec, is_free=is_free)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="gravix-spec-{spec_id[:8]}.pdf"'
        },
    )
