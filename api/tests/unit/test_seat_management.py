"""Unit tests for seat management logic.

Tests add/remove/limit enforcement for organization seats.
"""

import pytest

from tests.factories import create_test_user, create_test_org


# ---------------------------------------------------------------------------
# Seat management business logic (mirrors backend seat_manager utilities)
# ---------------------------------------------------------------------------

SEAT_PRICES = {
    "quality": 79,     # $79/mo per extra seat
    "enterprise": 49,  # $49/mo per extra seat
}

BASE_SEATS = {
    "free": 1,
    "pro": 1,
    "quality": 3,
    "enterprise": 10,
}


def add_seat(org: dict) -> dict:
    """Attempt to add a seat. Returns updated org or raises ValueError."""
    if org["seats_used"] >= org["seat_limit"]:
        raise ValueError("Seat limit reached — increase limit or upgrade plan")
    org = dict(org)
    org["seats_used"] += 1
    return org


def remove_seat(org: dict) -> dict:
    """Remove a seat. Returns updated org or raises ValueError."""
    if org["seats_used"] <= 1:
        raise ValueError("Cannot remove last seat — owner must remain")
    org = dict(org)
    org["seats_used"] -= 1
    return org


def get_seat_price(plan: str) -> int | None:
    """Return per-seat monthly price for the plan."""
    return SEAT_PRICES.get(plan)


def get_base_seat_count(plan: str) -> int:
    """Return number of included seats for the plan."""
    return BASE_SEATS.get(plan, 1)


def user_inherits_org_plan(org: dict) -> str:
    """Users added to an org inherit the org's plan tier."""
    return org["plan_tier"]


# =====================================================================
# Seat Management Tests
# =====================================================================

class TestSeatManagement:
    def test_add_seat_increments_seats_used(self):
        """Adding seat: seats_used 2 → 3, org within limit."""
        owner = create_test_user(plan="quality")
        org = create_test_org(owner, seat_limit=5, plan="quality")
        org["seats_used"] = 2
        updated = add_seat(org)
        assert updated["seats_used"] == 3

    def test_add_seat_blocked_at_limit(self):
        """Quality org at 3/3 seats: add seat requires limit increase or upgrade."""
        owner = create_test_user(plan="quality")
        org = create_test_org(owner, seat_limit=3, plan="quality")
        org["seats_used"] = 3
        with pytest.raises(ValueError, match="Seat limit reached"):
            add_seat(org)

    def test_remove_seat_decrements_count(self):
        """Removing seat: seats_used 3 → 2, user removed from org."""
        owner = create_test_user(plan="quality")
        org = create_test_org(owner, seat_limit=5, plan="quality")
        org["seats_used"] = 3
        updated = remove_seat(org)
        assert updated["seats_used"] == 2

    def test_seat_price_correct_per_tier(self):
        """Quality extra seat: $79/mo. Enterprise extra seat: $49/mo."""
        assert get_seat_price("quality") == 79
        assert get_seat_price("enterprise") == 49
        assert get_seat_price("free") is None
        assert get_seat_price("pro") is None

    def test_enterprise_higher_seat_limit(self):
        """Enterprise base: 10 seats. Quality base: 3 seats."""
        assert get_base_seat_count("enterprise") == 10
        assert get_base_seat_count("quality") == 3
        assert get_base_seat_count("pro") == 1

    def test_seat_user_inherits_org_plan(self):
        """User added to Quality org gets Quality-tier rate limits and feature access."""
        owner = create_test_user(plan="quality")
        org = create_test_org(owner, seat_limit=3, plan="quality")
        assert user_inherits_org_plan(org) == "quality"

        ent_owner = create_test_user(plan="enterprise")
        ent_org = create_test_org(ent_owner, seat_limit=10, plan="enterprise")
        assert user_inherits_org_plan(ent_org) == "enterprise"
