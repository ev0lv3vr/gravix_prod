"""Health check endpoint."""

from fastapi import APIRouter

from config import settings
from schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        version="2.0.0",
        environment=settings.environment,
    )


@router.get("/")
async def root():
    return {"status": "ok", "service": "gravix-api", "version": "2.0.0"}
