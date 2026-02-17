"""Notification service — creates in-app notifications for investigation events.

Sprint 10 gap: deliver notification emails via Resend based on
notification_preferences (email_enabled + per-event toggles) and quiet hours.
"""

import logging
import uuid
from datetime import datetime, timezone, time as dtime
from typing import Optional

import resend

from config import settings
from database import get_supabase

logger = logging.getLogger(__name__)


def _is_quiet_hours(start: Optional[str], end: Optional[str]) -> bool:
    if not start or not end:
        return False
    try:
        now = datetime.now(timezone.utc).time()
        s = dtime.fromisoformat(str(start))
        e = dtime.fromisoformat(str(end))
        if s <= e:
            return s <= now <= e
        # Wrap midnight
        return now >= s or now <= e
    except Exception:
        return False


def _event_pref_enabled(prefs: dict, notification_type: str) -> bool:
    """Map notification_type → notification_preferences columns."""
    mapping = {
        "status_changed": "investigation_status_changed",
        "new_comment": "comment_reply",
        "mention": "comment_mention",
        "action_assigned": "action_assigned",
        "team_member_added": "team_member_added",
        "investigation_closed": "investigation_closed",
    }
    col = mapping.get(notification_type)
    if not col:
        return True
    return bool(prefs.get(col, True))


def _send_email(to_email: str, title: str, message: Optional[str], action_url: Optional[str]) -> None:
    if not settings.resend_api_key:
        return

    resend.api_key = settings.resend_api_key
    frontend = settings.frontend_url.rstrip("/")
    full_url = f"{frontend}{action_url}" if action_url else frontend

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;">
      <h2 style="color:#1e40af;margin:0 0 10px;">You have a new notification from Gravix Quality</h2>
      <h3 style="margin:0 0 10px;color:#111;">{title}</h3>
      {f"<p style='color:#333;line-height:1.5;'>{message}</p>" if message else ""}
      <p style="margin-top:14px;">
        <a href="{full_url}" style="display:inline-block;padding:10px 16px;background:#1e40af;color:#fff;text-decoration:none;border-radius:4px;">Open in Gravix</a>
      </p>
      <p style="color:#999;font-size:12px;margin-top:22px;">If you prefer not to receive emails, disable email notifications in Settings.</p>
    </div>
    """

    try:
        resend.Emails.send({
            "from": settings.from_email,
            "to": to_email,
            "subject": f"Gravix: {title}",
            "html": html,
        })
    except Exception:
        logger.debug("Resend email send failed", exc_info=True)


def _maybe_email_user(user_id: str, notification_type: str, title: str, message: Optional[str], action_url: Optional[str]) -> None:
    db = get_supabase()

    # Lookup preferences
    prefs_res = db.table("notification_preferences").select("*").eq("user_id", user_id).execute()
    prefs = prefs_res.data[0] if prefs_res.data else {}

    if not prefs.get("email_enabled", False):
        return

    if _is_quiet_hours(prefs.get("quiet_hours_start"), prefs.get("quiet_hours_end")):
        return

    if not _event_pref_enabled(prefs, notification_type):
        return

    # Lookup email
    user_res = db.table("users").select("email").eq("id", user_id).execute()
    if not user_res.data or not user_res.data[0].get("email"):
        return

    _send_email(user_res.data[0]["email"], title, message, action_url)


def create_notification(
    user_id: str,
    investigation_id: Optional[str],
    notification_type: str,
    title: str,
    message: Optional[str] = None,
    action_url: Optional[str] = None,
) -> Optional[str]:
    """Insert a notification and optionally send an email."""
    db = get_supabase()
    notification_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    record = {
        "id": notification_id,
        "user_id": user_id,
        "investigation_id": investigation_id,
        "notification_type": notification_type,
        "title": title,
        "message": message,
        "action_url": action_url,
        "is_read": False,
        "created_at": now,
    }

    try:
        db.table("notifications").insert(record).execute()
        logger.info(f"Notification created: {notification_type} for user {user_id}")
        try:
            _maybe_email_user(user_id, notification_type, title, message, action_url)
        except Exception:
            logger.debug("Email delivery skipped", exc_info=True)
        return notification_id
    except Exception as e:
        logger.error(f"Failed to create notification: {e}", exc_info=True)
        return None


def _get_team_member_ids(investigation_id: str, exclude_user_id: Optional[str] = None) -> list[str]:
    """Get all user IDs involved in an investigation."""
    db = get_supabase()

    # Get investigation to find role-holders
    inv_result = (
        db.table("investigations")
        .select("user_id, champion_user_id, team_lead_user_id, approver_user_id")
        .eq("id", investigation_id)
        .execute()
    )

    user_ids: set[str] = set()
    if inv_result.data:
        inv = inv_result.data[0]
        for field in ["user_id", "champion_user_id", "team_lead_user_id", "approver_user_id"]:
            if inv.get(field):
                user_ids.add(inv[field])

    # Also get members table
    members_result = (
        db.table("investigation_members")
        .select("user_id")
        .eq("investigation_id", investigation_id)
        .execute()
    )
    for m in members_result.data:
        user_ids.add(m["user_id"])

    if exclude_user_id:
        user_ids.discard(exclude_user_id)

    return list(user_ids)


def notify_team_member_added(
    investigation_id: str,
    added_user_id: str,
    role: str,
    actor_user_id: str,
) -> None:
    """Notify a user they've been added to an investigation."""
    create_notification(
        user_id=added_user_id,
        investigation_id=investigation_id,
        notification_type="team_member_added",
        title="Added to Investigation",
        message=f"You've been added as {role} to an investigation.",
        action_url=f"/investigations/{investigation_id}",
    )


