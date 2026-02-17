"""Unit tests for form state persistence logic (localStorage save/restore for auth gate).

Since localStorage is a browser API, these tests validate the serialization,
key management, and field inclusion/exclusion rules that the frontend uses.
We test the logic layer, not the DOM.
"""

import json
import pytest


# ---------------------------------------------------------------------------
# Form persistence helpers (mirrors frontend utils/formPersistence.ts logic)
# ---------------------------------------------------------------------------

FAILURE_FORM_KEY = "gravix_pending_analysis"
SPEC_FORM_KEY = "gravix_pending_spec"

SENSITIVE_FIELDS = {"auth_token", "user_id", "session_id", "access_token", "refresh_token"}


def save_form_state(storage: dict, key: str, form_data: dict) -> None:
    """Save form data to storage (dict simulating localStorage), excluding sensitive fields."""
    filtered = {k: v for k, v in form_data.items() if k not in SENSITIVE_FIELDS}
    storage[key] = json.dumps(filtered)


def restore_form_state(storage: dict, key: str) -> dict | None:
    """Restore form data from storage. Returns None if not present."""
    raw = storage.get(key)
    if raw is None:
        return None
    return json.loads(raw)


def clear_form_state(storage: dict, key: str) -> None:
    """Remove form data from storage after successful submission."""
    storage.pop(key, None)


def should_auto_submit(storage: dict, key: str, is_authenticated: bool) -> bool:
    """After auth callback, check if pending form data should auto-submit."""
    return is_authenticated and key in storage


# =====================================================================
# localStorage Save
# =====================================================================

class TestFormSave:
    def test_failure_form_saves_to_localstorage_on_input(self):
        """Every input change writes form state to localStorage key 'gravix_pending_analysis'."""
        storage = {}
        form_data = {"substrate1": "Aluminum", "substrate2": "ABS", "description": "Bond failed"}
        save_form_state(storage, FAILURE_FORM_KEY, form_data)
        assert FAILURE_FORM_KEY in storage
        saved = json.loads(storage[FAILURE_FORM_KEY])
        assert saved["substrate1"] == "Aluminum"

    def test_spec_form_saves_to_localstorage_on_input(self):
        """Spec engine form saves under key 'gravix_pending_spec'."""
        storage = {}
        form_data = {"substrate_a": "PP", "substrate_b": "Steel", "requirements": "High temp"}
        save_form_state(storage, SPEC_FORM_KEY, form_data)
        assert SPEC_FORM_KEY in storage

    def test_localstorage_includes_all_fields(self):
        """Saved state includes: substrate1, substrate2, description, adhesive_type,
        failure_mode, product_name, photos (as refs), all optional fields."""
        storage = {}
        form_data = {
            "substrate1": "Aluminum",
            "substrate2": "ABS",
            "description": "Bond failed at interface",
            "adhesive_type": "cyanoacrylate",
            "failure_mode": "adhesive_failure",
            "product_name": "Loctite 495",
            "photos": ["file_ref_1.jpg", "file_ref_2.jpg"],
            "environment": "high humidity",
            "temperature": "85C",
        }
        save_form_state(storage, FAILURE_FORM_KEY, form_data)
        restored = json.loads(storage[FAILURE_FORM_KEY])
        for field in form_data:
            assert field in restored, f"Field '{field}' missing from saved state"

    def test_localstorage_excludes_sensitive_data(self):
        """Saved state does NOT include auth tokens, user_id, or session data."""
        storage = {}
        form_data = {
            "substrate1": "Steel",
            "auth_token": "secret-jwt",
            "user_id": "user-123",
            "session_id": "sess-456",
            "access_token": "at-789",
            "refresh_token": "rt-000",
        }
        save_form_state(storage, FAILURE_FORM_KEY, form_data)
        restored = json.loads(storage[FAILURE_FORM_KEY])
        for sensitive in SENSITIVE_FIELDS:
            assert sensitive not in restored, f"Sensitive field '{sensitive}' should be excluded"
        assert "substrate1" in restored  # non-sensitive field kept


# =====================================================================
# localStorage Restore
# =====================================================================

class TestFormRestore:
    def test_form_restores_from_localstorage_on_mount(self):
        """On page load, if 'gravix_pending_analysis' exists, form auto-populates."""
        storage = {}
        original = {"substrate1": "Aluminum", "substrate2": "ABS", "description": "Bond failed"}
        save_form_state(storage, FAILURE_FORM_KEY, original)
        restored = restore_form_state(storage, FAILURE_FORM_KEY)
        assert restored is not None
        assert restored["substrate1"] == "Aluminum"
        assert restored["description"] == "Bond failed"

    def test_form_auto_submits_after_auth(self):
        """After auth callback, if pending analysis exists, form submits automatically."""
        storage = {}
        save_form_state(storage, FAILURE_FORM_KEY, {"substrate1": "Al"})
        assert should_auto_submit(storage, FAILURE_FORM_KEY, is_authenticated=True)
        assert not should_auto_submit(storage, FAILURE_FORM_KEY, is_authenticated=False)

    def test_localstorage_cleared_after_successful_submit(self):
        """After successful analysis submission, localStorage key is removed."""
        storage = {}
        save_form_state(storage, FAILURE_FORM_KEY, {"substrate1": "Al"})
        assert FAILURE_FORM_KEY in storage
        clear_form_state(storage, FAILURE_FORM_KEY)
        assert FAILURE_FORM_KEY not in storage

    def test_localstorage_survives_page_reload(self):
        """Form data persists across page reload (not cleared by navigation).
        Simulated by writing, then reading from the same storage dict."""
        storage = {}
        original = {"substrate1": "Glass", "substrate2": "PP"}
        save_form_state(storage, FAILURE_FORM_KEY, original)
        # Simulate "page reload" — same storage, new restore call
        restored = restore_form_state(storage, FAILURE_FORM_KEY)
        assert restored == original
