"""
User management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import Dict, Any
from database import get_db
from dependencies import get_current_user
from schemas.user import UserProfile, UserUpdate, UsageResponse
from services.usage_service import UsageService


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get current user profile.
    
    Returns authenticated user's profile data.
    """
    return UserProfile(**current_user)


@router.patch("/me", response_model=UserProfile)
async def update_user_profile(
    updates: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Update current user profile.
    
    Allows updating name, company, and role fields.
    """
    user_id = current_user['id']
    
    # Build update dict with only provided fields
    update_data = {}
    if updates.name is not None:
        update_data['name'] = updates.name
    if updates.company is not None:
        update_data['company'] = updates.company
    if updates.role is not None:
        update_data['role'] = updates.role
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update in database
    result = db.table("users").update(update_data).eq("id", user_id).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )
    
    return UserProfile(**result.data[0])


@router.get("/me/usage", response_model=UsageResponse)
async def get_user_usage(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """
    Get current user's usage statistics.
    
    Returns usage counts, limits, and remaining quota for analyses and specs.
    """
    user_id = current_user['id']
    
    usage_stats = await UsageService.get_usage_stats(db, user_id)
    
    return UsageResponse(**usage_stats)
