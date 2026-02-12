"""Public stats router.

Endpoint: GET /v1/stats/public

This is intentionally lightweight and resilient:
- works even if optional tables (analysis_feedback) don't exist yet
- returns minimum sensible values on errors
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter

from database import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/stats", tags=["stats"])


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except Exception:  # noqa: BLE001
        return default


@router.get("/public")
async def get_public_stats() -> dict:
    """Return public aggregate stats for marketing/dashboard.

    Fields:
    - analyses_completed_count
    - substrate_combinations_count
    - resolution_rate (0..1) or None
    """

    db = get_supabase()

    analyses_completed_count = 0
    substrate_combinations_count = 0
    resolution_rate = None

    # 1) Completed analyses count
    try:
        res = (
            db.table("failure_analyses")
            .select("id", count="exact")
            .eq("status", "completed")
            .execute()
        )
        analyses_completed_count = _safe_int(getattr(res, "count", None), 0)
    except Exception as exc:  # noqa: BLE001
        logger.debug(f"stats: failed to count completed analyses (ignored): {exc}")

    # 2) Distinct normalized substrate combinations (best-effort; client-side distinct)
    try:
        rows = (
            db.table("failure_analyses")
            .select("substrate_a_normalized, substrate_b_normalized")
            .eq("status", "completed")
            .limit(5000)
            .execute()
        ).data
        combos = set()
        for r in rows or []:
            a = (r.get("substrate_a_normalized") or "").strip() if isinstance(r, dict) else ""
            b = (r.get("substrate_b_normalized") or "").strip() if isinstance(r, dict) else ""
            if not a and not b:
                continue
            combos.add((a, b))
        substrate_combinations_count = len(combos)
    except Exception as exc:  # noqa: BLE001
        logger.debug(f"stats: failed to compute substrate combinations (ignored): {exc}")

    # 3) Resolution rate from analysis_feedback if table exists
    try:
        # Probe table existence (PostgREST returns error if missing)
        db.table("analysis_feedback").select("id").limit(1).execute()

        total = (
            db.table("analysis_feedback")
            .select("id", count="exact")
            .execute()
        )
        total_count = _safe_int(getattr(total, "count", None), 0)

        if total_count > 0:
            # Define "resolved" as helpful=true OR outcome matching a few common success labels.
            # We do this with a narrow query and count.
            resolved = (
                db.table("analysis_feedback")
                .select("id", count="exact")
                .or_("helpful.eq.true,outcome.ilike.%resolved%,outcome.ilike.%fixed%,outcome.ilike.%success%")
                .execute()
            )
            resolved_count = _safe_int(getattr(resolved, "count", None), 0)
            resolution_rate = max(0.0, min(1.0, resolved_count / total_count))
    except Exception as exc:  # noqa: BLE001
        # Missing table or query error -> leave None
        logger.debug(f"stats: feedback resolution rate unavailable (ignored): {exc}")

    # Ensure "sensible minimums" when empty
    return {
        "analyses_completed_count": max(analyses_completed_count, 0),
        "substrate_combinations_count": max(substrate_combinations_count, 0),
        "resolution_rate": resolution_rate,
    }
