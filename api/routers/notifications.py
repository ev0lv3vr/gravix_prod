"""Notification system router — in-app notifications and preferences."""

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Query

from dependencies import get_current_user
from database import get_supabase
from schemas.notifications import (
    NotificationResponse,
    UnreadCountResponse,
    NotificationPreferences,
    NotificationPreferencesResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(
    user: dict = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """List the current user's notifications (paginated, newest first)."""
    db = get_supabase()

    result = (
        db.table("notifications")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    return [NotificationResponse(**item) for item in result.data]


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    user: dict = Depends(get_current_user),
):
    """Get count of unread notifications for the current user."""
    db = get_supabase()

    result = (
        db.table("notifications")
        .select("id", count="exact")
        .eq("user_id", user["id"])
        .eq("is_read", False)
        .execute()
    )

    return UnreadCountResponse(unread_count=result.count or 0)


@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user: dict = Depends(get_current_user),
):
    """Mark a single notification as read."""
    db = get_supabase()

    result = (
        db.table("notifications")
        .select("id")
        .eq("id", notification_id)
        .eq("user_id", user["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Notification not found")

    try:
        db.table("notifications").update({"is_read": True}).eq("id", notification_id).execute()
        return {"success": True, "message": "Notification marked as read"}
    except Exception as e:
        logger.exception(f"Failed to mark notification read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.post("/read-all")
async def mark_all_read(
    user: dict = Depends(get_current_user),
):
    """Mark all of the current user's notifications as read."""
    db = get_supabase()

    try:
        db.table("notifications").update({"is_read": True}).eq("user_id", user["id"]).eq("is_read", False).execute()
        return {"success": True, "message": "All notifications marked as read"}
    except Exception as e:
        logger.exception(f"Failed to mark all read: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.get("/preferences", response_model=NotificationPreferencesResponse)
async def get_preferences(
    user: dict = Depends(get_current_user),
):
    """Get the current user's notification preferences."""
    db = get_supabase()

    result = (
        db.table("notification_preferences")
        .select("*")
        .eq("user_id", user["id"])
        .execute()
    )

    if result.data:
        return NotificationPreferencesResponse(**result.data[0])

    # Create default preferences if none exist
    pref_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    default_prefs = {
        "id": pref_id,
        "user_id": user["id"],
        "status_changes": True,
        "new_comments": True,
        "action_assigned": True,
        "action_due_soon": True,
        "team_member_added": True,
        "investigation_closed": True,
        "email_enabled": False,
        "updated_at": now,
    }

    try:
        db.table("notification_preferences").insert(default_prefs).execute()
        return NotificationPreferencesResponse(**default_prefs)
    except Exception as e:
        logger.exception(f"Failed to create default preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.put("/preferences", response_model=NotificationPreferencesResponse)
async def update_preferences(
    data: NotificationPreferences,
    user: dict = Depends(get_current_user),
):
    """Update the current user's notification preferences."""
    db = get_supabase()

    now = datetime.now(timezone.utc).isoformat()
    update_data = {**data.model_dump(), "updated_at": now}

    # Check if preferences exist
    existing = (
        db.table("notification_preferences")
        .select("id")
        .eq("user_id", user["id"])
        .execute()
    )

    try:
        if existing.data:
            db.table("notification_preferences").update(update_data).eq("user_id", user["id"]).execute()
        else:
            pref_id = str(uuid.uuid4())
            insert_data = {"id": pref_id, "user_id": user["id"], **update_data}
            db.table("notification_preferences").insert(insert_data).execute()

        # Fetch updated
        result = (
            db.table("notification_preferences")
            .select("*")
            .eq("user_id", user["id"])
            .execute()
        )
        return NotificationPreferencesResponse(**result.data[0])

    except Exception as e:
        logger.exception(f"Failed to update preferences: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )
