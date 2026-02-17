"""Monthly usage tracking and plan limit enforcement."""

import logging
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta

from config import settings
from database import get_supabase

logger = logging.getLogger(__name__)


def _get_reset_date() -> str:
    """Get the first of next month as reset date."""
    now = datetime.now(timezone.utc)
    next_month = now + relativedelta(months=1)
    return next_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()


def check_and_reset_usage(user: dict) -> dict:
    """Check if usage counters need to be reset (monthly). Returns updated user."""
    db = get_supabase()
    now = datetime.now(timezone.utc)

    analyses_reset = user.get("analyses_reset_date")
    needs_reset = False

    if analyses_reset:
        try:
            reset_dt = datetime.fromisoformat(analyses_reset.replace("Z", "+00:00"))
            if now >= reset_dt:
                needs_reset = True
        except (ValueError, TypeError):
            needs_reset = True
    else:
        needs_reset = True

    if needs_reset:
        reset_date = _get_reset_date()
        update_data = {
            "analyses_this_month": 0,
            "specs_this_month": 0,
            "analyses_reset_date": reset_date,
            "specs_reset_date": reset_date,
        }
        db.table("users").update(update_data).eq("id", user["id"]).execute()
        user.update(update_data)

    return user


def _is_admin(user: dict) -> bool:
    """Check if the user has admin role (unlimited access)."""
    return user.get("role") == "admin"


def can_use_analysis(user: dict) -> bool:
    """Check if the user can run another analysis."""
    if _is_admin(user):
        return True
    user = check_and_reset_usage(user)
    plan = user.get("plan", "free")
    limit = settings.plan_limits.get(plan, settings.plan_limits["free"])["analyses"]
    used = user.get("analyses_this_month", 0)
    return used < limit


def can_use_spec(user: dict) -> bool:
    """Check if the user can run another spec."""
    if _is_admin(user):
        return True
    user = check_and_reset_usage(user)
    plan = user.get("plan", "free")
    limit = settings.plan_limits.get(plan, settings.plan_limits["free"])["specs"]
    used = user.get("specs_this_month", 0)
    return used < limit


def increment_analysis_usage(user_id: str):
    """Increment the analysis counter for a user."""
    db = get_supabase()
    user = db.table("users").select("analyses_this_month").eq("id", user_id).execute()
    if user.data:
        current = user.data[0].get("analyses_this_month", 0)
        db.table("users").update(
            {"analyses_this_month": current + 1}
        ).eq("id", user_id).execute()


def increment_spec_usage(user_id: str):
    """Increment the spec counter for a user."""
    db = get_supabase()
    user = db.table("users").select("specs_this_month").eq("id", user_id).execute()
    if user.data:
        current = user.data[0].get("specs_this_month", 0)
        db.table("users").update(
            {"specs_this_month": current + 1}
        ).eq("id", user_id).execute()


def get_usage(user: dict) -> dict:
    """Get current usage stats for a user."""
    user = check_and_reset_usage(user)
    plan = user.get("plan", "free")
    limits = settings.plan_limits.get(plan, settings.plan_limits["free"])

    # Admins get unlimited access but return their actual plan
    if _is_admin(user):
        return {
            "analyses_used": user.get("analyses_this_month", 0),
            "analyses_limit": 999999,
            "specs_used": user.get("specs_this_month", 0),
            "specs_limit": 999999,
            "plan": user.get("plan", "free"),
            "reset_date": user.get("analyses_reset_date"),
        }

    return {
        "analyses_used": user.get("analyses_this_month", 0),
        "analyses_limit": limits["analyses"],
        "specs_used": user.get("specs_this_month", 0),
        "specs_limit": limits["specs"],
        "plan": plan,
        "reset_date": user.get("analyses_reset_date"),
    }
