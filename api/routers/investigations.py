"""8D Investigation CRUD router."""

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Query

from dependencies import get_current_user
from database import get_supabase
from schemas.investigations import (
    InvestigationCreate,
    InvestigationUpdate,
    InvestigationResponse,
    InvestigationListItem,
    TeamMemberAdd,
    TeamMemberResponse,
    ActionCreate,
    ActionUpdate,
    ActionResponse,
    StatusTransition,
    StatusTransitionResponse,
)
from services.audit_service import log_event, log_field_changes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/investigations", tags=["investigations"])


def _generate_investigation_number(db) -> str:
    """Generate sequential investigation number: GQ-YYYY-NNNN."""
    now = datetime.now(timezone.utc)
    year = now.year
    prefix = f"GQ-{year}-"
    
    # Get the highest number for this year
    result = (
        db.table("investigations")
        .select("investigation_number")
        .like("investigation_number", f"{prefix}%")
        .order("investigation_number", desc=True)
        .limit(1)
        .execute()
    )
    
    if result.data:
        last_num = result.data[0]["investigation_number"]
        # Extract the NNNN part
        try:
            seq = int(last_num.split("-")[-1])
            next_seq = seq + 1
        except (ValueError, IndexError):
            next_seq = 1
    else:
        next_seq = 1
    
    return f"{prefix}{next_seq:04d}"


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
        # Check investigation_members table
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
            detail="You are not a member of this investigation team"
        )
    
    return investigation


def _check_lead_or_champion(investigation: dict, user_id: str) -> bool:
    """Check if user is Team Lead or Champion."""
    return (
        investigation["team_lead_user_id"] == user_id
        or investigation["champion_user_id"] == user_id
    )


def _validate_status_transition(
    db,
    investigation: dict,
    new_status: str,
) -> tuple[bool, list[str]]:
    """
    Validate status transition based on entry/exit criteria.
    
    Returns (allowed: bool, errors: list[str])
    """
    current_status = investigation["status"]
    errors = []
    
    # Can't transition to same status
    if current_status == new_status:
        errors.append("Investigation is already in that status")
        return False, errors
    
    # Define allowed transitions
    transitions = {
        "open": ["containment"],
        "containment": ["investigating"],
        "investigating": ["corrective_action"],
        "corrective_action": ["verification"],
        "verification": ["closed"],
        "closed": [],  # Closed is terminal (unless reopened by admin)
    }
    
    if new_status not in transitions.get(current_status, []):
        errors.append(f"Cannot transition from {current_status} to {new_status}")
        return False, errors
    
    # Entry criteria validation
    if new_status == "investigating":
        # D3: At least one containment action must be complete
        actions = (
            db.table("investigation_actions")
            .select("status")
            .eq("investigation_id", investigation["id"])
            .eq("discipline", "D3")
            .eq("status", "complete")
            .execute()
        )
        if not actions.data:
            errors.append("D3 entry criteria: At least one containment action must be completed")
    
    if new_status == "corrective_action":
        # D4: Root cause analysis must be complete
        if not investigation.get("root_causes"):
            errors.append("D4 entry criteria: Root cause analysis must be completed")
    
    if new_status == "verification":
        # D5: At least one corrective action must be defined
        actions = (
            db.table("investigation_actions")
            .select("id")
            .eq("investigation_id", investigation["id"])
            .eq("discipline", "D5")
            .execute()
        )
        if not actions.data:
            errors.append("D5 entry criteria: At least one corrective action must be defined")
    
    if new_status == "closed":
        # D8: All corrective actions must be verified, approver must be assigned
        if not investigation.get("approver_user_id"):
            errors.append("D8 entry criteria: Approver must be assigned")
        
        # Check all D5 actions are complete and verified
        d5_actions = (
            db.table("investigation_actions")
            .select("*")
            .eq("investigation_id", investigation["id"])
            .eq("discipline", "D5")
            .execute()
        )
        
        for action in d5_actions.data:
            if action["status"] != "complete":
                errors.append(f"D8 entry criteria: Corrective action '{action['description'][:50]}...' is not complete")
            if not action.get("verification_date"):
                errors.append(f"D8 entry criteria: Corrective action '{action['description'][:50]}...' is not verified")
    
    return len(errors) == 0, errors


