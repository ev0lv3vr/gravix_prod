"""Knowledge aggregation service (Sprint 6.1 + 6.5).

Cron job that:
  1. Reads completed analyses + their feedback
  2. Groups by (substrate_pair, root_cause_category, adhesive_family)
  3. Computes success rates and evidence counts
  4. Upserts into `knowledge_patterns`
  5. Aggregates daily_metrics for public stats

Called from cron.py → /v1/cron/aggregate-knowledge and /v1/cron/aggregate-metrics.
"""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timezone, date
from typing import Optional

from database import get_supabase
from utils.normalizer import normalize_substrate

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# 6.1 — Knowledge pattern aggregation
# ---------------------------------------------------------------------------

async def run_knowledge_aggregation() -> dict:
    """Aggregate feedback + analyses into knowledge_patterns.

    Logic:
    1. Fetch all completed analyses that have at least one feedback entry
    2. Group by (substrate_a_normalized, substrate_b_normalized, root_cause_category)
    3. For each group:
       - Count evidence (number of feedback entries)
       - Compute success_rate (was_helpful=true / total feedback)
       - Collect top confirmed root causes and fixes
    4. Upsert into knowledge_patterns
    """
    db = get_supabase()
    stats = {"patterns_upserted": 0, "analyses_processed": 0, "errors": []}

    try:
        # Fetch all feedback entries joined with their analyses
        # We get feedback first, then look up the parent analysis
        feedback_result = (
            db.table("analysis_feedback")
            .select("id, analysis_id, spec_id, was_helpful, outcome, "
                    "actual_root_cause, what_worked, what_didnt_work, "
                    "root_cause_confirmed, created_at")
            .order("created_at", desc=True)
            .limit(5000)
            .execute()
        )

        if not feedback_result.data:
            logger.info("No feedback entries found — nothing to aggregate.")
            return {**stats, "message": "No feedback to aggregate"}

        # Get unique analysis IDs from feedback
        analysis_ids = list({
            f["analysis_id"] for f in feedback_result.data
            if f.get("analysis_id")
        })

        if not analysis_ids:
            return {**stats, "message": "No analysis-linked feedback found"}

        # Fetch analyses in batches (PostgREST .in_ has limits)
        analyses_by_id = {}
        batch_size = 50
        for i in range(0, len(analysis_ids), batch_size):
            batch = analysis_ids[i:i + batch_size]
            result = (
                db.table("failure_analyses")
                .select("id, substrate_a, substrate_b, substrate_a_normalized, "
                        "substrate_b_normalized, root_cause_category, "
                        "material_category, material_subcategory, failure_mode, "
                        "industry, status")
                .in_("id", batch)
                .eq("status", "completed")
                .execute()
            )
            for row in result.data or []:
                analyses_by_id[row["id"]] = row

        stats["analyses_processed"] = len(analyses_by_id)

        # Group feedback by pattern key
        # Key: (substrate_a_norm, substrate_b_norm, root_cause_category)
        groups: dict[tuple, list[dict]] = defaultdict(list)

        for fb in feedback_result.data:
            aid = fb.get("analysis_id")
            if not aid or aid not in analyses_by_id:
                continue
            analysis = analyses_by_id[aid]

            sub_a = (analysis.get("substrate_a_normalized") or "").strip()
            sub_b = (analysis.get("substrate_b_normalized") or "").strip()
            root_cat = (analysis.get("root_cause_category") or "unknown").strip()

            # Normalize pair order for consistency (alphabetical)
            if sub_a and sub_b and sub_a > sub_b:
                sub_a, sub_b = sub_b, sub_a

            if not sub_a and not sub_b:
                continue

            key = (sub_a, sub_b, root_cat)
            groups[key].append({
                "feedback": fb,
                "analysis": analysis,
            })

        # Process each group into a knowledge pattern
        for (sub_a, sub_b, root_cat), entries in groups.items():
            try:
                evidence_count = len(entries)
                helpful_count = sum(
                    1 for e in entries if e["feedback"].get("was_helpful") is True
                )
                success_rate = helpful_count / evidence_count if evidence_count > 0 else None

                # Collect confirmed root causes and fixes
                confirmed_root_causes = []
                confirmed_fixes = []
                adhesive_families = set()
                industries = set()

                for e in entries:
                    fb = e["feedback"]
                    analysis = e["analysis"]

                    if fb.get("actual_root_cause"):
                        confirmed_root_causes.append(fb["actual_root_cause"])
                    if fb.get("what_worked"):
                        confirmed_fixes.append(fb["what_worked"])

                    mat_sub = analysis.get("material_subcategory")
                    if mat_sub:
                        adhesive_families.add(mat_sub.strip().lower())

                    industry = analysis.get("industry")
                    if industry:
                        industries.add(industry.strip().lower())

                # Build metadata
                metadata = {
                    "top_confirmed_root_causes": _top_n_unique(confirmed_root_causes, 5),
                    "top_confirmed_fixes": _top_n_unique(confirmed_fixes, 5),
                    "industries": sorted(industries),
                    "failure_modes": list({
                        e["analysis"].get("failure_mode", "")
                        for e in entries
                        if e["analysis"].get("failure_mode")
                    })[:10],
                }

                # Determine primary adhesive family
                primary_adhesive = None
                if adhesive_families:
                    # Most common
                    from collections import Counter
                    primary_adhesive = Counter(
                        a.get("material_subcategory", "").strip().lower()
                        for e in entries
                        for a in [e["analysis"]]
                        if a.get("material_subcategory")
                    ).most_common(1)[0][0] if adhesive_families else None

                # Primary industry
                primary_industry = None
                if industries:
                    primary_industry = Counter(
                        a.get("industry", "").strip().lower()
                        for e in entries
                        for a in [e["analysis"]]
                        if a.get("industry")
                    ).most_common(1)[0][0] if industries else None

                # Upsert pattern
                now = datetime.now(timezone.utc).isoformat()
                pattern_data = {
                    "pattern_type": "substrate_pair_root_cause",
                    "substrate_a_normalized": sub_a,
                    "substrate_b_normalized": sub_b,
                    "root_cause_category": root_cat,
                    "adhesive_family": primary_adhesive,
                    "industry": primary_industry,
                    "evidence_count": evidence_count,
                    "success_rate": success_rate,
                    "metadata": metadata,
                    "updated_at": now,
                }

                # Check if pattern exists
                existing = (
                    db.table("knowledge_patterns")
                    .select("id")
                    .eq("pattern_type", "substrate_pair_root_cause")
                    .eq("substrate_a_normalized", sub_a)
                    .eq("substrate_b_normalized", sub_b)
                    .eq("root_cause_category", root_cat)
                    .limit(1)
                    .execute()
                )

                if existing.data:
                    db.table("knowledge_patterns").update(pattern_data).eq(
                        "id", existing.data[0]["id"]
                    ).execute()
                else:
                    pattern_data["created_at"] = now
                    db.table("knowledge_patterns").insert(pattern_data).execute()

                stats["patterns_upserted"] += 1

            except Exception as exc:
                msg = f"Error processing group ({sub_a}, {sub_b}, {root_cat}): {exc}"
                logger.warning(msg)
                stats["errors"].append(msg)

    except Exception as exc:
        msg = f"Knowledge aggregation failed: {exc}"
        logger.exception(msg)
        stats["errors"].append(msg)

    logger.info(
        f"Knowledge aggregation complete: {stats['patterns_upserted']} patterns upserted "
        f"from {stats['analyses_processed']} analyses"
    )
    return stats


