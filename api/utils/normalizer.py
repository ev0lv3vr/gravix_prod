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
    "ss": "stainless steel",
    "ss304": "stainless steel 304",
    "ss316l": "stainless steel 316l",
    "crs": "mild steel",
    "cold rolled steel": "mild steel",
    "galv steel": "galvanized steel",
    "cu": "copper",
    "cu-zn": "brass",
    "ti-6al-4v": "titanium grade 5",
    "ti64": "titanium grade 5",
    "in718": "inconel 718",
    "c276": "hastelloy c-276",
    "mg": "magnesium",
    "zamak": "zinc die cast",
    # plastics
    "pc": "polycarbonate",
    "lexan": "polycarbonate",
    "makrolon": "polycarbonate",
    "abs": "abs",
    "pmma": "acrylic",
    "plexiglass": "acrylic",
    "perspex": "acrylic",
    "lucite": "acrylic",
    "pa6": "nylon 6",
    "pa66": "nylon 6-6",
    "pp": "polypropylene",
    "hdpe": "hdpe",
    "ldpe": "ldpe",
    "ptfe": "ptfe",
    "teflon": "ptfe",
    "delrin": "pom",
    "acetal": "pom",
    "polyoxymethylene": "pom",
    "peek": "peek",
    "pei": "ultem",
    "ultem": "ultem",
    "noryl": "ppo-ppe",
    "kapton": "polyimide",
    "vespel": "polyimide",
    "g10": "fr-4",
    "uhmwpe": "uhmwpe",
    # elastomers
    "vmq": "silicone rubber",
    "fkm": "viton",
    "viton": "viton",
    "nbr": "nitrile rubber",
    "buna-n": "nitrile rubber",
    "epdm": "epdm",
    "cr": "neoprene",
    "chloroprene": "neoprene",
    "iir": "butyl rubber",
    "tpv": "santoprene",
    "sbr": "sbr",
    # composites / general
    "cf": "carbon fiber",
    "cfrp": "carbon fiber",
    "gfrp": "glass fiber",
    "kevlar": "aramid fiber",
    "mdf": "mdf",
    # ceramics / glass
    "pyrex": "borosilicate glass",
    "al2o3": "alumina ceramic",
    "zro2": "zirconia ceramic",
    "sic": "silicon carbide ceramic",
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
