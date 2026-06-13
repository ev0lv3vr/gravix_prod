"""Unit tests for usage tracking edge cases."""

from unittest.mock import MagicMock, patch

from services.usage_service import (
    can_use_analysis,
    check_and_reset_usage,
    increment_analysis_usage,
    increment_spec_usage,
)


def test_holdout_user_usage_does_not_touch_supabase():
    user = {
        "id": "holdout-pro-user",
        "email": "test-pro@gravix.com",
        "plan": "pro",
        "analyses_this_month": 0,
        "specs_this_month": 0,
        "holdout_test": True,
        "role": "user",
    }

    with patch("services.usage_service.get_supabase") as get_supabase:
        assert check_and_reset_usage(user) is user
        assert can_use_analysis(user) is True

    get_supabase.assert_not_called()


def test_holdout_usage_increment_is_noop():
    with patch("services.usage_service.get_supabase") as get_supabase:
        increment_analysis_usage("holdout-pro-user")
        increment_spec_usage("holdout-pro-user")

    get_supabase.assert_not_called()


def test_usage_reset_failure_does_not_block_analysis():
    user = {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "ev@example.com",
        "plan": "pro",
        "analyses_this_month": 12,
        "specs_this_month": 4,
        "role": "user",
        "analyses_reset_date": None,
    }
    db = MagicMock()
    db.table.return_value.update.return_value.eq.return_value.execute.side_effect = Exception("db down")

    with patch("services.usage_service.get_supabase", return_value=db):
        assert can_use_analysis(user) is True


def test_usage_increment_failure_is_noop():
    db = MagicMock()
    db.table.return_value.select.return_value.eq.return_value.execute.side_effect = Exception("db down")

    with patch("services.usage_service.get_supabase", return_value=db):
        increment_analysis_usage("11111111-1111-1111-1111-111111111111")
        increment_spec_usage("11111111-1111-1111-1111-111111111111")