@router.post("", response_model=InvestigationResponse)
async def create_investigation(
    data: InvestigationCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new 8D investigation."""
    db = get_supabase()
    investigation_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Generate investigation number
    investigation_number = _generate_investigation_number(db)
    
    # Build record
    payload = data.model_dump(exclude_none=True)
    
    # If created from an existing analysis, pre-populate D2 and D4
    analysis_data = {}
    if data.analysis_id:
        analysis_result = (
            db.table("failure_analyses")
            .select("*")
            .eq("id", data.analysis_id)
            .eq("user_id", user["id"])
            .execute()
        )
        if analysis_result.data:
            analysis = analysis_result.data[0]
            analysis_data = {
                "what_failed": analysis.get("failure_description"),
                "root_causes": analysis.get("root_causes"),
                "analysis_id": data.analysis_id,
            }
    
    record = {
        "id": investigation_id,
        "user_id": user["id"],
        "created_by": user["id"],
        "investigation_number": investigation_number,
        "status": "open",
        "team_lead_user_id": user["id"],  # Creator is default team lead
        "created_at": now,
        "updated_at": now,
        **payload,
        **analysis_data,
    }
    
    try:
        db.table("investigations").insert(record).execute()
        
        # Log creation
        log_event(
            investigation_id=investigation_id,
            event_type="investigation_created",
            event_detail=f"Investigation {investigation_number} created: {data.title}",
            actor_user_id=user["id"],
        )
        
        logger.info(f"Investigation {investigation_number} created by user {user['id']}")
        
        return InvestigationResponse(**record)
    
    except Exception as e:
        logger.exception(f"Failed to create investigation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.get("", response_model=list[InvestigationListItem])
async def list_investigations(
    user: dict = Depends(get_current_user),
    status_filter: str = Query(None, alias="status"),
    severity_filter: str = Query(None, alias="severity"),
):
    """List all investigations for the current user (as creator or team member)."""
    db = get_supabase()
    
    # Get investigations where user is creator or has a role
    query = db.table("investigations").select(
        "id, investigation_number, title, status, severity, customer_oem, team_lead_user_id, created_at, updated_at"
    )
    
    # Apply filters
    if status_filter:
        query = query.eq("status", status_filter)
    if severity_filter:
        query = query.eq("severity", severity_filter)
    
    # Get all investigations where user is involved
    # (RLS policy will filter based on team membership)
    result = query.order("created_at", desc=True).limit(100).execute()
    
    return [InvestigationListItem(**item) for item in result.data]


@router.get("/{investigation_id}", response_model=InvestigationResponse)
async def get_investigation(
    investigation_id: str,
    user: dict = Depends(get_current_user),
):
    """Get investigation detail (auth + team member check)."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    return InvestigationResponse(**investigation)


@router.patch("/{investigation_id}", response_model=InvestigationResponse)
async def update_investigation(
    investigation_id: str,
    data: InvestigationUpdate,
    user: dict = Depends(get_current_user),
):
    """Update investigation fields (Team Lead/Champion only)."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Check permission
    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can update investigation"
        )
    
    # Build update payload
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        return InvestigationResponse(**investigation)
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    try:
        db.table("investigations").update(update_data).eq("id", investigation_id).execute()
        
        # Log changes
        log_field_changes(
            investigation_id=investigation_id,
            actor_user_id=user["id"],
            old_data=investigation,
            new_data=update_data,
        )
        
        # Fetch updated record
        result = db.table("investigations").select("*").eq("id", investigation_id).execute()
        return InvestigationResponse(**result.data[0])
    
    except Exception as e:
        logger.exception(f"Failed to update investigation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.post("/{investigation_id}/team", response_model=TeamMemberResponse)
async def add_team_member(
    investigation_id: str,
    data: TeamMemberAdd,
    user: dict = Depends(get_current_user),
):
    """Add a team member to the investigation."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Check permission
    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can add team members"
        )
    
    member_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    record = {
        "id": member_id,
        "investigation_id": investigation_id,
        "user_id": data.user_id,
        "role": data.role,
        "discipline": data.discipline,
        "added_by": user["id"],
        "created_at": now,
    }
    
    try:
        db.table("investigation_members").insert(record).execute()
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="team_member_added",
            event_detail=f"User {data.user_id} added as {data.role}",
            actor_user_id=user["id"],
            target_type="member",
            target_id=member_id,
        )
        
        return TeamMemberResponse(**record)
    
    except Exception as e:
        logger.exception(f"Failed to add team member: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.delete("/{investigation_id}/team/{member_user_id}")
async def remove_team_member(
    investigation_id: str,
    member_user_id: str,
    user: dict = Depends(get_current_user),
):
    """Remove a team member from the investigation."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Check permission
    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can remove team members"
        )
    
    try:
        result = (
            db.table("investigation_members")
            .delete()
            .eq("investigation_id", investigation_id)
            .eq("user_id", member_user_id)
            .execute()
        )
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Team member not found")
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="team_member_removed",
            event_detail=f"User {member_user_id} removed from team",
            actor_user_id=user["id"],
        )
        
        return {"success": True, "message": "Team member removed"}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to remove team member: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.patch("/{investigation_id}/status", response_model=StatusTransitionResponse)
async def transition_status(
    investigation_id: str,
    data: StatusTransition,
    user: dict = Depends(get_current_user),
):
    """Transition investigation status (with validation of entry/exit criteria)."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Check permission
    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can change investigation status"
        )
    
    old_status = investigation["status"]
    
    # Validate transition
    allowed, errors = _validate_status_transition(db, investigation, data.new_status)
    
    if not allowed:
        return StatusTransitionResponse(
            investigation_id=investigation_id,
            old_status=old_status,
            new_status=data.new_status,
            transition_allowed=False,
            validation_errors=errors,
            message="Status transition not allowed due to validation errors",
        )
    
    # Update status
    update_data = {
        "status": data.new_status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    
    # If closing, set closed_at timestamp
    if data.new_status == "closed":
        update_data["closed_at"] = datetime.now(timezone.utc).isoformat()
    
    try:
        db.table("investigations").update(update_data).eq("id", investigation_id).execute()
        
        # Log status change
        log_event(
            investigation_id=investigation_id,
            event_type="status_changed",
            event_detail=f"Status changed from {old_status} to {data.new_status}" + (f": {data.notes}" if data.notes else ""),
            actor_user_id=user["id"],
            diff_data={"old_status": old_status, "new_status": data.new_status, "notes": data.notes},
        )
        
        return StatusTransitionResponse(
            investigation_id=investigation_id,
            old_status=old_status,
            new_status=data.new_status,
            transition_allowed=True,
            validation_errors=None,
            message=f"Status successfully changed from {old_status} to {data.new_status}",
        )
    
    except Exception as e:
        logger.exception(f"Failed to update status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.post("/{investigation_id}/actions", response_model=ActionResponse)
async def create_action(
    investigation_id: str,
    data: ActionCreate,
    user: dict = Depends(get_current_user),
):
    """Create an action item (D3/D5/D7)."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Check permission
    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can create actions"
        )
    
    action_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    record = {
        "id": action_id,
        "investigation_id": investigation_id,
        "status": "open",
        "created_at": now,
        "updated_at": now,
        **data.model_dump(exclude_none=True),
    }
    
    try:
        db.table("investigation_actions").insert(record).execute()
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="action_created",
            event_detail=f"{data.discipline} action created: {data.description[:100]}",
            actor_user_id=user["id"],
            discipline=data.discipline,
            target_type="action",
            target_id=action_id,
        )
        
        return ActionResponse(**record)
    
    except Exception as e:
        logger.exception(f"Failed to create action: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )


@router.get("/{investigation_id}/actions", response_model=list[ActionResponse])
async def list_actions(
    investigation_id: str,
    user: dict = Depends(get_current_user),
    discipline: str = Query(None),
):
    """List all actions for an investigation."""
    db = get_supabase()
    _check_team_access(db, investigation_id, user["id"])
    
    query = db.table("investigation_actions").select("*").eq("investigation_id", investigation_id)
    
    if discipline:
        query = query.eq("discipline", discipline)
    
    result = query.order("created_at", desc=False).execute()
    
    return [ActionResponse(**item) for item in result.data]


@router.patch("/{investigation_id}/actions/{action_id}", response_model=ActionResponse)
async def update_action(
    investigation_id: str,
    action_id: str,
    data: ActionUpdate,
    user: dict = Depends(get_current_user),
):
    """Update an action item."""
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Get the action
    action_result = (
        db.table("investigation_actions")
        .select("*")
        .eq("id", action_id)
        .eq("investigation_id", investigation_id)
        .execute()
    )
    
    if not action_result.data:
        raise HTTPException(status_code=404, detail="Action not found")
    
    action = action_result.data[0]
    
    # Check permission: Team Lead, Champion, or action owner
    is_authorized = (
        _check_lead_or_champion(investigation, user["id"])
        or action["owner_user_id"] == user["id"]
    )
    
    if not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead, Champion, or action owner can update actions"
        )
    
    # Build update payload
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        return ActionResponse(**action)
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    try:
        db.table("investigation_actions").update(update_data).eq("id", action_id).execute()
        
        # Log changes
        log_event(
            investigation_id=investigation_id,
            event_type="action_updated",
            event_detail=f"Action updated: {action['description'][:100]}",
            actor_user_id=user["id"],
            discipline=action["discipline"],
            target_type="action",
            target_id=action_id,
            diff_data={"old": action, "new": update_data},
        )
        
        # Fetch updated record
        result = db.table("investigation_actions").select("*").eq("id", action_id).execute()
        return ActionResponse(**result.data[0])
    
    except Exception as e:
        logger.exception(f"Failed to update action: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )
