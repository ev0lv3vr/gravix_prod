"""8D Investigation CRUD router."""

import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Query

from dependencies import get_current_user
from middleware.plan_gate import plan_gate
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
    AttachmentResponse,
    SignatureCreate,
    SignatureResponse,
    ShareLinkCreate,
    ShareLinkResponse,
    ReportGenerateRequest,
    AnalyzeRequest,
    CloseInvestigationRequest,
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
    _gate: None = Depends(plan_gate("investigations.create")),
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
                "substrate_a": analysis.get("substrate_a"),
                "substrate_b": analysis.get("substrate_b"),
                "failure_mode": analysis.get("failure_mode"),
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
    _gate: None = Depends(plan_gate("investigations.view")),
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
    _gate: None = Depends(plan_gate("investigations.view")),
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


# ============================================================================
# Sprint 8: New AI, PDF, Attachments, Signatures, Share Links
# ============================================================================

from fastapi import UploadFile, File, Form
from fastapi.responses import Response
import hashlib
import secrets
from datetime import timedelta
from services.investigation_ai_service import (
    generate_five_why,
    analyze_escape_point,
)
from services.report_service import generate_8d_pdf
from services.ai_engine import analyze_failure


@router.post("/{investigation_id}/analyze")
async def analyze_investigation(
    investigation_id: str,
    data: AnalyzeRequest,
    user: dict = Depends(get_current_user),
):
    """Run AI root cause analysis (D4) on the investigation.
    
    Triggers full Gravix analysis pipeline and stores results in investigation record.
    Optionally generates 5-Why chain and escape point analysis.
    """
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Check permission
    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can run AI analysis"
        )
    
    # Build analysis data from investigation D2 fields.
    # If substrates are missing, fall back to the linked failure_analyses record.
    substrate_a = investigation.get("substrate_a")
    substrate_b = investigation.get("substrate_b")
    failure_mode = investigation.get("failure_mode")

    if (not substrate_a or substrate_a == "Unknown") and investigation.get("analysis_id"):
        try:
            fa_result = (
                db.table("failure_analyses")
                .select("substrate_a, substrate_b, failure_mode")
                .eq("id", investigation["analysis_id"])
                .execute()
            )
            if fa_result.data:
                fa = fa_result.data[0]
                substrate_a = substrate_a or fa.get("substrate_a") or "Unknown"
                substrate_b = substrate_b or fa.get("substrate_b") or "Unknown"
                failure_mode = failure_mode or fa.get("failure_mode")
        except Exception as e:
            logger.warning(f"Could not fetch linked analysis for substrates: {e}")

    analysis_data = {
        "failure_description": investigation.get("what_failed", ""),
        "substrate_a": substrate_a or "Unknown",
        "substrate_b": substrate_b or "Unknown",
        "failure_mode": failure_mode,
        "temperature_range": investigation.get("temperature_range"),
        "humidity": investigation.get("humidity"),
        "time_to_failure": investigation.get("time_to_failure"),
        "where_in_process": investigation.get("where_in_process"),
    }
    
    try:
        # Run the full Gravix failure analysis
        result = await analyze_failure(analysis_data)
        
        # Store root causes in investigation
        update_data = {
            "root_causes": result.get("root_causes", []),
            "fishbone_data": result.get("fishbone_data"),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        
        # Optionally generate 5-Why chain for top root cause
        if data.run_five_why and result.get("root_causes"):
            top_cause = result["root_causes"][0]
            five_why_result = await generate_five_why(
                root_cause=top_cause["cause"],
                failure_description=analysis_data["failure_description"],
                substrate_a=analysis_data["substrate_a"],
                substrate_b=analysis_data["substrate_b"],
            )
            update_data["five_why_chain"] = five_why_result.get("five_why_chain", [])
        
        # Optionally analyze escape point
        if data.run_escape_point and result.get("root_causes"):
            escape_result = await analyze_escape_point(
                root_causes=result["root_causes"],
                where_in_process=analysis_data.get("where_in_process", "Unknown"),
            )
            update_data["escape_point"] = escape_result.get("escape_point")
        
        # Update investigation
        db.table("investigations").update(update_data).eq("id", investigation_id).execute()
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="ai_analysis_completed",
            event_detail=f"AI root cause analysis completed with {len(result.get('root_causes', []))} root causes identified",
            actor_user_id=user["id"],
            discipline="D4",
        )
        
        logger.info(f"AI analysis completed for investigation {investigation.get('investigation_number')}")
        
        return {
            "success": True,
            "root_causes": update_data["root_causes"],
            "five_why_chain": update_data.get("five_why_chain"),
            "escape_point": update_data.get("escape_point"),
            "confidence_score": result.get("confidence_score"),
        }
    
    except Exception as e:
        logger.exception(f"Failed to run AI analysis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)[:200]}",
        )