# ---------------------------------------------------------------------------
# 6.5 — Daily metrics aggregation
# ---------------------------------------------------------------------------

async def run_metrics_aggregation() -> dict:
    """Aggregate daily metrics for public stats + Social Proof Bar.

    Populates the `daily_metrics` table with today's aggregate numbers.
    """
    db = get_supabase()
    today = date.today().isoformat()
    stats = {"day": today, "inserted": False, "errors": []}

    try:
        # 1. Count completed analyses
        analyses_res = (
            db.table("failure_analyses")
            .select("id", count="exact")
            .eq("status", "completed")
            .execute()
        )
        analyses_count = getattr(analyses_res, "count", None) or 0

        # 2. Count completed spec requests
        specs_res = (
            db.table("spec_requests")
            .select("id", count="exact")
            .eq("status", "completed")
            .execute()
        )
        spec_requests_count = getattr(specs_res, "count", None) or 0

        # 3. Resolution rate from feedback
        resolution_rate = None
        try:
            total_fb = (
                db.table("analysis_feedback")
                .select("id", count="exact")
                .execute()
            )
            total_count = getattr(total_fb, "count", None) or 0

            if total_count > 0:
                resolved_fb = (
                    db.table("analysis_feedback")
                    .select("id", count="exact")
                    .eq("was_helpful", True)
                    .execute()
                )
                resolved_count = getattr(resolved_fb, "count", None) or 0
                resolution_rate = round(resolved_count / total_count, 4)
        except Exception:
            pass

        # 4. Distinct substrate combinations
        substrate_combinations_count = 0
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
                a = (r.get("substrate_a_normalized") or "").strip()
                b = (r.get("substrate_b_normalized") or "").strip()
                if a or b:
                    combos.add((min(a, b), max(a, b)))
            substrate_combinations_count = len(combos)
        except Exception:
            pass

        # 5. Distinct adhesive families
        adhesive_families_count = 0
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
        except Exception:
            pass

        # Upsert daily metrics
        now = datetime.now(timezone.utc).isoformat()
        row_data = {
            "day": today,
            "analyses_count": analyses_count,
            "spec_requests_count": spec_requests_count,
            "resolution_rate": resolution_rate,
            "substrate_combinations_count": substrate_combinations_count,
            "adhesive_families_count": adhesive_families_count,
            "updated_at": now,
        }

        # Check if today's row exists
        existing = (
            db.table("daily_metrics")
            .select("day")
            .eq("day", today)
            .limit(1)
            .execute()
        )

        if existing.data:
            db.table("daily_metrics").update(row_data).eq("day", today).execute()
        else:
            row_data["created_at"] = now
            db.table("daily_metrics").insert(row_data).execute()

        stats["inserted"] = True
        stats.update({
            "analyses_count": analyses_count,
            "spec_requests_count": spec_requests_count,
            "resolution_rate": resolution_rate,
            "substrate_combinations_count": substrate_combinations_count,
            "adhesive_families_count": adhesive_families_count,
        })

    except Exception as exc:
        msg = f"Metrics aggregation failed: {exc}"
        logger.exception(msg)
        stats["errors"].append(msg)

    logger.info(f"Metrics aggregation complete: {stats}")
    return stats


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _top_n_unique(items: list[str], n: int = 5) -> list[str]:
    """Return the top N unique non-empty strings, preserving order."""
    seen = set()
    result = []
    for item in items:
        s = item.strip()
        if s and s.lower() not in seen:
            seen.add(s.lower())
            result.append(s)
            if len(result) >= n:
                break
    return result
