"""Health check endpoint."""

import httpx
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


@router.get("/health/ai")
async def ai_health_check():
    """Diagnostic: test Claude API connectivity without leaking secrets."""
    key = settings.anthropic_api_key
    model = settings.anthropic_model

    if not key:
        return {"status": "error", "detail": "ANTHROPIC_API_KEY is not set"}

    key_preview = f"{key[:7]}...{key[-4:]}" if len(key) > 12 else "***"

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": model,
                    "max_tokens": 16,
                    "messages": [{"role": "user", "content": "Say OK"}],
                },
            )
            if resp.status_code == 200:
                return {"status": "ok", "model": model, "key_preview": key_preview}
            else:
                body = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else resp.text
                return {"status": "error", "http_status": resp.status_code, "model": model, "key_preview": key_preview, "detail": body}
    except Exception as e:
        return {"status": "error", "model": model, "key_preview": key_preview, "detail": str(e)}


@router.get("/")
async def root():
    return {"status": "ok", "service": "gravix-api", "version": "2.0.0"}