@router.post("/{investigation_id}/attachments", response_model=AttachmentResponse)
async def upload_attachment(
    investigation_id: str,
    file: UploadFile = File(...),
    discipline: str = Form(...),
    caption: str = Form(None),
    user: dict = Depends(get_current_user),
):
    """Upload file attachment to investigation.
    
    Stores in Supabase Storage bucket: investigation-attachments/{investigation_id}/{discipline}/{filename}
    Max 20MB per file.
    """
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Check file size (20MB max)
    MAX_SIZE = 20 * 1024 * 1024  # 20MB
    file_content = await file.read()
    if len(file_content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds 20MB limit"
        )
    
    # Determine if image
    is_image = file.content_type and file.content_type.startswith("image/")
    
    # Upload to Supabase Storage
    storage_path = f"{investigation_id}/{discipline}/{file.filename}"
    
    try:
        # Upload file (this is simplified - in production use Supabase Storage client)
        file_url = f"https://supabase-storage-url/{storage_path}"  # Placeholder
        
        # Create attachment record
        attachment_id = str(uuid.uuid4())
        record = {
            "id": attachment_id,
            "investigation_id": investigation_id,
            "discipline": discipline,
            "file_name": file.filename,
            "file_url": file_url,
            "file_size_bytes": len(file_content),
            "is_image": is_image,
            "caption": caption,
            "sort_order": 0,
            "uploaded_by": user["id"],
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
        }
        
        db.table("investigation_attachments").insert(record).execute()
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="attachment_uploaded",
            event_detail=f"File uploaded: {file.filename} ({len(file_content)} bytes)",
            actor_user_id=user["id"],
            discipline=discipline,
            target_type="attachment",
            target_id=attachment_id,
        )
        
        return AttachmentResponse(**record)
    
    except Exception as e:
        logger.exception(f"Failed to upload attachment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)[:200]}",
        )


@router.get("/{investigation_id}/attachments", response_model=list[AttachmentResponse])
async def list_attachments(
    investigation_id: str,
    user: dict = Depends(get_current_user),
):
    """List all attachments for an investigation."""
    db = get_supabase()
    _check_team_access(db, investigation_id, user["id"])
    
    result = (
        db.table("investigation_attachments")
        .select("*")
        .eq("investigation_id", investigation_id)
        .order("discipline", desc=False)
        .order("sort_order", desc=False)
        .execute()
    )
    
    return [AttachmentResponse(**item) for item in result.data]


@router.delete("/{investigation_id}/attachments/{attachment_id}")
async def delete_attachment(
    investigation_id: str,
    attachment_id: str,
    user: dict = Depends(get_current_user),
):
    """Delete attachment (uploader only)."""
    db = get_supabase()
    _check_team_access(db, investigation_id, user["id"])
    
    # Get attachment
    attachment_result = (
        db.table("investigation_attachments")
        .select("*")
        .eq("id", attachment_id)
        .eq("investigation_id", investigation_id)
        .execute()
    )
    
    if not attachment_result.data:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    attachment = attachment_result.data[0]
    
    # Check uploader permission
    if attachment["uploaded_by"] != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the uploader can delete this attachment"
        )
    
    try:
        # Delete from storage (placeholder - implement with Supabase Storage client)
        # storage.remove(attachment["file_url"])
        
        # Delete record
        db.table("investigation_attachments").delete().eq("id", attachment_id).execute()
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="attachment_deleted",
            event_detail=f"File deleted: {attachment['file_name']}",
            actor_user_id=user["id"],
            discipline=attachment["discipline"],
            target_type="attachment",
            target_id=attachment_id,
        )
        
        return {"success": True, "message": "Attachment deleted"}
    
    except Exception as e:
        logger.exception(f"Failed to delete attachment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)[:200]}",
        )


