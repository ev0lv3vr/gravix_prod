"""Security tests — verify auth is enforced on all protected endpoints.

Parameterized tests that hit every known protected endpoint without
valid credentials and assert rejection.
"""

import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _make_mock_supabase():
    mock = MagicMock()

    def _table_chain(*args, **kwargs):
        chain = MagicMock()
        for method in (
            "select", "insert", "update", "delete", "upsert",
            "eq", "neq", "gt", "gte", "lt", "lte",
            "in_", "is_", "like", "ilike", "or_",
            "order", "limit", "range", "single",
        ):
            getattr(chain, method).return_value = chain
        result = MagicMock()
        result.data = []
        result.count = 0
        chain.execute.return_value = result
        return chain

    mock.table.side_effect = _table_chain
    return mock


@pytest.fixture()
def mock_deps():
    mock = _make_mock_supabase()
    with (
        patch("database.get_supabase", return_value=mock),
        patch("dependencies._fetch_jwks", return_value={"keys": []}),
    ):
        yield mock


# ---------------------------------------------------------------------------
# All protected endpoints
# ---------------------------------------------------------------------------

# (method, path) tuples for endpoints that require get_current_user
PROTECTED_ENDPOINTS = [
    # Analysis
    ("POST", "/analyze"),
    ("GET", "/analyze"),
    ("GET", "/analyze/some-fake-id"),
    # Feedback
    ("POST", "/v1/feedback"),
    ("GET", "/v1/feedback/pending/list"),
    ("GET", "/v1/feedback/some-fake-id"),
    # Billing
    ("POST", "/billing/checkout"),
    ("POST", "/billing/portal"),
    # Admin
    ("GET", "/v1/admin/overview"),
    ("GET", "/v1/admin/users"),
    ("PATCH", "/v1/admin/users/some-fake-id"),
    ("GET", "/v1/admin/activity"),
    ("GET", "/v1/admin/request-logs"),
]

# Cron endpoints (require X-Cron-Secret, not Bearer token)
CRON_ENDPOINTS = [
    ("POST", "/v1/cron/send-followups"),
    ("POST", "/v1/cron/aggregate-knowledge"),
    ("POST", "/v1/cron/aggregate-metrics"),
]


class TestAuthEnforcementNoToken:
    """Endpoints must reject requests with no Authorization header."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize("method,path", PROTECTED_ENDPOINTS)
    async def test_no_token_rejected(self, method, path, mock_deps):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.request(method, path)
        assert resp.status_code in (401, 403), (
            f"{method} {path} should require auth, got {resp.status_code}"
        )


class TestAuthEnforcementInvalidToken:
    """Endpoints must reject requests with an invalid Bearer token."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize("method,path", PROTECTED_ENDPOINTS)
    async def test_invalid_token_rejected(self, method, path, mock_deps):
        from main import app
        transport = ASGITransport(app=app)
        headers = {"Authorization": "Bearer invalid-jwt-token"}
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.request(method, path, headers=headers)
        assert resp.status_code in (401, 403, 422), (
            f"{method} {path} should reject invalid token, got {resp.status_code}"
        )


class TestCronSecretEnforcement:
    """Cron endpoints must reject requests without valid X-Cron-Secret."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize("method,path", CRON_ENDPOINTS)
    async def test_no_cron_secret_rejected(self, method, path, mock_deps):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.request(method, path)
        # Missing required header → 422
        assert resp.status_code in (403, 422), (
            f"{method} {path} should require cron secret, got {resp.status_code}"
        )

    @pytest.mark.asyncio
    @pytest.mark.parametrize("method,path", CRON_ENDPOINTS)
    async def test_wrong_cron_secret_rejected(self, method, path, mock_deps):
        from main import app
        transport = ASGITransport(app=app)
        headers = {"X-Cron-Secret": "definitely-wrong"}
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.request(method, path, headers=headers)
        assert resp.status_code == 403, (
            f"{method} {path} should reject wrong secret, got {resp.status_code}"
        )


class TestPublicEndpointsAccessible:
    """Public endpoints should be accessible without auth."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize("path", [
        "/",
        "/health",
    ])
    async def test_public_no_auth_ok(self, path, mock_deps):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get(path)
        assert resp.status_code == 200, (
            f"GET {path} should be public, got {resp.status_code}"
        )
