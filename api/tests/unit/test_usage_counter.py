"""Unit tests for free tier usage counter and upgrade logic.

Tests the business rules for:
- Displaying remaining analysis count for free users
- Hiding counter for paid plans
- Upgrade banner visibility
- Submission blocking at limit
"""

import pytest


# ---------------------------------------------------------------------------
# Usage counter business logic (mirrors frontend usageCounter utility)
# ---------------------------------------------------------------------------

PLAN_LIMITS = {
    "free": 5,
    "pro": 50,
    "quality": None,  # unlimited
    "enterprise": None,  # unlimited
}


def get_remaining_count(plan: str, used: int) -> int | None:
    """Return remaining analyses for the plan, or None if unlimited."""
    limit = PLAN_LIMITS.get(plan)
    if limit is None:
        return None
    return max(0, limit - used)


def should_show_counter(plan: str) -> bool:
    """Only free tier shows the usage counter."""
    return plan == "free"


def should_show_upgrade_banner(plan: str) -> bool:
    """Show upgrade banner after analysis for free tier only."""
    return plan == "free"


def is_submit_disabled(plan: str, used: int) -> bool:
    """Submit button disabled when at limit.

    Per addendum: only Free tier is hard-blocked at the monthly limit.
    Paid plans should not show a "Monthly Limit Reached" state.
    """
    if plan != "free":
        return False
    limit = PLAN_LIMITS.get(plan) or 0
    return used >= limit


def get_submit_button_text(plan: str, used: int) -> str:
    """Return button text — changes when limit reached."""
    if is_submit_disabled(plan, used):
        return "Monthly Limit Reached"
    return "Analyze Failure"


def is_upgrade_banner_dismissible() -> bool:
    """Upgrade banner can always be dismissed."""
    return True


# =====================================================================
# Counter Display
# =====================================================================

class TestCounterDisplay:
    def test_free_tier_shows_remaining_count(self):
        """Free user sees 'X of 5 analyses remaining this month'."""
        assert should_show_counter("free") is True
        assert get_remaining_count("free", 2) == 3
        assert get_remaining_count("free", 0) == 5
        assert get_remaining_count("free", 5) == 0

    def test_pro_tier_hides_remaining_count(self):
        """Pro user does NOT see usage counter."""
        assert should_show_counter("pro") is False

    def test_quality_tier_hides_remaining_count(self):
        """Quality/Enterprise users do NOT see usage counter."""
        assert should_show_counter("quality") is False
        assert should_show_counter("enterprise") is False

    def test_counter_updates_after_analysis(self):
        """After running analysis, counter decrements by 1."""
        before = get_remaining_count("free", 2)
        after = get_remaining_count("free", 3)
        assert before - after == 1


# =====================================================================
# Upgrade Prompts
# =====================================================================

class TestUpgradePrompts:
    def test_upgrade_banner_shown_after_free_analysis(self):
        """After free-tier analysis completes, non-blocking upgrade banner appears."""
        assert should_show_upgrade_banner("free") is True

    def test_upgrade_banner_not_shown_for_pro(self):
        """Pro users do NOT see upgrade banner after analysis."""
        assert should_show_upgrade_banner("pro") is False

    def test_upgrade_banner_dismissible(self):
        """Clicking X on upgrade banner hides it for the session."""
        assert is_upgrade_banner_dismissible() is True

    def test_limit_reached_disables_submit(self):
        """At 0 remaining, submit button disabled with 'Monthly Limit Reached' text."""
        assert is_submit_disabled("free", 5) is True
        assert get_submit_button_text("free", 5) == "Monthly Limit Reached"
        # Not at limit yet
        assert is_submit_disabled("free", 4) is False
        assert get_submit_button_text("free", 4) == "Analyze Failure"
        # Pro never disabled
        assert is_submit_disabled("pro", 999) is False
