"""
Health check endpoint.
"""
from fastapi import APIRouter, Depends
from supabase import Client
from schemas.common import HealthResponse
from database import get_db


router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check(db: Client = Depends(get_db)):
    """
    Health check endpoint.
    
    Returns API status and database connectivity.
    """
    # Test database connection
    try:
        db.table("users").select("id").limit(1).execute()
        database_status = "connected"
    except Exception as e:
        database_status = f"error: {str(e)}"
    
    return HealthResponse(
        status="healthy",
        database=database_status
    )
