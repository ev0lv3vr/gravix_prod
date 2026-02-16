"""Audit logging service for investigation activity.

All investigation mutations must call log_event to maintain compliance audit trail.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from database import get_supabase

logger = logging.getLogger(__name__)


def log_event(
    investigation_id: str,
    event_type: str,
    event_detail: str,
    actor_user_id: str,
    discipline: Optional[str] = None,
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    diff_data: Optional[dict] = None,
) -> str:
    """
    Log an audit event to investigation_audit_log table (append-only).
    
    Args:
        investigation_id: The investigation this event belongs to
        event_type: Type of event (e.g., 'investigation_created', 'status_changed', 'action_added')
        event_detail: Human-readable description of what happened
        actor_user_id: User who performed the action
        discipline: Optional discipline (D1-D8) if event is discipline-specific
        target_type: Optional type of target entity (e.g., 'action', 'comment', 'attachment')
        target_id: Optional ID of target entity
        diff_data: Optional structured diff data for field changes
        
    Returns:
        The UUID of the created audit log entry
    """
    db = get_supabase()
    log_id = str(uuid.uuid4())
    
    record = {
        "id": log_id,
        "investigation_id": investigation_id,
        "event_type": event_type,
        "event_detail": event_detail,
        "actor_user_id": actor_user_id,
        "discipline": discipline,
        "target_type": target_type,
        "target_id": target_id,
        "diff_data": diff_data,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    
    try:
        db.table("investigation_audit_log").insert(record).execute()
        logger.info(
            f"Audit log created: {event_type} for investigation {investigation_id} by user {actor_user_id}"
        )
        return log_id
    except Exception as e:
        # Audit logging failure should not block the operation, but must be logged
        logger.error(
            f"Failed to create audit log for investigation {investigation_id}: {e}",
            exc_info=True,
            extra={
                "investigation_id": investigation_id,
                "event_type": event_type,
                "actor_user_id": actor_user_id,
            }
        )
        # Return a placeholder UUID so calling code doesn't break
        return log_id


def log_field_changes(
    investigation_id: str,
    actor_user_id: str,
    old_data: dict,
    new_data: dict,
    event_type: str = "investigation_updated",
) -> None:
    """
    Log field-level changes with diff tracking.
    
    Compares old_data and new_data dicts and logs each changed field separately.
    """
    changes = {}
    for key, new_value in new_data.items():
        old_value = old_data.get(key)
        if old_value != new_value:
            changes[key] = {"old": old_value, "new": new_value}
    
    if changes:
        log_event(
            investigation_id=investigation_id,
            event_type=event_type,
            event_detail=f"Updated {len(changes)} field(s): {', '.join(changes.keys())}",
            actor_user_id=actor_user_id,
            diff_data=changes,
        )


def log_ai_edit(
    investigation_id: str,
    actor_user_id: str,
    field_name: str,
    ai_value: str,
    human_value: str,
) -> None:
    """
    Log when a user edits AI-generated content.
    
    Critical for regulatory compliance — proves human review of AI output.
    """
    log_event(
        investigation_id=investigation_id,
        event_type="ai_output_edited",
        event_detail=f"User modified AI-generated {field_name}",
        actor_user_id=actor_user_id,
        diff_data={
            "field": field_name,
            "ai_original": ai_value,
            "human_edited": human_value,
        }
    )
