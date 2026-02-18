"""Product matching service — finds products in the database that match a generated spec.

Queries `product_specifications` by chemistry keywords extracted from the AI result,
scores candidates against the spec requirements, and returns the top 3.
"""

import logging
import re
from typing import Any

from database import get_supabase

logger = logging.getLogger(__name__)

# Common chemistry keywords to search for (order matters — more specific first)
_CHEMISTRY_KEYWORDS = [
    "cyanoacrylate",
    "epoxy",
    "polyurethane",
    "silicone",
    "acrylic",
    "methacrylate",
    "anaerobic",
    "phenolic",
    "polysulfide",
    "ms polymer",
    "uv cure",
    "hot melt",
    "contact cement",
    "rubber",
]


def _extract_chemistry_keywords(chemistry: str) -> list[str]:
    """Extract searchable chemistry keywords from the AI-generated chemistry string.

    Returns up to 3 keywords, preferring specific chemistry family names.
    """
    if not chemistry:
        return []

    text = chemistry.lower()
    found: list[str] = []

    # First pass: known chemistry families
    for kw in _CHEMISTRY_KEYWORDS:
        if kw in text:
            found.append(kw)

    # Second pass: significant words (>4 chars, not stopwords)
    if len(found) < 2:
        stopwords = {
            "with", "based", "modified", "agent", "agents", "system",
            "type", "grade", "class", "general", "purpose", "standard",
            "hardener", "activator", "primer", "catalyst", "inhibitor",
            "toughened", "toughening", "flexible", "structural", "high",
            "performance", "temperature", "resistant",
        }
        words = re.findall(r"[a-z]+", text)
        for w in words:
            if len(w) > 4 and w not in stopwords and w not in found:
                found.append(w)
                if len(found) >= 3:
                    break

    return found[:3]


def _parse_temp_number(val: str | None) -> float | None:
    """Extract a numeric temperature value from a string like '-40°C' or '150'."""
    if val is None:
        return None
    match = re.search(r"[-+]?\d+(?:\.\d+)?", str(val))
    return float(match.group()) if match else None


async def find_matching_products(
    spec_result: dict[str, Any],
    spec_data: dict[str, Any],
) -> list[dict[str, Any]]:
    """Query product_specifications for products matching the generated spec.

    Args:
        spec_result: The AI-generated spec result dict (recommended_spec, product_characteristics, etc.)
        spec_data: The original user input data dict (substrate_a, substrate_b, environment, etc.)

    Returns:
        List of up to 3 matching product dicts with scores and match reasons.
    """
    db = get_supabase()

    chemistry = spec_result.get("recommended_spec", {}).get("chemistry", "")
    substrate_a = spec_data.get("substrate_a", "")
    substrate_b = spec_data.get("substrate_b", "")

    # 1. Extract chemistry keywords and query
    keywords = _extract_chemistry_keywords(chemistry)
    if not keywords:
        logger.info("No chemistry keywords extracted — skipping product matching")
        return []

    candidates: list[dict] = []
    seen_ids: set[str] = set()

    for keyword in keywords:
        try:
            result = (
                db.table("product_specifications")
                .select("*")
                .ilike("chemistry_type", f"%{keyword}%")
                .limit(15)
                .execute()
            )
            for row in result.data or []:
                row_id = row.get("id")
                if row_id and row_id not in seen_ids:
                    seen_ids.add(row_id)
                    candidates.append(row)
        except Exception as exc:
            logger.warning(f"Product query failed for keyword '{keyword}': {exc}")

    if not candidates:
        logger.info(f"No product candidates found for keywords: {keywords}")
        return []

    # 2. Score each candidate
    env = spec_data.get("environment", {}) or {}
    req_min = _parse_temp_number(env.get("temp_min"))
    req_max = _parse_temp_number(env.get("temp_max"))

    scored: list[dict[str, Any]] = []

    for product in candidates:
        score = 0
        reasons: list[str] = []

        # Temperature range coverage
        prod_min = product.get("operating_temp_min_c")
        prod_max = product.get("operating_temp_max_c")

        if prod_min is not None and prod_max is not None:
            temp_match = True
            if req_min is not None and prod_min > req_min:
                temp_match = False
            if req_max is not None and prod_max < req_max:
                temp_match = False
            if temp_match and (req_min is not None or req_max is not None):
                score += 2
                reasons.append("Temperature range covers requirement")

        # Substrate compatibility
        recommended_subs = product.get("recommended_substrates") or []
        if recommended_subs and isinstance(recommended_subs, list):
            sub_text = " ".join(str(s).lower() for s in recommended_subs)
            for substrate, label in [(substrate_a, substrate_a), (substrate_b, substrate_b)]:
                if substrate:
                    # Check first word (e.g., "Aluminum" from "Aluminum 6061-T6")
                    first_word = substrate.lower().split()[0] if substrate else ""
                    if first_word and first_word in sub_text:
                        score += 2
                        reasons.append(f"Recommended for {label}")

        # Mechanical properties available
        mech = product.get("mechanical_properties") or {}
        if isinstance(mech, dict) and mech:
            score += 1
            reasons.append("Datasheet properties available")

        # Has TDS file
        if product.get("tds_file_url"):
            score += 1

        # Build operating temp string
        operating_temp = None
        if prod_min is not None and prod_max is not None:
            operating_temp = f"{prod_min}°C to {prod_max}°C"
        elif prod_min is not None:
            operating_temp = f"{prod_min}°C min"
        elif prod_max is not None:
            operating_temp = f"{prod_max}°C max"

        # Extract shear strength from mechanical properties
        shear_strength = None
        if isinstance(mech, dict):
            shear_strength = (
                mech.get("shear_strength")
                or mech.get("lap_shear_strength")
                or mech.get("tensile_lap_shear")
            )

        # Extract cure time
        cure_schedule = product.get("cure_schedule") or {}
        cure_time = None
        if isinstance(cure_schedule, dict):
            cure_time = (
                cure_schedule.get("full_cure")
                or cure_schedule.get("full_cure_time")
            )
        if not cure_time and product.get("fixture_time_minutes"):
            cure_time = f"{product['fixture_time_minutes']} min (fixture)"

        scored.append({
            "product_name": product.get("product_name", "Unknown"),
            "manufacturer": product.get("manufacturer"),
            "chemistry_type": product.get("chemistry_type"),
            "score": score,
            "reasons": reasons,
            "operating_temp": operating_temp,
            "shear_strength": shear_strength,
            "cure_time": cure_time,
            "product_id": product.get("id"),
            "tds_available": bool(product.get("tds_file_url")),
        })

    # 3. Sort by score descending, return top 3
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:3]
