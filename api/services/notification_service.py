"""Notification service — creates in-app notifications for investigation events."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from database import get_supabase

logger = logging.getLogger(__name__)


def create_notification(
    user_id: str,
    investigation_id: Optional[str],
    notification_type: str,
    title: str,
    message: Optional[str] = None,
    action_url: Optional[str] = None,
) -> Optional[str]:
    """
    Insert a notification into the notifications table.

    Returns the notification id or None on failure.
    """
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
