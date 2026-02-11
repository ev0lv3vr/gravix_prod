"""
Health check endpoint — always works regardless of configuration.
"""
from fastapi import APIRouter
from schemas.common import HealthResponse
from config import settings


router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns API status. Does NOT depend on database or any external service
    so load balancers and monitoring always get a response.
    """
    database_status = "not_checked"
    
    if settings.core_configured:
        try:
            from database import get_db
            db = get_db()
            db.table("users").select("id").limit(1).execute()
            database_status = "connected"
        except Exception as e:
            database_status = f"error: {str(e)}"
    else:
        database_status = "not_configured"
    
    return HealthResponse(
        status="healthy",
        database=database_status
    )
