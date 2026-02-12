"""Normalization utilities.

Keep deterministic + lightweight. Used to populate normalized columns for search/aggregation.
"""

from __future__ import annotations

import re
from typing import Optional


_WS_RE = re.compile(r"\s+")
_NON_ALNUM_RE = re.compile(r"[^a-z0-9\s\-]", re.IGNORECASE)


_COMMON_MAP = {
    # metals
    "al": "aluminum",
    "alu": "aluminum",
    "aluminium": "aluminum",
    # plastics
    "pc": "polycarbonate",
    "abs": "abs",
    "pmma": "acrylic",
    # composites / general
    "cf": "carbon fiber",
    "cfrp": "carbon fiber",
}


def normalize_substrate(value: Optional[str]) -> Optional[str]:
    """Normalize a substrate/material string.

    Rules:
    - None/empty -> None
    - lowercase
    - remove punctuation (keep spaces and hyphens)
    - collapse whitespace
    - map a few common abbreviations

    This is intentionally simple; we can iterate later.
    """

    if value is None:
        return None

    s = value.strip().lower()
    if not s:
        return None

    # Normalize separators
    s = s.replace("_", " ")

    # Remove punctuation except spaces/hyphens
    s = _NON_ALNUM_RE.sub(" ", s)

    # Collapse whitespace
    s = _WS_RE.sub(" ", s).strip()

    # Map exact abbreviations
    return _COMMON_MAP.get(s, s)