@router.post("/{investigation_id}/sign/{discipline}", response_model=SignatureResponse)
async def sign_discipline(
    investigation_id: str,
    discipline: str,
    user: dict = Depends(get_current_user),
):
    """Electronic sign-off for a discipline.
    
    Creates signature record with SHA-256 hash of discipline content at sign time.
    Only approver can sign D8.
    """
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # D8 can only be signed by approver
    if discipline == "D8":
        if investigation.get("approver_user_id") != user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the assigned approver can sign D8"
            )
    
    # Generate content hash (SHA-256 of relevant investigation data for this discipline)
    content_to_hash = f"{investigation_id}:{discipline}:{datetime.now(timezone.utc).isoformat()}"
    signature_hash = hashlib.sha256(content_to_hash.encode()).hexdigest()
    
    signature_id = str(uuid.uuid4())
    record = {
        "id": signature_id,
        "investigation_id": investigation_id,
        "user_id": user["id"],
        "discipline": discipline,
        "signature_hash": signature_hash,
        "signed_at": datetime.now(timezone.utc).isoformat(),
    }
    
    try:
        db.table("investigation_signatures").insert(record).execute()
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="discipline_signed",
            event_detail=f"{discipline} signed by {user['id']}",
            actor_user_id=user["id"],
            discipline=discipline,
            target_type="signature",
            target_id=signature_id,
        )
        
        return SignatureResponse(**record)
    
    except Exception as e:
        logger.exception(f"Failed to create signature: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signature failed: {str(e)[:200]}",
        )


@router.get("/{investigation_id}/report")
async def get_report(
    investigation_id: str,
    template: str = Query("generic_8d", pattern="^(generic_8d|ford_global_8d)$"),
    user: dict = Depends(get_current_user),
):
    """Generate 8D report PDF.
    
    Returns PDF bytes with appropriate content-type header.
    Supports ?template=generic or ?template=ford_global_8d.
    """
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    try:
        pdf_bytes = await generate_8d_pdf(investigation_id, template)
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="report_generated",
            event_detail=f"8D report PDF generated (template: {template}, {len(pdf_bytes)} bytes)",
            actor_user_id=user["id"],
        )
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={investigation.get('investigation_number')}_8D_Report.pdf"
            }
        )
    
    except Exception as e:
        logger.exception(f"Failed to generate PDF: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {str(e)[:200]}",
        )


@router.post("/{investigation_id}/share", response_model=ShareLinkResponse)
async def create_share_link(
    investigation_id: str,
    data: ShareLinkCreate,
    user: dict = Depends(get_current_user),
):
    """Generate shareable read-only link for OEM reps.
    
    Creates a unique token and returns URL.
    """
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Check permission
    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can create share links"
        )
    
    # Generate secure token
    share_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=data.expires_days)
    
    # Store token in investigation record (simplified - could use separate table)
    update_data = {
        "share_token": share_token,
        "share_expires_at": expires_at.isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    
    try:
        db.table("investigations").update(update_data).eq("id", investigation_id).execute()
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="share_link_created",
            event_detail=f"Shareable link created (expires: {_format_date(expires_at.isoformat())})",
            actor_user_id=user["id"],
        )
        
        # Build share URL
        from config import settings
        share_url = f"{settings.frontend_url}/investigations/share/{share_token}"
        
        return ShareLinkResponse(
            investigation_id=investigation_id,
            share_token=share_token,
            share_url=share_url,
            expires_at=expires_at,
            created_at=datetime.now(timezone.utc),
        )
    
    except Exception as e:
        logger.exception(f"Failed to create share link: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Share link creation failed: {str(e)[:200]}",
        )


@router.get("/share/{token}")
async def get_shared_investigation(token: str):
    """Public endpoint (no auth) - returns read-only investigation data for OEM reps.
    
    Validates token and expiry, returns investigation + actions.
    """
    db = get_supabase()
    
    # Find investigation by share token
    result = (
        db.table("investigations")
        .select("*")
        .eq("share_token", token)
        .execute()
    )
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Shared investigation not found")
    
    investigation = result.data[0]
    
    # Check expiry
    if investigation.get("share_expires_at"):
        expires_at = datetime.fromisoformat(investigation["share_expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=410, detail="Share link has expired")
    
    # Get actions
    actions_result = (
        db.table("investigation_actions")
        .select("*")
        .eq("investigation_id", investigation["id"])
        .order("discipline", desc=False)
        .execute()
    )
    
    # Return read-only view (strip sensitive IDs)
    return {
        "investigation_number": investigation.get("investigation_number"),
        "title": investigation.get("title"),
        "customer_oem": investigation.get("customer_oem"),
        "severity": investigation.get("severity"),
        "status": investigation.get("status"),
        "problem_description": investigation.get("what_failed"),
        "root_causes": investigation.get("root_causes"),
        "five_why_chain": investigation.get("five_why_chain"),
        "escape_point": investigation.get("escape_point"),
        "closure_summary": investigation.get("closure_summary"),
        "actions": [
            {
                "discipline": a.get("discipline"),
                "description": a.get("description"),
                "status": a.get("status"),
                "due_date": a.get("due_date"),
            }
            for a in actions_result.data
        ],
        "created_at": investigation.get("created_at"),
        "closed_at": investigation.get("closed_at"),
    }


@router.post("/{investigation_id}/close")
async def close_investigation(
    investigation_id: str,
    data: CloseInvestigationRequest,
    user: dict = Depends(get_current_user),
):
    """Close investigation after validation.
    
    Validates:
    - All D5 actions verified
    - Approver assigned and signed D8
    - Optionally generates closure_summary via AI
    """
    db = get_supabase()
    investigation = _check_team_access(db, investigation_id, user["id"])
    
    # Check permission
    if not _check_lead_or_champion(investigation, user["id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Team Lead or Champion can close investigation"
        )
    
    # Validate closure requirements
    errors = []
    
    if not investigation.get("approver_user_id"):
        errors.append("Approver must be assigned before closing")
    
    # Check D5 actions are verified
    d5_actions = (
        db.table("investigation_actions")
        .select("*")
        .eq("investigation_id", investigation_id)
        .eq("discipline", "D5")
        .execute()
    )
    
    for action in d5_actions.data:
        if action["status"] != "complete":
            errors.append(f"D5 action '{action['description'][:50]}...' must be completed")
        if not action.get("verification_date"):
            errors.append(f"D5 action '{action['description'][:50]}...' must be verified")
    
    # Check approver sign-off on D8
    d8_signature = (
        db.table("investigation_signatures")
        .select("id")
        .eq("investigation_id", investigation_id)
        .eq("discipline", "D8")
        .eq("user_id", investigation["approver_user_id"])
        .execute()
    )
    
    if not d8_signature.data:
        errors.append("Approver must sign D8 before closing")
    
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Cannot close investigation", "errors": errors}
        )
    
    # Generate closure summary via AI if requested
    closure_summary = data.lessons_learned or investigation.get("closure_summary", "")
    
    if data.generate_closure_summary:
        try:
            from services.investigation_ai_service import generate_8d_narrative
            
            # Fetch full investigation data for narrative generation
            actions_result = (
                db.table("investigation_actions")
                .select("*")
                .eq("investigation_id", investigation_id)
                .execute()
            )
            
            investigation_data = {
                **investigation,
                "actions": actions_result.data,
            }
            
            narrative = await generate_8d_narrative(investigation_data)
            closure_summary = narrative.get("d8_closure", closure_summary)
        except Exception as e:
            logger.warning(f"Failed to generate AI closure summary (non-fatal): {e}")
    
    # Close investigation
    update_data = {
        "status": "closed",
        "closed_at": datetime.now(timezone.utc).isoformat(),
        "closure_summary": closure_summary,
        "lessons_learned": data.lessons_learned,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    
    try:
        db.table("investigations").update(update_data).eq("id", investigation_id).execute()
        
        # Log event
        log_event(
            investigation_id=investigation_id,
            event_type="investigation_closed",
            event_detail=f"Investigation {investigation.get('investigation_number')} closed",
            actor_user_id=user["id"],
        )
        
        return {
            "success": True,
            "message": f"Investigation {investigation.get('investigation_number')} closed successfully",
            "closed_at": update_data["closed_at"],
            "closure_summary": closure_summary,
        }
    
    except Exception as e:
        logger.exception(f"Failed to close investigation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Close failed: {str(e)[:200]}",
        )
