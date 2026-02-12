"""Follow-up email service for pending feedback."""

import logging
from datetime import datetime, timezone, timedelta

import resend

from config import settings
from database import get_supabase

logger = logging.getLogger(__name__)


def _build_email_body(analysis: dict, frontend_url: str) -> str:
    """Build a simple text email with outcome links."""
    analysis_id = analysis["id"]
    material = analysis.get("material_category", "material")
    failure_mode = analysis.get("failure_mode", "failure")
    substrates = ""
    if analysis.get("substrate_a") and analysis.get("substrate_b"):
        substrates = f" ({analysis['substrate_a']} → {analysis['substrate_b']})"

    base_url = f"{frontend_url}/feedback/{analysis_id}"

    return f"""Hi,

About a week ago, you ran a failure analysis on Gravix for {material} — {failure_mode}{substrates}.

How did it turn out? Your feedback helps improve future analyses for all engineers.

Quick links — click the one that best describes the outcome:

  ✅ Resolved: {base_url}?outcome=resolved
  🔧 Partially resolved: {base_url}?outcome=partially_resolved
  ❌ Not resolved: {base_url}?outcome=not_resolved
  🔄 Different cause: {base_url}?outcome=different_cause
  🧪 Still testing: {base_url}?outcome=still_testing

Or provide detailed feedback here: {base_url}

Thanks for helping build better materials intelligence.

— The Gravix Team
"""


async def send_pending_followups() -> dict:
    """
    Query completed failure_analyses from 6-8 days ago with no feedback
    and send follow-up emails via Resend.
    """
    db = get_supabase()
    now = datetime.now(timezone.utc)
    window_start = (now - timedelta(days=8)).isoformat()
    window_end = (now - timedelta(days=6)).isoformat()

    # Get completed analyses in the 6-8 day window
    analyses_result = (
        db.table("failure_analyses")
        .select("id, user_id, material_category, failure_mode, substrate_a, substrate_b, created_at")
        .eq("status", "completed")
        .gte("created_at", window_start)
        .lte("created_at", window_end)
        .execute()
    )

    if not analyses_result.data:
        return {"sent": 0, "pending": 0}

    # Filter out analyses that already have feedback
    analysis_ids = [a["id"] for a in analyses_result.data]
    feedback_result = (
        db.table("analysis_feedback")
        .select("analysis_id")
        .in_("analysis_id", analysis_ids)
        .execute()
    )
    feedback_ids = {f["analysis_id"] for f in feedback_result.data}

    pending = [a for a in analyses_result.data if a["id"] not in feedback_ids]
    total_pending = len(pending)

    if not pending:
        return {"sent": 0, "pending": 0}

    # Look up user emails
    user_ids = list({a["user_id"] for a in pending})
    users_result = db.table("users").select("id, email").in_("id", user_ids).execute()
    user_email_map = {u["id"]: u["email"] for u in users_result.data}

    # Configure Resend
    resend.api_key = settings.resend_api_key

    sent_count = 0
    frontend_url = settings.frontend_url.rstrip("/")

    for analysis in pending:
        email = user_email_map.get(analysis["user_id"])
        if not email:
            continue

        try:
            resend.Emails.send({
                "from": settings.from_email,
                "to": email,
                "subject": "How did your Gravix analysis turn out?",
                "text": _build_email_body(analysis, frontend_url),
            })
            sent_count += 1
        except Exception as e:
            logger.warning(f"Failed to send follow-up email for analysis {analysis['id']}: {e}")

    return {"sent": sent_count, "pending": total_pending}
