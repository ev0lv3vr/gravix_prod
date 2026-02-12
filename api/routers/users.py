"""User profile and usage router."""

from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user
from database import get_supabase
from schemas.user import UserProfile, UserUpdate, UsageResponse, DeleteAccountResponse
from services.usage_service import get_usage
from services.account_deletion_service import delete_account_and_data

import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    return UserProfile(**user)


@router.patch("/me", response_model=UserProfile)
async def update_user_profile(
    data: UserUpdate,
    user: dict = Depends(get_current_user),
):
    """Update the current user's profile."""
    db = get_supabase()
    update_data = data.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        db.table("users")
        .update(update_data)
        .eq("id", user["id"])
        .execute()
    )

    if result.data:
        return UserProfile(**result.data[0])
    return UserProfile(**{**user, **update_data})


@router.get("/me/usage", response_model=UsageResponse)
async def get_current_user_usage(user: dict = Depends(get_current_user)):
    """Get the current user's usage stats."""
    usage = get_usage(user)
    return UsageResponse(**usage)


@router.delete("/me", response_model=DeleteAccountResponse)
async def delete_my_account(user: dict = Depends(get_current_user)):
    """Delete the current user's account and all associated data."""

    db = get_supabase()
    user_id = user["id"]

    summary = delete_account_and_data(user)

    # Audit log (best-effort)
    try:
        db.table("admin_audit_log").insert(
            {
                "actor_user_id": user_id,
                "action": "delete_account",
                "target_table": "users",
                "target_id": user_id,
                "details": {
                    **summary,
                    "email": user.get("email"),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            }
        ).execute()
    except Exception as e:
        logger.warning(f"Failed to write audit log for delete_account {user_id}: {e}")

    return DeleteAccountResponse(status="deleted")