def notify_status_change(
    investigation_id: str,
    old_status: str,
    new_status: str,
    actor_user_id: str,
) -> None:
    """Notify all team members of a status change."""
    user_ids = _get_team_member_ids(investigation_id, exclude_user_id=actor_user_id)
    for uid in user_ids:
        create_notification(
            user_id=uid,
            investigation_id=investigation_id,
            notification_type="status_changed",
            title="Investigation Status Changed",
            message=f"Status changed from {old_status} to {new_status}.",
            action_url=f"/investigations/{investigation_id}",
        )


def notify_action_assigned(
    investigation_id: str,
    action_id: str,
    assignee_user_id: str,
    description: str,
) -> None:
    """Notify a user an action has been assigned to them."""
    create_notification(
        user_id=assignee_user_id,
        investigation_id=investigation_id,
        notification_type="action_assigned",
        title="Action Assigned",
        message=f"You've been assigned: {description[:200]}",
        action_url=f"/investigations/{investigation_id}",
    )


def notify_new_comment(
    investigation_id: str,
    actor_user_id: str,
    discipline: str,
    comment_text: str,
) -> None:
    """Notify team members of a new comment."""
    user_ids = _get_team_member_ids(investigation_id, exclude_user_id=actor_user_id)
    for uid in user_ids:
        create_notification(
            user_id=uid,
            investigation_id=investigation_id,
            notification_type="new_comment",
            title=f"New Comment on {discipline}",
            message=comment_text[:200],
            action_url=f"/investigations/{investigation_id}",
        )


def notify_investigation_closed(
    investigation_id: str,
    actor_user_id: str,
) -> None:
    """Notify team members that investigation has been closed."""
    user_ids = _get_team_member_ids(investigation_id, exclude_user_id=actor_user_id)
    for uid in user_ids:
        create_notification(
            user_id=uid,
            investigation_id=investigation_id,
            notification_type="investigation_closed",
            title="Investigation Closed",
            message="This investigation has been closed.",
            action_url=f"/investigations/{investigation_id}",
        )
