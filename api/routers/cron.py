"""Cron job endpoints — protected by X-Cron-Secret header."""

import logging

from fastapi import APIRouter, Header, HTTPException, status

from config import settings
from services.feedback_email import send_pending_followups

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
    """Aggregate feedback into knowledge base (placeholder)."""
    _verify_cron_secret(x_cron_secret)
    return {"status": "not_implemented"}


@router.post("/aggregate-metrics")
async def aggregate_metrics(x_cron_secret: str = Header(...)):
    """Aggregate feedback metrics (placeholder)."""
    _verify_cron_secret(x_cron_secret)
    return {"status": "not_implemented"}
