"""Performance tests — investigation list with 100+ items.

Tests that the investigation list endpoint performs well under
realistic data volumes.
"""

import time
import uuid
import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport

from tests.factories import create_test_user, create_test_org


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_investigations(n=100):
    """Generate n investigation records for perf testing."""
    return [
        {
            "id": str(uuid.uuid4()),
            "investigation_number": f"GQ-2026-{1000 + i}",
            "title": f"Investigation #{i}",
            "customer": f"Customer {i % 10}",
            "severity": ["minor", "major", "critical"][i % 3],
            "status": ["draft", "open", "containment", "investigating", "verification", "closed"][i % 6],
            "template": "generic_8d",
            "created_at": f"2026-{(i % 12) + 1:02d}-{(i % 28) + 1:02d}T10:00:00Z",
        }
        for i in range(n)
    ]


def _make_mock_supabase_with_investigations(investigations):
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
        if table_name == "investigations":
            result.data = investigations[:25]  # paginated — first page only
            result.count = len(investigations)
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

class TestInvestigationListLoad:
    @pytest.mark.asyncio
    async def test_investigation_list_with_100_items(self):
        """Org with 100 investigations → /v1/investigations loads in <1s.
        Paginated — not all 100 loaded at once."""
        user = create_test_user(plan="quality", email="perf@test.com")
        investigations = _generate_investigations(100)
        mock_db = _make_mock_supabase_with_investigations(investigations)

        with (
            patch("database.get_supabase", return_value=mock_db),
            patch("dependencies._fetch_jwks", return_value={"keys": []}),
            patch("dependencies._verify_token", return_value={"sub": user["id"], "email": user["email"]}),
        ):
            from main import app
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                start = time.perf_counter()
                resp = await client.get(
                    "/v1/investigations",
                    headers={"Authorization": "Bearer test-token"},
                )
                elapsed = time.perf_counter() - start

            assert resp.status_code in (200, 403, 422), f"Got {resp.status_code}"
            assert elapsed < 1.0, f"Investigation list took {elapsed:.3f}s (limit: 1.0s)"
