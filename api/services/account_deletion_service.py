"""Account deletion service.

Implements best-effort cleanup for a user's data across public tables,
Stripe subscription cancellation, and Supabase Auth user deletion.

This is used by DELETE /users/me.
"""

from __future__ import annotations

import logging
from typing import Any

from database import get_supabase
from services.stripe_service import cancel_active_subscriptions

logger = logging.getLogger(__name__)


USER_OWNED_TABLES: list[dict[str, Any]] = [
    # Delete child/side tables first
    {"table": "analysis_feedback", "column": "user_id"},
    {"table": "api_request_logs", "column": "user_id"},
    {"table": "ai_engine_logs", "column": "user_id"},
    # Primary user content
    {"table": "spec_requests", "column": "user_id"},
    {"table": "failure_analyses", "column": "user_id"},
]


def delete_account_and_data(user: dict) -> dict:
    """Delete the current user's account and all associated data.

    Returns a summary payload suitable for audit logging.

    Notes:
    - Uses Supabase service role key (bypasses RLS) via get_supabase().
    - Best-effort: continues deleting other resources if one step fails.
    """

    db = get_supabase()
    user_id = user["id"]

    summary: dict[str, Any] = {
        "user_id": user_id,
        "stripe": {"attempted": False, "cancelled_subscription_ids": []},
        "deleted": {},
        "errors": [],
    }

    # 1) Cancel Stripe subscription(s) if applicable
    try:
        summary["stripe"]["attempted"] = True
        cancelled = cancel_active_subscriptions(user)
        summary["stripe"]["cancelled_subscription_ids"] = cancelled
    except Exception as e:
        logger.warning(f"Stripe cancellation failed for user {user_id}: {e}")
        summary["errors"].append({"step": "stripe_cancel", "error": str(e)})

    # 2) Delete public table data
    for spec in USER_OWNED_TABLES:
        table = spec["table"]
        column = spec["column"]
        try:
            # Count then delete (count is useful for audit; delete is idempotent)
            count_res = db.table(table).select("id", count="exact").eq(column, user_id).execute()
            count = getattr(count_res, "count", None) or 0

            db.table(table).delete().eq(column, user_id).execute()
            summary["deleted"][table] = {"count": count}
        except Exception as e:
            logger.warning(f"Failed deleting from {table} for user {user_id}: {e}")
            summary["errors"].append({"step": f"delete_table:{table}", "error": str(e)})

    # 3) Delete user row from public.users
    try:
        db.table("users").delete().eq("id", user_id).execute()
        summary["deleted"]["users"] = {"count": 1}
    except Exception as e:
        logger.warning(f"Failed deleting users row for user {user_id}: {e}")
        summary["errors"].append({"step": "delete_users_row", "error": str(e)})

    # 4) Delete Supabase Auth user
    try:
        # supabase-py v2: auth.admin.delete_user(uid)
        db.auth.admin.delete_user(user_id)
        summary["deleted"]["auth_user"] = True
    except Exception as e:
        logger.warning(f"Failed deleting Supabase auth user {user_id}: {e}")
        summary["errors"].append({"step": "delete_auth_user", "error": str(e)})
        summary["deleted"]["auth_user"] = False

    return summary
