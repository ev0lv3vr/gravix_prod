"""Health check endpoint."""

from fastapi import APIRouter, Response

from config import settings
from schemas.common import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check(response: Response):
    # Sprint 10.3: Health endpoint should not be cached
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return HealthResponse(
        status="ok",
        version="2.0.0",
        environment=settings.environment,
    )


@router.get("/")
async def root():
    return {"status": "ok", "service": "gravix-api", "version": "2.0.0"}
