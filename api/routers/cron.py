"""Cron job endpoints — protected by X-Cron-Secret header."""

import logging
import time
import uuid

from fastapi import APIRouter, Header, HTTPException, status

from config import settings
from database import get_supabase
from services.feedback_email import send_pending_followups
from services.knowledge_aggregator import run_knowledge_aggregation, run_metrics_aggregation

logger = logging.getLogger(__name__)

router = APIRouter(tags=["cron"])


def _verify_cron_secret(x_cron_secret: str = Header(...)):
    """Verify the cron secret header."""
    if not settings.cron_secret or x_cron_secret != settings.cron_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid cron secret",
        )


def _log_cron_run(job_name: str, start_time: float, result: dict, error: str | None = None):
    """Best-effort cron execution log."""
    try:
        db = get_supabase()
        db.table("cron_run_log").insert({
            "id": str(uuid.uuid4()),
            "job_name": job_name,
            "status": "error" if error else "success",
            "duration_ms": int((time.time() - start_time) * 1000),
            "result": result,
            "error": error[:500] if error else None,
        }).execute()
    except Exception as exc:
        logger.debug(f"cron log write failed (ignored): {exc}")


@router.post("/send-followups")
async def send_followups(x_cron_secret: str = Header(...)):
    """Send follow-up emails for analyses awaiting feedback."""
    _verify_cron_secret(x_cron_secret)
    start = time.time()
    try:
        result = await send_pending_followups()
        _log_cron_run("send-followups", start, result)
        return result
    except Exception as exc:
        _log_cron_run("send-followups", start, {}, str(exc))
        raise


@router.post("/aggregate-knowledge")
async def aggregate_knowledge(x_cron_secret: str = Header(...)):
    """Aggregate feedback into knowledge base patterns.

    Reads all completed analyses + their feedback entries,
    groups by substrate pair + root cause category,
    computes success rates, and upserts into knowledge_patterns.
    """
    _verify_cron_secret(x_cron_secret)
    start = time.time()
    try:
        result = await run_knowledge_aggregation()
        _log_cron_run("aggregate-knowledge", start, result)
        return result
    except Exception as exc:
        _log_cron_run("aggregate-knowledge", start, {}, str(exc))
        raise


@router.post("/detect-patterns")
async def detect_patterns_cron(x_cron_secret: str = Header(...)):
    """Run pattern detection as a cron job.

    Sprint 11: Delegates to the patterns router's detection logic.
    """
    _verify_cron_secret(x_cron_secret)
    start = time.time()
    try:
        from routers.patterns import detect_patterns as _detect
        # Create a minimal admin user dict for the cron context
        admin_user = {"id": "cron", "role": "admin"}
        result = await _detect(x_cron_secret=x_cron_secret, user=admin_user)
        _log_cron_run("detect-patterns", start, result)
        return result
    except Exception as exc:
        _log_cron_run("detect-patterns", start, {}, str(exc))
        raise


@router.post("/aggregate-metrics")
async def aggregate_metrics(x_cron_secret: str = Header(...)):
    """Aggregate daily metrics for public stats / Social Proof Bar.

    Counts total analyses, specs, resolution rate, substrate combos,
    adhesive families. Upserts into daily_metrics.
    """
    _verify_cron_secret(x_cron_secret)
    start = time.time()
    try:
        result = await run_metrics_aggregation()
        _log_cron_run("aggregate-metrics", start, result)
        return result
    except Exception as exc:
        _log_cron_run("aggregate-metrics", start, {}, str(exc))
        raise
