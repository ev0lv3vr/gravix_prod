"""Simple deterministic classifiers.

Sprint 1: compute root_cause_category for storage/aggregation.
"""

from __future__ import annotations

from typing import Any, Iterable, Optional


def classify_root_cause_category(root_causes: Optional[Iterable[Any]]) -> str:
    """Pick a single root-cause category from a list.

    Accepts root causes shaped as dicts or pydantic models.

    Strategy (deterministic):
    - choose the category of the highest-confidence root cause
    - fallback to the first category seen
    - else "unknown"
    """

    if not root_causes:
        return "unknown"

    best_category: Optional[str] = None
    best_conf: float = -1.0

    for rc in root_causes:
        if rc is None:
            continue

        if hasattr(rc, "model_dump"):
            rc_dict = rc.model_dump()
        elif isinstance(rc, dict):
            rc_dict = rc
        else:
            # Unknown shape; skip.
            continue

        category = rc_dict.get("category") or rc_dict.get("root_cause_category")
        conf = rc_dict.get("confidence")

        if isinstance(category, str):
            category = category.strip()
        else:
            category = None

        if category and best_category is None:
            best_category = category

        try:
            conf_f = float(conf) if conf is not None else None
        except (TypeError, ValueError):
            conf_f = None

        if category and conf_f is not None and conf_f > best_conf:
            best_conf = conf_f
            best_category = category

    return best_category or "unknown"
