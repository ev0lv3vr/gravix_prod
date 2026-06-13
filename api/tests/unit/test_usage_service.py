"""Unit tests for usage tracking edge cases."""

from unittest.mock import patch

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
