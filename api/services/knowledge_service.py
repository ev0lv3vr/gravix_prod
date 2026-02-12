"""Knowledge service — query and inject learned patterns into AI prompts.

Reads from `knowledge_patterns` (populated by the aggregator cron job)
and `feedback` / completed analyses for similar-case lookups.
"""

from __future__ import annotations

import logging
from typing import Optional

from database import get_supabase
from utils.normalizer import normalize_substrate

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# 6.2 — Knowledge pattern lookup (for prompt injection)
# ---------------------------------------------------------------------------

async def get_relevant_patterns(
    substrate_a: Optional[str] = None,
    substrate_b: Optional[str] = None,
    root_cause_category: Optional[str] = None,
    adhesive_family: Optional[str] = None,
    min_evidence: int = 2,
    limit: int = 5,
) -> list[dict]:
    """Find knowledge patterns matching the given criteria.

    Returns a list of pattern dicts ordered by evidence_count descending.
    Matching is progressive: substrate pair first, then optional filters.
    """
    db = get_supabase()

    sub_a = normalize_substrate(substrate_a)
    sub_b = normalize_substrate(substrate_b)

    if not sub_a and not sub_b:
        return []

    try:
        query = (
            db.table("knowledge_patterns")
            .select("*")
            .gte("evidence_count", min_evidence)
        )

        # Match substrate pair (order-independent — query both permutations)
        # Supabase PostgREST doesn't have native OR on compound columns,
        # so we fetch with substrate_a and filter client-side for the reverse.
        if sub_a:
            query = query.or_(
                f"substrate_a_normalized.eq.{sub_a},substrate_b_normalized.eq.{sub_a}"
            )

        result = query.order("evidence_count", desc=True).limit(limit * 3).execute()

        patterns = []
        for row in result.data or []:
            row_a = (row.get("substrate_a_normalized") or "").strip()
            row_b = (row.get("substrate_b_normalized") or "").strip()

            # Accept if at least one substrate matches; prefer both matching
            match_score = 0
            if sub_a and (row_a == sub_a or row_b == sub_a):
                match_score += 1
            if sub_b and (row_a == sub_b or row_b == sub_b):
                match_score += 1

            if match_score == 0:
                continue

            # Optional filters (boost, don't exclude)
            if root_cause_category and row.get("root_cause_category") == root_cause_category:
                match_score += 1
            if adhesive_family and row.get("adhesive_family") == adhesive_family:
                match_score += 1

            row["_match_score"] = match_score
            patterns.append(row)

        # Sort by match_score desc, then evidence_count desc
        patterns.sort(key=lambda p: (p["_match_score"], p.get("evidence_count", 0)), reverse=True)

        # Clean up internal field
        for p in patterns:
            p.pop("_match_score", None)

        return patterns[:limit]

    except Exception as exc:
        logger.warning(f"knowledge_service.get_relevant_patterns failed: {exc}")
        return []


def format_knowledge_for_prompt(patterns: list[dict]) -> str:
    """Format knowledge patterns into a text block for AI prompt injection.

    Returns an empty string if no patterns are available.
    """
    if not patterns:
        return ""

    lines = [
        "\n--- EMPIRICAL KNOWLEDGE FROM CONFIRMED PRODUCTION OUTCOMES ---",
        "The following patterns are derived from real user feedback and confirmed fixes.",
        "Weight this information heavily in your analysis.\n",
    ]

    for i, p in enumerate(patterns, 1):
        sub_a = p.get("substrate_a_normalized", "unknown")
        sub_b = p.get("substrate_b_normalized", "unknown")
        evidence = p.get("evidence_count", 0)
        success_rate = p.get("success_rate")
        root_cat = p.get("root_cause_category", "unknown")
        adhesive = p.get("adhesive_family", "unknown")
        meta = p.get("metadata", {})

        lines.append(f"Pattern {i}: {sub_a} → {sub_b}")
        lines.append(f"  Root cause category: {root_cat}")
        if adhesive and adhesive != "unknown":
            lines.append(f"  Adhesive family: {adhesive}")
        lines.append(f"  Evidence count: {evidence} confirmed cases")
        if success_rate is not None:
            lines.append(f"  Success rate: {success_rate:.0%}")

        # Extract top confirmed fixes from metadata
        top_fixes = meta.get("top_confirmed_fixes", [])
        if top_fixes:
            lines.append(f"  Confirmed fixes: {'; '.join(top_fixes[:3])}")

        top_root_causes = meta.get("top_confirmed_root_causes", [])
        if top_root_causes:
            lines.append(f"  Confirmed root causes: {'; '.join(top_root_causes[:3])}")

        lines.append("")

    lines.append("--- END EMPIRICAL KNOWLEDGE ---\n")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 6.3 — Similar cases lookup
