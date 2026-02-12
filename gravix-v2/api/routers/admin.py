"""Admin dashboard API endpoints."""

import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from dependencies import get_current_user
from database import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Admin dependency
# ---------------------------------------------------------------------------

async def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    """Verify the authenticated user has admin role.

    Uses the user record already fetched by ``get_current_user`` (which
    reads from the public ``users`` table).  Backend connects with the
    Supabase service key so RLS is bypassed — the admin check **must**
    happen here in code.
    """
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class OverviewStats(BaseModel):
    total_users: int = 0
    users_by_plan: dict[str, int] = {}
    total_analyses: int = 0
    total_specs: int = 0
    analyses_today: int = 0
    analyses_this_week: int = 0
    signups_today: int = 0
    signups_this_week: int = 0


class AdminUserItem(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    plan: str = "free"
    analyses_this_month: int = 0
    specs_this_month: int = 0
    stripe_customer_id: Optional[str] = None
    created_at: Optional[str] = None


class AdminUserUpdate(BaseModel):
    plan: Optional[str] = None
    role: Optional[str] = None


class ActivityItem(BaseModel):
    id: str
    type: str  # "analysis" | "spec"
    user_email: Optional[str] = None
    substrates: Optional[str] = None
    status: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: Optional[str] = None


class RequestLogItem(BaseModel):
    id: Optional[str] = None
    method: Optional[str] = None
    path: Optional[str] = None
    status_code: Optional[int] = None
    duration_ms: Optional[int] = None
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    created_at: Optional[str] = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/overview", response_model=OverviewStats)
async def admin_overview(_admin: dict = Depends(get_admin_user)):
    """Dashboard overview statistics."""
    db = get_supabase()

    # Total users + plan breakdown
    users_result = db.table("users").select("plan").execute()
    all_users = users_result.data or []
    total_users = len(all_users)
    plan_counts: dict[str, int] = {}
    for u in all_users:
        p = u.get("plan", "free")
        plan_counts[p] = plan_counts.get(p, 0) + 1

    # Total completed analyses
    analyses_result = (
        db.table("failure_analyses")
        .select("id", count="exact")
        .eq("status", "completed")
        .execute()
    )
    total_analyses = analyses_result.count or 0

    # Total completed specs
    specs_result = (
        db.table("spec_requests")
        .select("id", count="exact")
        .eq("status", "completed")
        .execute()
    )
    total_specs = specs_result.count or 0

    # Time boundaries
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    week_start = (now - timedelta(days=now.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    ).isoformat()

    # Analyses today
    at = (
        db.table("failure_analyses")
        .select("id", count="exact")
        .eq("status", "completed")
        .gte("created_at", today_start)
        .execute()
    )
    analyses_today = at.count or 0

    # Analyses this week
    aw = (
        db.table("failure_analyses")
        .select("id", count="exact")
        .eq("status", "completed")
        .gte("created_at", week_start)
        .execute()
    )
    analyses_this_week = aw.count or 0

    # Signups today
    st = (
        db.table("users")
        .select("id", count="exact")
        .gte("created_at", today_start)
        .execute()
    )
    signups_today = st.count or 0

    # Signups this week
    sw = (
        db.table("users")
        .select("id", count="exact")
        .gte("created_at", week_start)
        .execute()
    )
    signups_this_week = sw.count or 0

    return OverviewStats(
        total_users=total_users,
        users_by_plan=plan_counts,
        total_analyses=total_analyses,
        total_specs=total_specs,
        analyses_today=analyses_today,
        analyses_this_week=analyses_this_week,
        signups_today=signups_today,
        signups_this_week=signups_this_week,
    )


@router.get("/users", response_model=list[AdminUserItem])
async def admin_list_users(
    search: Optional[str] = Query(None),
    _admin: dict = Depends(get_admin_user),
):
    """List all users with usage info."""
    db = get_supabase()
    query = db.table("users").select(
        "id, email, name, company, role, plan, "
        "analyses_this_month, specs_this_month, "
        "stripe_customer_id, created_at"
    ).order("created_at", desc=True)

    if search:
        query = query.or_(f"email.ilike.%{search}%,name.ilike.%{search}%")

    result = query.execute()

    items: list[AdminUserItem] = []
    for row in result.data or []:
        ca = row.get("created_at")
        items.append(AdminUserItem(
            id=row["id"],
            email=row.get("email", ""),
            name=row.get("name"),
            company=row.get("company"),
            role=row.get("role"),
            plan=row.get("plan", "free"),
            analyses_this_month=row.get("analyses_this_month", 0),
            specs_this_month=row.get("specs_this_month", 0),
            stripe_customer_id=row.get("stripe_customer_id"),
            created_at=str(ca) if ca else None,
        ))
    return items


@router.patch("/users/{user_id}", response_model=AdminUserItem)
async def admin_update_user(
    user_id: str,
    data: AdminUserUpdate,
    admin: dict = Depends(get_admin_user),
):
    """Update a user's plan or role (admin only)."""
    db = get_supabase()

    update_fields: dict = {}
    if data.plan is not None:
        if data.plan not in ("free", "pro", "team"):
            raise HTTPException(status_code=400, detail="Invalid plan value")
        update_fields["plan"] = data.plan
    if data.role is not None:
        if data.role not in ("admin", "user", ""):
            raise HTTPException(status_code=400, detail="Invalid role value")
        update_fields["role"] = data.role

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_fields["updated_at"] = datetime.now(timezone.utc).isoformat()

    result = (
        db.table("users")
        .update(update_fields)
        .eq("id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Audit log
    try:
        db.table("admin_audit_log").insert({
            "actor_user_id": admin["id"],
            "action": "update_user",
            "target_table": "users",
            "target_id": user_id,
            "details": update_fields,
        }).execute()
    except Exception as e:
        logger.warning(f"Failed to write audit log: {e}")

    row = result.data[0]
    return AdminUserItem(
        id=row["id"],
        email=row.get("email", ""),
        name=row.get("name"),
        company=row.get("company"),
        role=row.get("role"),
        plan=row.get("plan", "free"),
        analyses_this_month=row.get("analyses_this_month", 0),
        specs_this_month=row.get("specs_this_month", 0),
        stripe_customer_id=row.get("stripe_customer_id"),
        created_at=str(row["created_at"]) if row.get("created_at") else None,
    )


@router.get("/activity", response_model=list[ActivityItem])
async def admin_activity(_admin: dict = Depends(get_admin_user)):
    """Recent activity feed — last 50 analyses + specs combined."""
    db = get_supabase()

    # Fetch recent analyses
    analyses = (
        db.table("failure_analyses")
        .select("id, user_id, substrate_a, substrate_b, status, confidence_score, created_at")
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    ).data or []

    # Fetch recent specs
    specs = (
        db.table("spec_requests")
        .select("id, user_id, substrate_a, substrate_b, status, confidence_score, created_at")
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    ).data or []

    # Build user_id -> email map
    user_ids = list({
        r.get("user_id") for r in analyses + specs if r.get("user_id")
    })
    email_map: dict[str, str] = {}
    if user_ids:
        for uid in user_ids:
            ures = db.table("users").select("email").eq("id", uid).execute()
            if ures.data:
                email_map[uid] = ures.data[0].get("email", "")

    # Merge and sort
    items: list[dict] = []
    for a in analyses:
        subs = ", ".join(filter(None, [a.get("substrate_a"), a.get("substrate_b")]))
        items.append({
            "id": a["id"],
            "type": "analysis",
            "user_email": email_map.get(a.get("user_id", ""), ""),
            "substrates": subs or None,
            "status": a.get("status"),
            "confidence_score": a.get("confidence_score"),
            "created_at": str(a["created_at"]) if a.get("created_at") else None,
            "_sort": a.get("created_at", ""),
        })
    for s in specs:
        subs = ", ".join(filter(None, [s.get("substrate_a"), s.get("substrate_b")]))
        items.append({
            "id": s["id"],
            "type": "spec",
            "user_email": email_map.get(s.get("user_id", ""), ""),
            "substrates": subs or None,
            "status": s.get("status"),
            "confidence_score": s.get("confidence_score"),
            "created_at": str(s["created_at"]) if s.get("created_at") else None,
            "_sort": s.get("created_at", ""),
        })

    items.sort(key=lambda x: x.get("_sort", ""), reverse=True)
    items = items[:50]

    return [
        ActivityItem(
            id=i["id"],
            type=i["type"],
            user_email=i.get("user_email"),
            substrates=i.get("substrates"),
            status=i.get("status"),
            confidence_score=i.get("confidence_score"),
            created_at=i.get("created_at"),
        )
        for i in items
    ]


@router.get("/request-logs", response_model=list[RequestLogItem])
async def admin_request_logs(
    path: Optional[str] = Query(None),
    _admin: dict = Depends(get_admin_user),
):
    """API request logs — last 100 entries."""
    db = get_supabase()
    query = (
        db.table("api_request_logs")
        .select("id, method, path, status_code, duration_ms, user_id, created_at")
        .order("created_at", desc=True)
        .limit(100)
    )

    if path:
        query = query.ilike("path", f"%{path}%")

    result = query.execute()

    # Resolve emails
    rows = result.data or []
    user_ids = list({r.get("user_id") for r in rows if r.get("user_id")})
    email_map: dict[str, str] = {}
    if user_ids:
        for uid in user_ids:
            ures = db.table("users").select("email").eq("id", str(uid)).execute()
            if ures.data:
                email_map[str(uid)] = ures.data[0].get("email", "")

    return [
        RequestLogItem(
            id=str(r.get("id", "")),
            method=r.get("method"),
            path=r.get("path"),
            status_code=r.get("status_code"),
            duration_ms=r.get("duration_ms"),
            user_id=str(r.get("user_id", "")) if r.get("user_id") else None,
            user_email=email_map.get(str(r.get("user_id", "")), None),
            created_at=str(r["created_at"]) if r.get("created_at") else None,
        )
        for r in rows
    ]
