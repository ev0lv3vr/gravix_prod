"""AI output post-processing filter.

Store full AI output in the DB; serve a plan-gated version to the client.
Called after AI results are built, before returning the response.

Design principle: "store full, serve filtered" — complete output stays in DB
so upgrading users immediately get the full result without re-running AI.
"""

import copy
import logging

from config.plan_features import PLAN_FEATURES

logger = logging.getLogger(__name__)


def _resolve_plan(plan: str) -> str:
    """Resolve plan name to canonical key in PLAN_FEATURES."""
    # "quality" is the frontend/Stripe name; "team" is the canonical key.
    # PLAN_FEATURES has both since PR #39 added the alias, but be safe.
    p = (plan or "free").lower()
    if p in PLAN_FEATURES:
        return p
    if p == "quality":
        return "team"
    return "free"


def filter_ai_output(result: dict, plan: str) -> dict:
    """Filter AI analysis output based on the user's plan tier.

    Args:
        result: Full analysis record dict (will NOT be mutated).
        plan: User's plan string (e.g. "free", "pro", "quality", "team").

    Returns:
        A filtered copy of the result dict.
    """
    resolved = _resolve_plan(plan)
    features = PLAN_FEATURES.get(resolved, PLAN_FEATURES["free"])
    ai_rules = features.get("ai_output", {})

    # Admin / enterprise / team get everything — fast path
    if not ai_rules:
        return result

    out = copy.deepcopy(result)

    # 1. Truncate root_causes to root_causes_max
    max_causes = ai_rules.get("root_causes_max", 5)
    if "root_causes" in out and isinstance(out["root_causes"], list):
        out["root_causes"] = out["root_causes"][:max_causes]

        # Strip confidence from each root cause if not allowed
        if not ai_rules.get("confidence_scores", True):
            for rc in out["root_causes"]:
                if isinstance(rc, dict):
                    rc.pop("confidence", None)
                    rc.pop("confidence_score", None)

    # 2. Strip top-level confidence_score if not allowed
    if not ai_rules.get("confidence_scores", True):
        out.pop("confidence_score", None)

    # 3. Contributing factors
    if not ai_rules.get("contributing_factors", True):
        out["contributing_factors"] = []

    # 4. Prevention plan
    if not ai_rules.get("prevention_plan", True):
        out["prevention_plan"] = None

    # 5. Similar cases
    similar_mode = ai_rules.get("similar_cases", "full_detail_5")
    if similar_mode == "hidden":
        out["similar_cases"] = None
    elif similar_mode == "count_only":
        cases = out.get("similar_cases")
        if cases and isinstance(cases, list):
            out["similar_cases"] = [{"count": len(cases)}]
        else:
            out["similar_cases"] = [{"count": 0}]
    elif similar_mode == "full_detail_5":
        cases = out.get("similar_cases")
        if cases and isinstance(cases, list):
            out["similar_cases"] = cases[:5]
    # else: pass through as-is

    return out
