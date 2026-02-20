"""Public pricing router.

Provides Stripe-backed plan pricing with cache/default fallback so
marketing pages never render blank prices.
"""

from __future__ import annotations

import os
import time
from typing import Any

import stripe
from fastapi import APIRouter, Response

from config import settings

router = APIRouter(prefix="/api/pricing", tags=["pricing"])

_DEFAULT_PRICES_USD = {
    "free": 0,
    "pro": 79,
    "quality": 299,
    "enterprise": 799,
}

_CACHE_TTL_SECONDS = 600
_cache: dict[str, Any] = {"ts": 0.0, "payload": None}


def _price_ids() -> dict[str, str]:
    return {
        "pro": settings.stripe_price_id_pro,
        # Keep backward compatibility: existing config uses "team" key.
        "quality": os.getenv("STRIPE_PRICE_ID_QUALITY", settings.stripe_price_id_team),
        "enterprise": os.getenv("STRIPE_PRICE_ID_ENTERPRISE", ""),
    }


def _fetch_amount_usd(price_id: str) -> int | None:
    if not price_id:
        return None
    price = stripe.Price.retrieve(price_id)
    unit_amount = getattr(price, "unit_amount", None) if not isinstance(price, dict) else price.get("unit_amount")
    if unit_amount is None:
        return None
    return int(unit_amount) // 100


def _build_payload(source: str, values: dict[str, int]) -> dict[str, Any]:
    return {
        "source": source,
        "currency": "usd",
        "plans": {
            "free": {"monthly": values["free"]},
            "pro": {"monthly": values["pro"]},
            "quality": {"monthly": values["quality"]},
            "enterprise": {"monthly": values["enterprise"]},
        },
    }


@router.get("/plans")
async def get_public_plan_pricing(response: Response) -> dict[str, Any]:
    """Return current plan pricing for marketing pages.

    Priority:
    1) Stripe live prices (if configured/reachable)
    2) In-memory cache from last successful Stripe fetch
    3) Hard defaults
    """
    response.headers["Cache-Control"] = "public, max-age=300"

    now = time.time()
    if _cache.get("payload") and now - float(_cache.get("ts", 0)) < _CACHE_TTL_SECONDS:
        return _cache["payload"]

    if not settings.stripe_secret_key:
        payload = _build_payload("default", _DEFAULT_PRICES_USD)
        _cache.update({"ts": now, "payload": payload})
        return payload

    stripe.api_key = settings.stripe_secret_key

    try:
        ids = _price_ids()
        values = dict(_DEFAULT_PRICES_USD)

        for plan in ("pro", "quality", "enterprise"):
            amount = _fetch_amount_usd(ids.get(plan, ""))
            if amount is not None:
                values[plan] = amount

        payload = _build_payload("stripe", values)
        _cache.update({"ts": now, "payload": payload})
        return payload
    except Exception:
        if _cache.get("payload"):
            # Return last good payload if Stripe is currently unavailable
            cached = dict(_cache["payload"])
            cached["source"] = "cache"
            return cached

        payload = _build_payload("default", _DEFAULT_PRICES_USD)
        _cache.update({"ts": now, "payload": payload})
        return payload
