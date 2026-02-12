"""Integration smoke tests — verify endpoint registration + basic responses.

Uses httpx.AsyncClient with ASGITransport against the real FastAPI app.
All external services (Supabase, Anthropic, Stripe) are mocked.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from httpx import AsyncClient, ASGITransport


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_mock_supabase():
    """Create a Supabase mock that returns empty data by default."""
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
def mock_supabase_global():
    """Patch get_supabase at the module level (database.py)."""
    mock = _make_mock_supabase()
    with patch("database.get_supabase", return_value=mock):
        yield mock


@pytest.fixture()
def mock_jwks():
    """Patch JWKS fetch to return empty keys (forces HS256 path)."""
    with patch("dependencies._fetch_jwks", return_value={"keys": []}):
        yield


# ---------------------------------------------------------------------------
# 1. Health / root endpoints (no auth)
# ---------------------------------------------------------------------------

class TestHealthEndpoints:
    @pytest.mark.asyncio
    async def test_root_returns_ok(self, mock_supabase_global, mock_jwks):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "gravix-api"

    @pytest.mark.asyncio
    async def test_health_returns_ok(self, mock_supabase_global, mock_jwks):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert "version" in data
        assert "environment" in data


# ---------------------------------------------------------------------------
# 2. Protected endpoints return 403/401 without auth
# ---------------------------------------------------------------------------

class TestProtectedEndpointsRequireAuth:
    """All user-facing endpoints should reject unauthenticated requests."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize("method,path", [
        ("POST", "/analyze"),
        ("GET", "/analyze"),
        ("POST", "/billing/portal"),
        ("POST", "/billing/checkout"),
        ("GET", "/v1/feedback/pending/list"),
        ("GET", "/v1/admin/overview"),
        ("GET", "/v1/admin/users"),
    ])
    async def test_protected_endpoint_no_auth(self, method, path, mock_supabase_global, mock_jwks):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.request(method, path)
        # HTTPBearer returns 403 when no Authorization header
        assert resp.status_code in (401, 403), f"{method} {path} returned {resp.status_code}"


# ---------------------------------------------------------------------------
# 3. Cron endpoints require X-Cron-Secret header
# ---------------------------------------------------------------------------

class TestCronEndpoints:
    @pytest.mark.asyncio
    @pytest.mark.parametrize("path", [
        "/v1/cron/send-followups",
        "/v1/cron/aggregate-knowledge",
        "/v1/cron/aggregate-metrics",
    ])
    async def test_cron_no_secret_returns_422(self, path, mock_supabase_global, mock_jwks):
        """Without X-Cron-Secret header, FastAPI returns 422 (missing required header)."""
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(path)
        assert resp.status_code == 422

    @pytest.mark.asyncio
    @pytest.mark.parametrize("path", [
        "/v1/cron/send-followups",
        "/v1/cron/aggregate-knowledge",
        "/v1/cron/aggregate-metrics",
    ])
    async def test_cron_wrong_secret_returns_403(self, path, mock_supabase_global, mock_jwks):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.post(path, headers={"X-Cron-Secret": "wrong-secret"})
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 4. Unknown routes return 404
# ---------------------------------------------------------------------------

class TestNotFound:
    @pytest.mark.asyncio
    async def test_unknown_path(self, mock_supabase_global, mock_jwks):
        from main import app
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            resp = await client.get("/v1/nonexistent")
        assert resp.status_code in (404, 405)
