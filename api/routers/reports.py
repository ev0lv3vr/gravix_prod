"""
PDF report generation endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from supabase import Client
from typing import Dict, Any
from database import get_db
from dependencies import get_current_user
from services.pdf_generator import pdf_generator


router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/analysis/{analysis_id}")
async def generate_analysis_report(
    analysis_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Generate PDF report for failure analysis.
    
    Returns PDF file as downloadable attachment.
    """
    user_id = current_user['id']
    
    # Fetch analysis
    result = db.table("failure_analyses").select("*").eq("id", analysis_id).eq("user_id", user_id).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    analysis = result.data[0]
    
    # Generate PDF
    try:
        pdf_buffer = pdf_generator.generate_failure_analysis_report(analysis)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )
    
    # Return as downloadable file
    filename = f"gravix_failure_analysis_{analysis_id[:8]}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.post("/spec/{spec_id}")
async def generate_spec_report(
    spec_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Generate PDF report for material specification.
    
    Returns PDF file as downloadable attachment.
    """
    user_id = current_user['id']
    
    # Fetch spec
    result = db.table("spec_requests").select("*").eq("id", spec_id).eq("user_id", user_id).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specification not found"
        )
    
    spec = result.data[0]
    
    # Generate PDF
    try:
        pdf_buffer = pdf_generator.generate_spec_report(spec)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )
    
    # Return as downloadable file
    filename = f"gravix_material_spec_{spec_id[:8]}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