# ---------------------------------------------------------------------------

async def find_similar_cases(
    substrate_a: Optional[str] = None,
    substrate_b: Optional[str] = None,
    failure_mode: Optional[str] = None,
    adhesive_family: Optional[str] = None,
    exclude_id: Optional[str] = None,
    limit: int = 5,
) -> list[dict]:
    """Find completed analyses similar to the given parameters.

    Returns lightweight dicts with id, substrates, root_cause, outcome,
    confidence, created_at.
    """
    db = get_supabase()

    sub_a = normalize_substrate(substrate_a)
    sub_b = normalize_substrate(substrate_b)

    if not sub_a and not sub_b and not failure_mode:
        return []

    try:
        query = (
            db.table("failure_analyses")
            .select(
                "id, substrate_a, substrate_b, substrate_a_normalized, substrate_b_normalized, "
                "failure_mode, root_cause_category, confidence_score, material_category, "
                "material_subcategory, industry, created_at, status"
            )
            .eq("status", "completed")
            .order("created_at", desc=True)
            .limit(100)
        )

        result = query.execute()

        candidates = []
        for row in result.data or []:
            if exclude_id and row["id"] == exclude_id:
                continue

            row_a = (row.get("substrate_a_normalized") or "").strip()
            row_b = (row.get("substrate_b_normalized") or "").strip()
            row_fm = (row.get("failure_mode") or "").strip().lower()

            score = 0

            # Substrate matching (order-independent)
            target_subs = {s for s in [sub_a, sub_b] if s}
            row_subs = {s for s in [row_a, row_b] if s}

            overlap = target_subs & row_subs
            score += len(overlap) * 3  # Strong signal

            # Failure mode matching
            if failure_mode and row_fm:
                fm_lower = failure_mode.strip().lower()
                if fm_lower == row_fm:
                    score += 4
                elif fm_lower in row_fm or row_fm in fm_lower:
                    score += 2

            if score == 0:
                continue

            # Look up outcome from feedback table
            outcome = None
            try:
                fb = (
                    db.table("analysis_feedback")
                    .select("outcome, was_helpful")
                    .eq("analysis_id", row["id"])
                    .limit(1)
                    .execute()
                )
                if fb.data:
                    outcome = fb.data[0].get("outcome")
            except Exception:
                pass

            candidates.append({
                "id": row["id"],
                "substrate_a": row.get("substrate_a"),
                "substrate_b": row.get("substrate_b"),
                "failure_mode": row.get("failure_mode"),
                "root_cause_category": row.get("root_cause_category"),
                "confidence_score": row.get("confidence_score"),
                "outcome": outcome,
                "industry": row.get("industry"),
                "created_at": row.get("created_at"),
                "_score": score,
            })

        # Sort by relevance score
        candidates.sort(key=lambda c: c["_score"], reverse=True)

        # Clean up and limit
        results = []
        for c in candidates[:limit]:
            c.pop("_score", None)
            results.append(c)

        return results

    except Exception as exc:
        logger.warning(f"knowledge_service.find_similar_cases failed: {exc}")
        return []


# ---------------------------------------------------------------------------
# 6.4 — Confidence calibration
# ---------------------------------------------------------------------------

def calibrate_confidence(
    ai_confidence: float,
    patterns: list[dict],
) -> tuple[float, int | None]:
    """Calibrate AI confidence using empirical evidence.

    Returns (calibrated_score, evidence_count_or_none).
    When no patterns match with sufficient evidence, returns the original score unchanged.

    Formula (when evidence_count >= 3):
      calibrated = ai_score * 0.7 + empirical_match * 0.3

    empirical_match is the weighted-average success_rate from matching patterns.
    """
    if not patterns:
        return ai_confidence, None

    # Only use patterns with sufficient evidence
    strong_patterns = [p for p in patterns if (p.get("evidence_count") or 0) >= 3]
    if not strong_patterns:
        # Return original but note total evidence count
        total_evidence = sum(p.get("evidence_count", 0) for p in patterns)
        return ai_confidence, total_evidence if total_evidence > 0 else None

    # Weighted average success rate (weighted by evidence count)
    total_weight = 0
    weighted_sum = 0.0
    total_evidence = 0
    for p in strong_patterns:
        weight = p.get("evidence_count", 0)
        rate = p.get("success_rate")
        if rate is not None and weight > 0:
            weighted_sum += float(rate) * weight
            total_weight += weight
        total_evidence += weight

    if total_weight == 0:
        return ai_confidence, total_evidence if total_evidence > 0 else None

    empirical_match = weighted_sum / total_weight
    calibrated = ai_confidence * 0.7 + empirical_match * 0.3

    # Clamp to [0, 1]
    calibrated = max(0.0, min(1.0, calibrated))

    return round(calibrated, 4), total_evidence
