"""Unit tests for holdout test authentication."""

import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

from dependencies import get_current_user
from routers.auth_test import IssueTokenRequest, issue_holdout_test_session


class _Request:
    headers = {"origin": "https://gravix-prod-test.vercel.app"}


def _mock_supabase():
    db = MagicMock()
    chain = MagicMock()
    chain.upsert.return_value = chain
    chain.execute.return_value = MagicMock(data=[])
    db.table.return_value = chain
    return db


@pytest.mark.asyncio
async def test_holdout_test_session_uses_uuid_sub():
    session = await issue_holdout_test_session(
        IssueTokenRequest(email="test-pro@gravix.com"),
        _Request(),
    )

    user_id = session["user"]["id"]
    assert str(uuid.UUID(user_id)) == user_id


@pytest.mark.asyncio
async def test_holdout_token_returns_uuid_user_and_upserts_fk_row():
    session = await issue_holdout_test_session(
        IssueTokenRequest(email="test-pro@gravix.com"),
        _Request(),
    )
    token = session["access_token"]
    db = _mock_supabase()

    with patch("dependencies.get_supabase", return_value=db):
        user = await get_current_user(
            request=MagicMock(),
            credentials=SimpleNamespace(credentials=token),
        )

    assert str(uuid.UUID(user["id"])) == user["id"]
    assert user["holdout_test"] is True
    db.table.assert_called_once_with("users")
    db.table.return_value.upsert.assert_called_once()
