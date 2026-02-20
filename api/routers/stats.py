"""Public stats router.

Endpoint: GET /v1/stats/public

Sprint 6: Now reads from daily_metrics table first (populated by aggregation cron),
with fallback to live queries. This makes the endpoint fast + consistent.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Response

from database import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/stats", tags=["stats"])
legacy_router = APIRouter(tags=["stats"])


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except Exception:  # noqa: BLE001
        return default


def _safe_float(value: Any, default: float | None = None) -> float | None:
    try:
        return float(value) if value is not None else default
    except Exception:  # noqa: BLE001
        return default


@router.get("/public")
async def get_public_stats(response: Response) -> dict:
    """Return public aggregate stats for marketing/dashboard.

    Reads from daily_metrics first (fast, pre-aggregated).
    Falls back to live queries if daily_metrics is empty or unavailable.

    Fields:
    - analyses_completed_count
    - specs_completed_count
    - substrate_combinations_count
    - adhesive_families_count
    - resolution_rate (0..1) or None
    - knowledge_patterns_count (Sprint 6)
    """

    # Sprint 10.3: Cache public stats for 5 minutes
    response.headers["Cache-Control"] = "public, max-age=300"
    
    db = get_supabase()

    # Try daily_metrics first (Sprint 6.5)
    try:
        dm = (
            db.table("daily_metrics")
            .select("*")
            .order("day", desc=True)
            .limit(1)
            .execute()
        )
        if dm.data:
            row = dm.data[0]
            knowledge_count = _count_knowledge_patterns(db)
            return {
                "analyses_completed_count": _safe_int(row.get("analyses_count"), 0),
                "specs_completed_count": _safe_int(row.get("spec_requests_count"), 0),
                "substrate_combinations_count": _safe_int(row.get("substrate_combinations_count"), 0),
                "adhesive_families_count": _safe_int(row.get("adhesive_families_count"), 0),
                "resolution_rate": _safe_float(row.get("resolution_rate")),
                "knowledge_patterns_count": knowledge_count,
                "source": "daily_metrics",
                "as_of": row.get("day"),
            }
    except Exception as exc:
        logger.debug(f"stats: daily_metrics unavailable, falling back to live queries: {exc}")

    # Fallback: live queries
    analyses_completed_count = 0
    specs_completed_count = 0
    substrate_combinations_count = 0
    adhesive_families_count = 0
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
    except Exception as exc:
        logger.debug(f"stats: failed to count completed analyses (ignored): {exc}")

    # 2) Completed specs count
    try:
        res = (
            db.table("spec_requests")
            .select("id", count="exact")
            .eq("status", "completed")
            .execute()
        )
        specs_completed_count = _safe_int(getattr(res, "count", None), 0)
    except Exception as exc:
        logger.debug(f"stats: failed to count completed specs (ignored): {exc}")

    # 3) Distinct normalized substrate combinations
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
            combos.add((min(a, b), max(a, b)))
        substrate_combinations_count = len(combos)
    except Exception as exc:
        logger.debug(f"stats: failed to compute substrate combinations (ignored): {exc}")

    # 4) Distinct adhesive families
    try:
        rows = (
            db.table("failure_analyses")
            .select("material_subcategory")
            .eq("status", "completed")
            .limit(5000)
            .execute()
        ).data
        families = {
            (r.get("material_subcategory") or "").strip().lower()
            for r in rows or []
            if r.get("material_subcategory")
        }
        adhesive_families_count = len(families)
    except Exception as exc:
        logger.debug(f"stats: failed to compute adhesive families (ignored): {exc}")

    # 5) Resolution rate from feedback
    try:
        total = (
            db.table("analysis_feedback")
            .select("id", count="exact")
            .execute()
        )
        total_count = _safe_int(getattr(total, "count", None), 0)

        if total_count > 0:
            resolved = (
                db.table("analysis_feedback")
                .select("id", count="exact")
                .eq("was_helpful", True)
                .execute()
            )
            resolved_count = _safe_int(getattr(resolved, "count", None), 0)
            resolution_rate = max(0.0, min(1.0, resolved_count / total_count))
    except Exception as exc:
        logger.debug(f"stats: feedback resolution rate unavailable (ignored): {exc}")

    # 6) Knowledge patterns count
    knowledge_count = _count_knowledge_patterns(db)

    return {
        "analyses_completed_count": max(analyses_completed_count, 0),
        "specs_completed_count": max(specs_completed_count, 0),
        "substrate_combinations_count": max(substrate_combinations_count, 0),
        "adhesive_families_count": max(adhesive_families_count, 0),
        "resolution_rate": resolution_rate,
        "knowledge_patterns_count": knowledge_count,
        "source": "live",
    }


def _count_knowledge_patterns(db) -> int:
    """Count knowledge patterns — best effort."""
    try:
        res = (
            db.table("knowledge_patterns")
            .select("id", count="exact")
            .gte("evidence_count", 2)
            .execute()
        )
        return _safe_int(getattr(res, "count", None), 0)
    except Exception:
        return 0


@legacy_router.get("/api/admin/stats", include_in_schema=False)
async def get_public_stats_legacy_alias(response: Response) -> dict:
    """L1 contract alias for public stats endpoint.

    Mirrors GET /v1/stats/public to preserve backward compatibility while
    aligning frontend fetch paths with specs/schema/api-contracts.md.
    """
    return await get_public_stats(response)
