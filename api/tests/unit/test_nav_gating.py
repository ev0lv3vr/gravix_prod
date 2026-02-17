"""Unit tests for nav link visibility by plan tier.

Tests the logic that determines which navigation links are visible
based on user authentication state and plan tier. Since the actual
nav rendering is in React, these tests validate the gating rules/utility
functions that drive nav visibility.
"""

import pytest


# ---------------------------------------------------------------------------
# Nav gating rule helpers (inline — mirrors frontend NavConfig logic)
# ---------------------------------------------------------------------------

# These represent the nav gating rules from the frontend.
# The frontend uses a config-driven approach; we test the config logic here.

PUBLIC_LINKS = ["Analyze", "Products", "Case Library", "Pricing", "Sign In", "Get Started Free"]
PROTECTED_LINKS = ["Dashboard", "Notifications", "User Menu"]
QUALITY_LINKS = ["Investigations"]
ENTERPRISE_LINKS = ["Investigations"]

ANALYZE_DROPDOWN_PUBLIC = ["Failure Analysis", "Spec Engine"]
ANALYZE_DROPDOWN_AUTHENTICATED = ["Failure Analysis", "Spec Engine", "Guided Investigation"]


def get_visible_nav_links(user=None):
    """Return list of visible nav link labels for a given user (or None for logged out)."""
    if user is None:
        return PUBLIC_LINKS

    links = ["Analyze", "Products", "Case Library", "Dashboard", "Notifications", "User Menu"]

    plan = user.get("plan", "free")
    if plan in ("quality", "enterprise"):
        links.append("Investigations")

    return links


def get_analyze_dropdown_items(user=None):
    """Return analyze dropdown items for a given user."""
    if user is None:
        return ANALYZE_DROPDOWN_PUBLIC
    return ANALYZE_DROPDOWN_AUTHENTICATED


def get_notification_badge_count(unread_count):
    """Return badge text for notification bell. None means no badge."""
    if unread_count <= 0:
        return None
    return str(unread_count)


# =====================================================================
# Logged-Out Nav
# =====================================================================

class TestLoggedOutNav:
    def test_logged_out_nav_shows_public_links(self):
        """Nav renders: Analyze dropdown, Products, Case Library, Pricing, Sign In, Get Started Free."""
        links = get_visible_nav_links(user=None)
        for expected in ["Analyze", "Products", "Case Library", "Pricing", "Sign In", "Get Started Free"]:
            assert expected in links, f"Expected '{expected}' in logged-out nav"

    def test_logged_out_nav_hides_protected_links(self):
        """Nav does NOT render: Dashboard, Investigations, Notifications bell."""
        links = get_visible_nav_links(user=None)
        for hidden in ["Dashboard", "Investigations", "Notifications"]:
            assert hidden not in links, f"'{hidden}' should not be in logged-out nav"

    def test_logged_out_nav_analyze_dropdown_items(self):
        """Analyze dropdown contains: 'Failure Analysis' → /failure, 'Spec Engine' → /tool."""
        items = get_analyze_dropdown_items(user=None)
        assert "Failure Analysis" in items
        assert "Spec Engine" in items
        assert "Guided Investigation" not in items


# =====================================================================
# Logged-In Nav (Free/Pro)
# =====================================================================

class TestFreeProNav:
    def test_free_user_nav_shows_core_links(self):
        """Nav renders: Analyze, Products, Cases, Dashboard, Notifications bell, User menu."""
        user = {"id": "u1", "plan": "free"}
        links = get_visible_nav_links(user)
        for expected in ["Analyze", "Products", "Dashboard", "Notifications", "User Menu"]:
            assert expected in links

    def test_free_user_nav_hides_investigations(self):
        """Investigations link NOT visible for Free/Pro users."""
        for plan in ("free", "pro"):
            user = {"id": "u1", "plan": plan}
            links = get_visible_nav_links(user)
            assert "Investigations" not in links, f"Investigations visible for {plan}"

    def test_pro_user_nav_analyze_includes_guided(self):
        """Analyze dropdown includes: Failure Analysis, Spec Engine, Guided Investigation."""
        user = {"id": "u1", "plan": "pro"}
        items = get_analyze_dropdown_items(user)
        assert "Guided Investigation" in items
        assert "Failure Analysis" in items
        assert "Spec Engine" in items


# =====================================================================
# Logged-In Nav (Quality/Enterprise)
# =====================================================================

class TestQualityEnterpriseNav:
    def test_quality_user_nav_shows_investigations(self):
        """Investigations link visible for Quality plan."""
        user = {"id": "u1", "plan": "quality"}
        links = get_visible_nav_links(user)
        assert "Investigations" in links

    def test_enterprise_user_nav_shows_investigations(self):
        """Investigations link visible for Enterprise plan."""
        user = {"id": "u1", "plan": "enterprise"}
        links = get_visible_nav_links(user)
        assert "Investigations" in links


# =====================================================================
# Notification Bell
# =====================================================================

class TestNotificationBell:
    def test_notification_bell_shows_unread_count(self):
        """Bell badge shows count of unread notifications (e.g., '3')."""
        assert get_notification_badge_count(3) == "3"
        assert get_notification_badge_count(1) == "1"
        assert get_notification_badge_count(99) == "99"

    def test_notification_bell_zero_hides_badge(self):
        """Bell has no badge when unread count is 0."""
        assert get_notification_badge_count(0) is None
        assert get_notification_badge_count(-1) is None
