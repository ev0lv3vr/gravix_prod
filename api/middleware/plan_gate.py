"""Plan-gated dependency for FastAPI.

Usage on any router:
    from middleware.plan_gate import plan_gate

    @router.post("/v1/investigations")
    async def create_investigation(
        user: dict = Depends(get_current_user),
        _gate: None = Depends(plan_gate("investigations.create")),
    ):
        ...
"""

import logging
from fastapi import Depends, HTTPException, status
from dependencies import get_current_user
from config.plan_features import PLAN_FEATURES, MINIMUM_PLAN, UPGRADE_MESSAGES

logger = logging.getLogger(__name__)


def plan_gate(gate_key: str):
    """FastAPI dependency factory for plan-gated endpoints.

    Returns a dependency that checks if the current user's plan
    allows access to the specified feature.
    """
    async def _check_plan(user: dict = Depends(get_current_user)) -> None:
        # Admins bypass all gates
        if user.get("role") == "admin":
            return None

        plan = user.get("plan", "free")
        features = PLAN_FEATURES.get(plan, PLAN_FEATURES["free"])
        access = features.get(gate_key)

        if access is False or access is None:
            required = MINIMUM_PLAN.get(gate_key, "pro")
            message = UPGRADE_MESSAGES.get(
                gate_key,
                f"This feature requires a {required} plan."
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "plan_gate",
                    "message": message,
                    "current_plan": plan,
                    "required_plan": required,
                    "upgrade_url": "/pricing",
                },
            )
        return None

    return _check_plan
