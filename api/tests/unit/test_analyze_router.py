"""Tests for failure analysis route behavior."""

from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException, status

from routers import analyze
from schemas.analyze import FailureAnalysisCreate


def _mock_db():
    db = MagicMock()
    updates = []

    def table_chain(*args, **kwargs):
        chain = MagicMock()
        for method in (
            "select",
            "insert",
            "eq",
            "ilike",
            "limit",
        ):
            getattr(chain, method).return_value = chain
        chain.update.side_effect = lambda data: updates.append(data) or chain
        result = MagicMock()
        result.data = []
        chain.execute.return_value = result
        return chain

    db.table.side_effect = table_chain
    return db, updates


@pytest.mark.asyncio
async def test_create_analysis_returns_502_when_ai_generation_fails(monkeypatch, fake_user):
    """AI failures must not be returned as empty successful reports."""
    db, updates = _mock_db()
    monkeypatch.setattr(analyze, "get_supabase", lambda: db)
    monkeypatch.setattr(analyze, "can_use_analysis", lambda user: True)

    async def fail_analysis(_payload):
        raise RuntimeError("anthropic connection failed")

    monkeypatch.setattr(analyze, "analyze_failure", fail_analysis)

    payload = FailureAnalysisCreate(
        material_category="adhesive",
        failure_description="aluminum to wood bond fails during work load",
        substrate_a="Wood (Hardwood)",
        substrate_b="Aluminium (Generic)",
        material_subcategory="Cyanoacrylate (CA)",
    )

    with pytest.raises(HTTPException) as exc:
        await analyze.create_analysis(payload, fake_user)

    assert exc.value.status_code == status.HTTP_502_BAD_GATEWAY
    assert "AI analysis failed" in exc.value.detail
    assert any(update.get("status") == "failed" for update in updates)


@pytest.mark.asyncio
async def test_create_analysis_returns_502_when_ai_returns_no_root_causes(monkeypatch, fake_user):
    """Malformed Claude output must not be stored as a completed blank report."""
    db, updates = _mock_db()
    monkeypatch.setattr(analyze, "get_supabase", lambda: db)
    monkeypatch.setattr(analyze, "can_use_analysis", lambda user: True)

    async def malformed_analysis(_payload):
        return {"raw_text": "I need more information before I can diagnose this."}

    monkeypatch.setattr(analyze, "analyze_failure", malformed_analysis)

    payload = FailureAnalysisCreate(
        material_category="adhesive",
        failure_description="aluminum to wood bond fails during work load",
        substrate_a="Wood (Hardwood)",
        substrate_b="Aluminium (Generic)",
        material_subcategory="Cyanoacrylate (CA)",
    )

    with pytest.raises(HTTPException) as exc:
        await analyze.create_analysis(payload, fake_user)

    assert exc.value.status_code == status.HTTP_502_BAD_GATEWAY
    assert any(update.get("status") == "failed" for update in updates)
