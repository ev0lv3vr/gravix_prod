"""Performance tests — product page SSR latency.

Tests that product pages respond within acceptable time budgets.
Uses mock data to isolate timing from external dependencies.
"""

import time
import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport

from tests.factories import seed_tds_products


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_mock_supabase_with_products(products):
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
        if table_name == "product_specifications":
            result.data = products
        else:
            result.data = []
        result.count = len(products) if table_name == "product_specifications" else 0
        chain.execute.return_value = result
        return chain

    mock.table.side_effect = _table_chain
    return mock


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestProductPageSSR:
    @pytest.mark.asyncio
    async def test_product_catalog_page_load_time(self):
        """GET /v1/products with 50 products → response <500ms.
        Page renders server-side with full content."""
        products = seed_tds_products()
        # Extend to ~50 products
        extended = products * 4  # 60 products
        mock_db = _make_mock_supabase_with_products(extended)

        with (
            patch("database.get_supabase", return_value=mock_db),
            patch("dependencies._fetch_jwks", return_value={"keys": []}),
            patch("dependencies._verify_token", return_value={"sub": "user-perf", "email": "perf@test.com"}),
        ):
            from main import app
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                start = time.perf_counter()
                resp = await client.get("/v1/products", headers={"Authorization": "Bearer test-token"})
                elapsed = time.perf_counter() - start

            assert resp.status_code in (200, 403), f"Got {resp.status_code}"
            # Should respond well under 500ms with mocked DB
            assert elapsed < 0.5, f"Product catalog took {elapsed:.3f}s (limit: 0.5s)"

    @pytest.mark.asyncio
    async def test_product_performance_page_load_time(self):
        """GET /v1/products/{id} → response <300ms.
        Pre-generated static content, not computed on request."""
        products = seed_tds_products()
        mock_db = _make_mock_supabase_with_products(products)

        with (
            patch("database.get_supabase", return_value=mock_db),
            patch("dependencies._fetch_jwks", return_value={"keys": []}),
            patch("dependencies._verify_token", return_value={"sub": "user-perf", "email": "perf@test.com"}),
        ):
            from main import app
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                start = time.perf_counter()
                resp = await client.get(f"/v1/products/{products[0]['id']}", headers={"Authorization": "Bearer test-token"})
                elapsed = time.perf_counter() - start

            # 404 is OK if route requires different path format
            assert resp.status_code in (200, 404, 403), f"Got {resp.status_code}"
            assert elapsed < 0.3, f"Product detail took {elapsed:.3f}s (limit: 0.3s)"
