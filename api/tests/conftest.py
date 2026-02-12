"""Shared test fixtures for the Gravix test suite.

Sets up sys.path so that `api/` modules are importable without install,
and provides common mocks (Supabase client, settings, auth).
"""

import os
import sys
from unittest.mock import MagicMock, AsyncMock, patch

import pytest

# ---------------------------------------------------------------------------
# Path setup: ensure `api/` is on sys.path so bare imports work
# (e.g. `from config import settings`, `from database import get_supabase`)
# ---------------------------------------------------------------------------

_API_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _API_DIR not in sys.path:
    sys.path.insert(0, _API_DIR)


# ---------------------------------------------------------------------------
# Environment variables — set BEFORE importing any app modules so that
# pydantic-settings doesn't fail on missing secrets.
# ---------------------------------------------------------------------------

os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-service-key")
os.environ.setdefault("SUPABASE_JWT_SECRET", "super-secret-jwt-test-key-at-least-32-chars-long!!")
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-ant-test-key")
os.environ.setdefault("CRON_SECRET", "test-cron-secret")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_fake")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test_fake")
os.environ.setdefault("STRIPE_PRICE_ID_PRO", "price_test_pro")
os.environ.setdefault("STRIPE_PRICE_ID_TEAM", "price_test_team")
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("RESEND_API_KEY", "re_test_fake")


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def mock_supabase():
    """Return a fully-mocked Supabase client and patch get_supabase()."""
    mock_client = MagicMock()

    # Make .table(name) return a chainable mock
    def _make_table_chain(*args, **kwargs):
        chain = MagicMock()
        # Every method returns the chain for fluent API
        for method in (
            "select", "insert", "update", "delete", "upsert",
            "eq", "neq", "gt", "gte", "lt", "lte",
            "in_", "is_", "like", "ilike", "or_",
            "order", "limit", "range", "single",
        ):
            getattr(chain, method).return_value = chain
        # .execute() returns an empty result by default
        execute_result = MagicMock()
        execute_result.data = []
        execute_result.count = 0
        chain.execute.return_value = execute_result
        return chain

    mock_client.table.side_effect = _make_table_chain

    with patch("database.get_supabase", return_value=mock_client):
        yield mock_client


@pytest.fixture()
def fake_user():
    """A minimal user dict as returned by get_current_user."""
    return {
        "id": "user-test-123",
        "email": "test@example.com",
        "plan": "free",
        "role": "user",
        "analyses_this_month": 0,
        "specs_this_month": 0,
    }


@pytest.fixture()
def fake_admin_user():
    """An admin user dict."""
    return {
        "id": "admin-test-456",
        "email": "admin@example.com",
        "plan": "pro",
        "role": "admin",
        "analyses_this_month": 0,
        "specs_this_month": 0,
    }
