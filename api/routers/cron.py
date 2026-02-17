"""Cron job endpoints — protected by X-Cron-Secret header."""

import logging

from fastapi import APIRouter, Header, HTTPException, status

from config import settings
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


@router.post("/send-followups")
async def send_followups(x_cron_secret: str = Header(...)):
    """Send follow-up emails for analyses awaiting feedback."""
    _verify_cron_secret(x_cron_secret)
    result = await send_pending_followups()
    return result


@router.post("/aggregate-knowledge")
async def aggregate_knowledge(x_cron_secret: str = Header(...)):
    """Aggregate feedback into knowledge base patterns.

    Reads all completed analyses + their feedback entries,
    groups by substrate pair + root cause category,
    computes success rates, and upserts into knowledge_patterns.
    """
    _verify_cron_secret(x_cron_secret)
    result = await run_knowledge_aggregation()
    return result


@router.post("/detect-patterns")
async def detect_patterns_cron(x_cron_secret: str = Header(...)):
    """Run pattern detection as a cron job.

    Sprint 11: Delegates to the patterns router's detection logic.
    """
    _verify_cron_secret(x_cron_secret)
    from routers.patterns import detect_patterns as _detect
    # Create a minimal admin user dict for the cron context
    admin_user = {"id": "cron", "role": "admin"}
    result = await _detect(x_cron_secret=x_cron_secret, user=admin_user)
    return result


@router.post("/aggregate-metrics")
async def aggregate_metrics(x_cron_secret: str = Header(...)):
    """Aggregate daily metrics for public stats / Social Proof Bar.

    Counts total analyses, specs, resolution rate, substrate combos,
    adhesive families. Upserts into daily_metrics.
    """
    _verify_cron_secret(x_cron_secret)
    result = await run_metrics_aggregation()
    return result
