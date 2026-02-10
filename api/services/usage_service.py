"""
Usage tracking service for managing monthly limits per plan tier.
"""
from supabase import Client
from fastapi import HTTPException, status
from config import settings
from datetime import date
from typing import Dict, Any


class UsageService:
    """Service for checking and incrementing user usage."""
    
    @staticmethod
    async def check_and_increment_usage(
        db: Client,
        user_id: str,
        usage_type: str  # 'analyses' or 'specs'
    ) -> Dict[str, Any]:
        """
        Check if user has remaining usage and increment counter.
        
        Args:
            db: Supabase client
            user_id: User ID
            usage_type: Type of usage ('analyses' or 'specs')
            
        Returns:
            Dict with usage details
            
        Raises:
            HTTPException: If usage limit exceeded
        """
        # Fetch current user data
        result = db.table("users").select("*").eq("id", user_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = result.data[0]
        plan = user.get('plan', 'free')
        
        # Get usage limits for this plan
        plan_limits = settings.plan_limits.get(plan, settings.plan_limits['free'])
        
        if usage_type == 'analyses':
            current_count = user.get('analyses_this_month', 0)
            limit = plan_limits['analyses']
            reset_date_field = 'analyses_reset_date'
            count_field = 'analyses_this_month'
        else:  # specs
            current_count = user.get('specs_this_month', 0)
            limit = plan_limits['specs']
            reset_date_field = 'specs_reset_date'
            count_field = 'specs_this_month'
        
        # Check if we need to reset monthly counter
        reset_date = user.get(reset_date_field)
        today = date.today()
        
        # Reset if it's a new month
        if reset_date:
            reset_date_obj = date.fromisoformat(str(reset_date))
            if reset_date_obj.month != today.month or reset_date_obj.year != today.year:
                # Reset counter for new month
                current_count = 0
                db.table("users").update({
                    count_field: 0,
                    reset_date_field: today.isoformat()
                }).eq("id", user_id).execute()
        
        # Check if user has reached limit
        if current_count >= limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "USAGE_LIMIT_EXCEEDED",
                    "message": f"Monthly {usage_type} limit reached ({current_count}/{limit}). Please upgrade your plan.",
                    "current_usage": current_count,
                    "limit": limit,
                    "plan": plan
                }
            )
        
        # Increment usage
        new_count = current_count + 1
        db.table("users").update({
            count_field: new_count,
            reset_date_field: today.isoformat()
        }).eq("id", user_id).execute()
        
        return {
            "previous_count": current_count,
            "new_count": new_count,
            "limit": limit,
            "remaining": limit - new_count,
            "plan": plan
        }
    
    @staticmethod
    async def get_usage_stats(db: Client, user_id: str) -> Dict[str, Any]:
        """
        Get current usage statistics for a user.
        
        Args:
            db: Supabase client
            user_id: User ID
            
        Returns:
            Dict with usage statistics
        """
        result = db.table("users").select("*").eq("id", user_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = result.data[0]
        plan = user.get('plan', 'free')
        plan_limits = settings.plan_limits.get(plan, settings.plan_limits['free'])
        
        analyses_used = user.get('analyses_this_month', 0)
        specs_used = user.get('specs_this_month', 0)
        
        analyses_limit = plan_limits['analyses']
        specs_limit = plan_limits['specs']
        
        return {
            "plan": plan,
            "analyses_used": analyses_used,
            "analyses_limit": analyses_limit,
            "analyses_remaining": max(0, analyses_limit - analyses_used),
            "specs_used": specs_used,
            "specs_limit": specs_limit,
            "specs_remaining": max(0, specs_limit - specs_used),
            "reset_date": user.get('analyses_reset_date', date.today())
        }
