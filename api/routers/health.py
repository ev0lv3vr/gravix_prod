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


@router.get("/health/db")
async def db_health_check():
    """Diagnostic: test Supabase connectivity + spec_requests table schema."""
    from database import get_supabase
    try:
        db = get_supabase()
        # Test a simple query
        result = db.table("spec_requests").select("id").limit(1).execute()
        row_count = len(result.data) if result.data else 0
        # Test column existence by selecting all columns from one row
        cols_result = db.table("spec_requests").select("*").limit(1).execute()
        columns = list(cols_result.data[0].keys()) if cols_result.data else []
        return {"status": "ok", "row_count_sample": row_count, "columns": columns}
    except Exception as e:
        return {"status": "error", "detail": str(e)[:500]}


@router.get("/health/spec-dryrun")
async def spec_dryrun():
    """Diagnostic: dry-run the spec generation pipeline (no auth, no DB write).

    Tests: Pydantic validation → prompt build → Claude API call.
    Remove this endpoint after debugging.
    """
    import time
    from services.ai_engine import generate_spec

    test_data = {
        "material_category": "adhesive",
        "substrate_a": "steel",
        "substrate_b": "aluminum",
        "environment": {"temp_min": "-40°C", "temp_max": "120°C"},
        "cure_constraints": {"heat_available": True},
    }

    steps = {}
    try:
        # Step 1: Test AI generation
        start = time.time()
        ai_result = await generate_spec(test_data)
        steps["ai_call_ms"] = int((time.time() - start) * 1000)
        steps["ai_keys"] = list(ai_result.keys())
        steps["has_recommended_spec"] = "recommended_spec" in ai_result
        steps["confidence_score"] = ai_result.get("confidence_score")

        return {"status": "ok", **steps}
    except Exception as e:
        steps["error"] = f"{type(e).__name__}: {str(e)[:300]}"
        return {"status": "error", **steps}


@router.get("/")
async def root():
    return {"status": "ok", "service": "gravix-api", "version": "2.0.0"}
