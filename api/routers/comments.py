"""Investigation comments router — threaded comments with pin/resolve."""

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Query

from dependencies import get_current_user
from database import get_supabase
from schemas.comments import (
    CommentCreate,
    CommentUpdate,
    CommentResponse,
    CommentToggleResponse,
)
from services.audit_service import log_event

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/investigations", tags=["comments"])


def _check_team_access(db, investigation_id: str, user_id: str) -> dict:
    """Check if user has access to investigation. Returns investigation record or raises 404."""
    result = db.table("investigations").select("*").eq("id", investigation_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Investigation not found")

    investigation = result.data[0]

    # Check if user is part of the team
    is_team_member = (
        investigation["user_id"] == user_id
        or investigation["champion_user_id"] == user_id
        or investigation["team_lead_user_id"] == user_id
        or investigation["approver_user_id"] == user_id
    )

    if not is_team_member:
        member_result = (
            db.table("investigation_members")
            .select("id")
            .eq("investigation_id", investigation_id)
            .eq("user_id", user_id)
            .execute()
        )
        if member_result.data:
            is_team_member = True

    if not is_team_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this investigation team",
        )

    return investigation


def _check_lead_or_champion(investigation: dict, user_id: str) -> bool:
    """Check if user is Team Lead or Champion."""
    return (
        investigation["team_lead_user_id"] == user_id
        or investigation["champion_user_id"] == user_id
    )


