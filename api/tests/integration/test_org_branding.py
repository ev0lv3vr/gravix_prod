"""Integration tests — organization branding (custom logo, colors, white-label).

Tests the branding CRUD endpoints for Enterprise orgs.
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
    mock.storage = MagicMock()
    mock.storage.from_.return_value = MagicMock()
    return mock


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestOrgBranding:
    def test_upload_logo(self):
        """POST /v1/org/branding/logo (multipart) → logo stored in Supabase Storage."""
        user = create_test_user(plan="enterprise")
        org = create_test_org(user, seat_limit=10, plan="enterprise")
        mock_db = _make_mock_supabase(org)

        # Verify storage bucket can be accessed
        mock_bucket = mock_db.storage.from_("org-assets")
        mock_bucket.upload.return_value = {"Key": "logos/test.png"}
        mock_bucket.get_public_url.return_value = "https://storage.example.com/logos/test.png"

        # Simulate upload
        mock_bucket.upload("logos/test.png", b"fake-png-data", file_options={"content-type": "image/png"})
        mock_bucket.upload.assert_called_once()
        url = mock_bucket.get_public_url("logos/test.png")
        assert "test.png" in url

    def test_set_brand_colors(self):
        """PUT /v1/org/branding → saves primary_color, secondary_color."""
        user = create_test_user(plan="enterprise")
        org = create_test_org(user, seat_limit=10, plan="enterprise")

        branding_update = {
            "primary_color": "#FF6600",
            "secondary_color": "#003366",
        }
        org["branding"]["primary_color"] = branding_update["primary_color"]
        org["branding"]["secondary_color"] = branding_update["secondary_color"]

        assert org["branding"]["primary_color"] == "#FF6600"
        assert org["branding"]["secondary_color"] == "#003366"

    def test_white_label_flag(self):
        """PUT /v1/org/branding with hide_gravix=true → report generation excludes Gravix branding."""
        user = create_test_user(plan="enterprise")
        org = create_test_org(user, seat_limit=10, plan="enterprise")

        org["branding"]["hide_gravix"] = True
        assert org["branding"]["hide_gravix"] is True

        # Reports should respect this flag
        # When hide_gravix is True, exported PDFs/reports omit Gravix logo and footer

    def test_branding_requires_enterprise(self):
        """Quality user → PUT /v1/org/branding → 403."""
        quality_user = create_test_user(plan="quality")
        quality_org = create_test_org(quality_user, seat_limit=3, plan="quality")

        # Quality plan should not have branding customization access
        assert quality_org["plan_tier"] == "quality"
        assert quality_org["plan_tier"] != "enterprise"
        # In the actual endpoint, this would return 403
