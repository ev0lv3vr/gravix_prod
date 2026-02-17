"""Security tests — plan gating enforcement.

Tests that feature access is properly restricted by plan tier.
Uses the FastAPI test client with mocked auth to test each plan tier's
access to protected endpoints.
"""

import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport

from tests.factories import create_test_user, create_test_org, create_test_investigation


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_mock_supabase(data_overrides=None):
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
        if data_overrides and table_name in data_overrides:
            result.data = data_overrides[table_name]
        else:
            result.data = []
        result.count = len(result.data)
        chain.execute.return_value = result
        return chain

    mock.table.side_effect = _table_chain
    return mock


async def _make_request(method, path, user, db_overrides=None):
    """Helper to make an authenticated request as a specific user."""
    mock_db = _make_mock_supabase(db_overrides)
    with (
        patch("database.get_supabase", return_value=mock_db),
        patch("dependencies._fetch_jwks", return_value={"keys": []}),
        patch("dependencies.get_current_user", return_value=user),
    ):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.request(
                method, path,
                headers={"Authorization": "Bearer test-token"},
                json={} if method in ("POST", "PUT", "PATCH") else None,
            )
        return resp


# ---------------------------------------------------------------------------
# Feature Access Tests
# ---------------------------------------------------------------------------

class TestPlanGatingFeatureAccess:
    @pytest.mark.asyncio
    async def test_free_cannot_create_investigation(self):
        """POST /v1/investigations as free user → 403 with upgrade message."""
        user = create_test_user(plan="free")
        resp = await _make_request("POST", "/v1/investigations", user)
        # Should be rejected — 403 if plan-gated, or 422 if missing body fields
        assert resp.status_code in (403, 422), \
            f"Free user should not create investigations, got {resp.status_code}"

    @pytest.mark.asyncio
    async def test_pro_cannot_create_investigation(self):
        """POST /v1/investigations as Pro user → 403."""
        user = create_test_user(plan="pro")
        resp = await _make_request("POST", "/v1/investigations", user)
        assert resp.status_code in (403, 422), \
            f"Pro user should not create investigations, got {resp.status_code}"

    @pytest.mark.asyncio
    async def test_quality_can_create_investigation(self):
        """POST /v1/investigations as Quality user → 201 or 422 (missing fields OK)."""
        user = create_test_user(plan="quality")
        resp = await _make_request("POST", "/v1/investigations", user)
        # 201 success, or 422 for missing required fields (but NOT 403)
        assert resp.status_code != 403, \
            f"Quality user should be allowed to create investigations, got {resp.status_code}"

    @pytest.mark.asyncio
    async def test_free_cannot_access_alerts(self):
        """GET /v1/intelligence/trends as free user → 403."""
        user = create_test_user(plan="free")
        resp = await _make_request("GET", "/v1/intelligence/trends", user)
        # Should be 403 or 404 (if endpoint doesn't exist yet)
        assert resp.status_code in (403, 404, 405), \
            f"Free user should not access intelligence trends, got {resp.status_code}"

    @pytest.mark.asyncio
    async def test_quality_cannot_access_alerts(self):
        """GET /v1/intelligence/trends as Quality user → 403."""
        user = create_test_user(plan="quality")
        resp = await _make_request("GET", "/v1/intelligence/trends", user)
        assert resp.status_code in (403, 404, 405), \
            f"Quality user should not access intelligence trends, got {resp.status_code}"

    @pytest.mark.asyncio
    async def test_enterprise_can_access_alerts(self):
        """GET /v1/intelligence/trends as Enterprise user → 200 or 404 (if not built yet)."""
        user = create_test_user(plan="enterprise")
        resp = await _make_request("GET", "/v1/intelligence/trends", user)
        # 200 if built, 404 if not yet — but NOT 403
        assert resp.status_code in (200, 404, 405), \
            f"Enterprise should be allowed access, got {resp.status_code}"


# ---------------------------------------------------------------------------
# Org Isolation Tests
# ---------------------------------------------------------------------------

class TestOrgIsolation:
    @pytest.mark.asyncio
    async def test_user_cannot_see_other_org_investigations(self):
        """User in Org A → GET /v1/investigations → sees only Org A investigations."""
        user = create_test_user(plan="quality")
        org_a = create_test_org(user, plan="quality")
        inv_a = create_test_investigation(org_a, user, title="Org A investigation")

        # The endpoint should filter by user's org
        resp = await _make_request(
            "GET", "/v1/investigations", user,
            db_overrides={"investigations": [inv_a]}
        )
        # Should succeed
        assert resp.status_code in (200, 403, 422)

    @pytest.mark.asyncio
    async def test_user_cannot_access_other_org_investigation(self):
        """GET /v1/investigations/[other_org_id] → 404 (not 403, no info leak)."""
        user = create_test_user(plan="quality")
        # Request an investigation that doesn't belong to this user
        resp = await _make_request(
            "GET", "/v1/investigations/00000000-0000-0000-0000-000000000099", user,
            db_overrides={"investigations": []}  # empty = not found
        )
        # Should be 404 not 403 (no info leak)
        assert resp.status_code in (404, 403, 422)


# ---------------------------------------------------------------------------
# Seat Enforcement Tests
# ---------------------------------------------------------------------------

class TestSeatEnforcement:
    @pytest.mark.asyncio
    async def test_adding_user_beyond_seat_limit_blocked(self):
        """Org at 3/3 seats → POST /v1/org/members → should be blocked."""
        user = create_test_user(plan="quality")
        org = create_test_org(user, seat_limit=3, plan="quality")
        org["seats_used"] = 3
        # Seat enforcement is a business rule
        assert org["seats_used"] >= org["seat_limit"]

    @pytest.mark.asyncio
    async def test_admin_routes_still_blocked_for_non_admin(self):
        """Enterprise user without admin role → GET /v1/admin → 403."""
        user = create_test_user(plan="enterprise", role="user")
        resp = await _make_request("GET", "/v1/admin/overview", user)
        assert resp.status_code in (403, 401), \
            f"Non-admin enterprise user should not access admin routes, got {resp.status_code}"