@router.post("/{investigation_id}/comments", response_model=CommentResponse)
async def create_comment(
    investigation_id: str,
    data: CommentCreate,
    user: dict = Depends(get_current_user),
):
    """Create a comment on an investigation."""
    db = get_supabase()
    _check_team_access(db, investigation_id, user["id"])

    comment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Validate parent exists if provided
    if data.parent_comment_id:
        parent = (
            db.table("investigation_comments")
            .select("id")
            .eq("id", data.parent_comment_id)
            .eq("investigation_id", investigation_id)
            .execute()
        )
        if not parent.data:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    record = {
        "id": comment_id,
        "investigation_id": investigation_id,
        "parent_comment_id": data.parent_comment_id,
        "discipline": data.discipline,
        "user_id": user["id"],
        "comment_text": data.comment_text,
        "is_resolution": False,
        "is_pinned": False,
        "created_at": now,
        "updated_at": now,
    }

    try:
        db.table("investigation_comments").insert(record).execute()

        log_event(
            investigation_id=investigation_id,
            event_type="comment_created",
            event_detail=f"Comment added on {data.discipline}: {data.comment_text[:100]}",
            actor_user_id=user["id"],
            discipline=data.discipline,
            target_type="comment",
            target_id=comment_id,
        )

        # Create notification for team (inline import to avoid circular)
        try:
            from services.notification_service import notify_new_comment
            notify_new_comment(
                investigation_id=investigation_id,
                actor_user_id=user["id"],
                discipline=data.discipline,
                comment_text=data.comment_text,
            )
        except Exception:
            logger.debug("Notification for comment creation skipped", exc_info=True)

        return CommentResponse(**record)

    except Exception as e:
        logger.exception(f"Failed to create comment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.get("/{investigation_id}/comments", response_model=list[CommentResponse])
async def list_comments(
    investigation_id: str,
    user: dict = Depends(get_current_user),
    discipline: str = Query(None),
):
    """List comments for an investigation, optionally filtered by discipline."""
    db = get_supabase()
    _check_team_access(db, investigation_id, user["id"])

    query = (
        db.table("investigation_comments")
        .select("*")
        .eq("investigation_id", investigation_id)
    )

    if discipline:
        query = query.eq("discipline", discipline)

    result = query.order("created_at", desc=False).execute()

    return [CommentResponse(**item) for item in result.data]


@router.patch("/{investigation_id}/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    investigation_id: str,
    comment_id: str,
    data: CommentUpdate,
    user: dict = Depends(get_current_user),
):
    """Edit a comment (author only)."""
    db = get_supabase()
    _check_team_access(db, investigation_id, user["id"])

    # Get comment
    comment_result = (
        db.table("investigation_comments")
        .select("*")
        .eq("id", comment_id)
        .eq("investigation_id", investigation_id)
        .execute()
    )

    if not comment_result.data:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment = comment_result.data[0]

    if comment["user_id"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the comment author can edit this comment",
        )

    now = datetime.now(timezone.utc).isoformat()
    update_data = {"comment_text": data.comment_text, "updated_at": now}

    try:
        db.table("investigation_comments").update(update_data).eq("id", comment_id).execute()

        log_event(
            investigation_id=investigation_id,
            event_type="comment_edited",
            event_detail=f"Comment edited: {data.comment_text[:100]}",
            actor_user_id=user["id"],
            target_type="comment",
            target_id=comment_id,
        )

        result = db.table("investigation_comments").select("*").eq("id", comment_id).execute()
        return CommentResponse(**result.data[0])

    except Exception as e:
        logger.exception(f"Failed to update comment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.delete("/{investigation_id}/comments/{comment_id}")
async def delete_comment(
    investigation_id: str,
    comment_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete a comment (author or team lead/champion)."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])

    comment_result = (
        db.table("investigation_comments")
        .select("*")
        .eq("id", comment_id)
        .eq("investigation_id", investigation_id)
        .execute()
    )

    if not comment_result.data:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment = comment_result.data[0]

    # Author or lead/champion can delete
    is_authorized = (
        comment["user_id"] == user["id"]
        or _check_lead_or_champion(investigation, user["id"])
    )

    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the author or Team Lead/Champion can delete this comment",
        )

    try:
        db.table("investigation_comments").delete().eq("id", comment_id).execute()

        log_event(
            investigation_id=investigation_id,
            event_type="comment_deleted",
            event_detail=f"Comment deleted: {comment['comment_text'][:100]}",
            actor_user_id=user["id"],
            target_type="comment",
            target_id=comment_id,
        )

        return {"success": True, "message": "Comment deleted"}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to delete comment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.patch("/{investigation_id}/comments/{comment_id}/pin", response_model=CommentToggleResponse)
async def toggle_pin_comment(
    investigation_id: str,
    comment_id: str,
    user: dict = Depends(get_current_user),
):
    """Toggle pin on a comment (Team Lead/Champion only)."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])

    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can pin/unpin comments",
        )

    comment_result = (
        db.table("investigation_comments")
        .select("*")
        .eq("id", comment_id)
        .eq("investigation_id", investigation_id)
        .execute()
    )

    if not comment_result.data:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment = comment_result.data[0]
    new_value = not comment["is_pinned"]

    try:
        db.table("investigation_comments").update(
            {"is_pinned": new_value, "updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", comment_id).execute()

        action = "pinned" if new_value else "unpinned"
        log_event(
            investigation_id=investigation_id,
            event_type=f"comment_{action}",
            event_detail=f"Comment {action}: {comment['comment_text'][:100]}",
            actor_user_id=user["id"],
            target_type="comment",
            target_id=comment_id,
        )

        return CommentToggleResponse(
            id=comment_id,
            is_pinned=new_value,
            is_resolution=comment["is_resolution"],
        )

    except Exception as e:
        logger.exception(f"Failed to toggle pin: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.patch("/{investigation_id}/comments/{comment_id}/resolve", response_model=CommentToggleResponse)
async def toggle_resolve_comment(
    investigation_id: str,
    comment_id: str,
    user: dict = Depends(get_current_user),
):
    """Toggle resolution marker on a comment (Team Lead/Champion only)."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])

    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can mark/unmark resolution",
        )

    comment_result = (
        db.table("investigation_comments")
        .select("*")
        .eq("id", comment_id)
        .eq("investigation_id", investigation_id)
        .execute()
    )

    if not comment_result.data:
        raise HTTPException(status_code=404, detail="Comment not found")

    comment = comment_result.data[0]
    new_value = not comment["is_resolution"]

    try:
        db.table("investigation_comments").update(
            {"is_resolution": new_value, "updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", comment_id).execute()

        action = "marked as resolution" if new_value else "unmarked as resolution"
        log_event(
            investigation_id=investigation_id,
            event_type="comment_resolution_toggled",
            event_detail=f"Comment {action}: {comment['comment_text'][:100]}",
            actor_user_id=user["id"],
            target_type="comment",
            target_id=comment_id,
        )

        return CommentToggleResponse(
            id=comment_id,
            is_pinned=comment["is_pinned"],
            is_resolution=new_value,
        )

    except Exception as e:
        logger.exception(f"Failed to toggle resolution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )
