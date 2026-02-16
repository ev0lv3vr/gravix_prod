"""Schemas for 8D investigation management."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


# Team Member schemas
class TeamMemberAdd(BaseModel):
    user_id: str
    role: str = "member"
    discipline: Optional[str] = None


class TeamMemberResponse(BaseModel):
    id: str
    user_id: str
    role: str
    discipline: Optional[str] = None
    added_by: Optional[str] = None
    created_at: datetime


# Action schemas
class ActionCreate(BaseModel):
    discipline: str = Field(..., pattern="^(D3|D5|D7)$")
    action_type: Optional[str] = None
    description: str
    owner_user_id: Optional[str] = None
    priority: Optional[str] = Field(None, pattern="^(P1|P2|P3)$")
    due_date: Optional[date] = None


class ActionUpdate(BaseModel):
    description: Optional[str] = None
    owner_user_id: Optional[str] = None
    priority: Optional[str] = Field(None, pattern="^(P1|P2|P3)$")
    status: Optional[str] = Field(None, pattern="^(open|in_progress|complete|cancelled)$")
    due_date: Optional[date] = None
    completion_date: Optional[date] = None
    verification_method: Optional[str] = None
    sample_size: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    verification_results: Optional[str] = None
    verified_by: Optional[str] = None
    verification_date: Optional[date] = None


class ActionResponse(BaseModel):
    id: str
    investigation_id: str
    discipline: str
    action_type: Optional[str] = None
    description: str
    owner_user_id: Optional[str] = None
    priority: Optional[str] = None
    status: str
    due_date: Optional[date] = None
    completion_date: Optional[date] = None
    verification_method: Optional[str] = None
    sample_size: Optional[str] = None
    acceptance_criteria: Optional[str] = None
    verification_results: Optional[str] = None
    verified_by: Optional[str] = None
    verification_date: Optional[date] = None
    evidence_urls: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime


# Investigation schemas
class InvestigationCreate(BaseModel):
    title: str
    product_part_number: Optional[str] = None
    customer_oem: Optional[str] = None
    severity: str = Field(..., pattern="^(critical|major|minor)$")
    lot_batch_number: Optional[str] = None
    production_line: Optional[str] = None
    shift: Optional[str] = None
    date_of_occurrence: Optional[datetime] = None
    customer_complaint_ref: Optional[str] = None
    
    # Optional: create from existing analysis
    analysis_id: Optional[str] = None
    
    # D2 Problem Description
    who_reported: Optional[str] = None
    what_failed: Optional[str] = None
    where_in_process: Optional[str] = None
    when_detected: Optional[datetime] = None
    why_it_matters: Optional[str] = None
    how_detected: Optional[str] = None
    how_many_affected: Optional[int] = None
    defect_quantity: Optional[int] = None
    scrap_cost: Optional[float] = None
    rework_cost: Optional[float] = None
    
    # Team
    champion_user_id: Optional[str] = None
    approver_user_id: Optional[str] = None


class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    product_part_number: Optional[str] = None
    customer_oem: Optional[str] = None
    severity: Optional[str] = Field(None, pattern="^(critical|major|minor)$")
    lot_batch_number: Optional[str] = None
    production_line: Optional[str] = None
    shift: Optional[str] = None
    date_of_occurrence: Optional[datetime] = None
    customer_complaint_ref: Optional[str] = None
    
    # D2 Problem Description
    who_reported: Optional[str] = None
    what_failed: Optional[str] = None
    where_in_process: Optional[str] = None
    when_detected: Optional[datetime] = None
    why_it_matters: Optional[str] = None
    how_detected: Optional[str] = None
    how_many_affected: Optional[int] = None
    defect_quantity: Optional[int] = None
    scrap_cost: Optional[float] = None
    rework_cost: Optional[float] = None
    
    # D4 Root Cause (AI-generated or manual)
    root_causes: Optional[List[dict]] = None
    five_why_chain: Optional[List[dict]] = None
    escape_point: Optional[str] = None
    fishbone_data: Optional[dict] = None
    
    # D8 Closure
    closure_summary: Optional[str] = None
    lessons_learned: Optional[str] = None
    
    # Team
    champion_user_id: Optional[str] = None
    approver_user_id: Optional[str] = None
    
    # Report template
    report_template: Optional[str] = None


class InvestigationResponse(BaseModel):
    id: str
    user_id: str
    investigation_number: str
    title: str
    status: str
    severity: str
    
    product_part_number: Optional[str] = None
    customer_oem: Optional[str] = None
    lot_batch_number: Optional[str] = None
    production_line: Optional[str] = None
    shift: Optional[str] = None
    date_of_occurrence: Optional[datetime] = None
    customer_complaint_ref: Optional[str] = None
    
    # D2 Problem Description
    who_reported: Optional[str] = None
    what_failed: Optional[str] = None
    where_in_process: Optional[str] = None
    when_detected: Optional[datetime] = None
    why_it_matters: Optional[str] = None
    how_detected: Optional[str] = None
    how_many_affected: Optional[int] = None
    defect_quantity: Optional[int] = None
    scrap_cost: Optional[float] = None
    rework_cost: Optional[float] = None
    
    # D4 Root Cause
    analysis_id: Optional[str] = None
    root_causes: Optional[List[dict]] = None
    five_why_chain: Optional[List[dict]] = None
    escape_point: Optional[str] = None
    fishbone_data: Optional[dict] = None
    
    # D8 Closure
    closure_summary: Optional[str] = None
    lessons_learned: Optional[str] = None
    closed_at: Optional[datetime] = None
    
    # Team
    champion_user_id: Optional[str] = None
    team_lead_user_id: Optional[str] = None
    approver_user_id: Optional[str] = None
    
    # Report template
    report_template: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime


class InvestigationListItem(BaseModel):
    id: str
    investigation_number: str
    title: str
    status: str
    severity: str
    customer_oem: Optional[str] = None
    team_lead_user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class StatusTransition(BaseModel):
    """Status transition with entry criteria validation."""
    new_status: str = Field(..., pattern="^(open|containment|investigating|corrective_action|verification|closed)$")
    notes: Optional[str] = None


class StatusTransitionResponse(BaseModel):
    investigation_id: str
    old_status: str
    new_status: str
    transition_allowed: bool
    validation_errors: Optional[List[str]] = None
    message: str
