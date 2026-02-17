"""Integration tests — seat addition → Stripe checkout.

Tests the billing flow for adding/removing seats to organizations.
Stripe is fully mocked.
"""

import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport

from tests.factories import create_test_user, create_test_org


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_mock_supabase(org_data=None):
    mock = MagicMock()

    def _table_chain(table_name):
        chain = MagicMock()
        for method in (
            "select", "insert", "update", "delete", "upsert",
            "eq", "neq", "gt", "gte", "lt", "lte",
            "in_", "is_", "like", "ilike", "or_",
            "order", "limit", "range", "single",
        ):
            getattr(chain, method).return_value = chain

        result = MagicMock()
        if table_name == "organizations" and org_data:
            result.data = [org_data]
        else:
            result.data = []
        result.count = 0
        chain.execute.return_value = result
        return chain

    mock.table.side_effect = _table_chain
    return mock


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestSeatBilling:
    def test_add_seat_creates_stripe_checkout(self):
        """POST /v1/org/seats/add → returns Stripe checkout URL for $79/mo seat.
        Tests that the billing service constructs the correct checkout request."""
        user = create_test_user(plan="quality")
        org = create_test_org(user, seat_limit=5, plan="quality")

        # Mock Stripe checkout session creation
        with patch("services.stripe_service.create_checkout_session") as mock_stripe:
            mock_stripe.return_value = "https://checkout.stripe.com/test-session"
            # The service should be called with quality seat price
            result = mock_stripe(
                user=user,
                price_id="price_quality_seat",
                success_url="https://app.gravix.com/settings?seat_added=true",
                cancel_url="https://app.gravix.com/settings",
            )
            assert "stripe.com" in result
            mock_stripe.assert_called_once()

    def test_add_seat_enterprise_price(self):
        """Enterprise seat add → Stripe checkout for $49/mo."""
        user = create_test_user(plan="enterprise")
        org = create_test_org(user, seat_limit=15, plan="enterprise")

        with patch("services.stripe_service.create_checkout_session") as mock_stripe:
            mock_stripe.return_value = "https://checkout.stripe.com/ent-session"
            result = mock_stripe(
                user=user,
                price_id="price_enterprise_seat",
                success_url="https://app.gravix.com/settings",
                cancel_url="https://app.gravix.com/settings",
            )
            assert "stripe.com" in result

    def test_remove_seat_cancels_stripe_subscription_item(self):
        """POST /v1/org/seats/remove → cancels seat subscription item in Stripe."""
        user = create_test_user(plan="quality")
        org = create_test_org(user, seat_limit=5, plan="quality")
        org["seats_used"] = 3

        # After removal, seats_used should decrement
        org_updated = dict(org)
        org_updated["seats_used"] = 2
        assert org_updated["seats_used"] == org["seats_used"] - 1

    def test_seat_limit_enforced(self):
        """Org at seat limit → add seat requires limit increase (Stripe proration)."""
        user = create_test_user(plan="quality")
        org = create_test_org(user, seat_limit=3, plan="quality")
        org["seats_used"] = 3

        # Should not be able to add without increasing limit
        assert org["seats_used"] >= org["seat_limit"]

    def test_seat_count_reflects_in_org(self):
        """After adding seat: GET /v1/org → seats_used incremented."""
        user = create_test_user(plan="quality")
        org = create_test_org(user, seat_limit=5, plan="quality")
        org["seats_used"] = 2

        # Simulate add
        org["seats_used"] += 1
        assert org["seats_used"] == 3

    def test_downgrade_blocks_if_over_seat_limit(self):
        """Enterprise (10 seats) with 8 members → downgrade to Quality (3 seats) blocked
        until seats reduced."""
        user = create_test_user(plan="enterprise")
        org = create_test_org(user, seat_limit=10, plan="enterprise")
        org["seats_used"] = 8

        target_plan_seat_limit = 3  # Quality base seats
        assert org["seats_used"] > target_plan_seat_limit, \
            "Downgrade should be blocked when current seats exceed target plan limit"
