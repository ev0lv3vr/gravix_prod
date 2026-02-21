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
metrics_router = APIRouter(prefix="/api/admin/metrics", tags=["admin-metrics"])


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


class EngineHealthStats(BaseModel):
    # AI call stats (last 7 days)
    total_ai_calls: int = 0
    successful_ai_calls: int = 0
    failed_ai_calls: int = 0
    avg_latency_ms: Optional[float] = None
    calls_by_engine: dict[str, int] = {}

    # Knowledge injection stats
    calls_with_knowledge: int = 0
    injection_rate_pct: Optional[float] = None
    avg_patterns_per_call: Optional[float] = None

    # Knowledge base health
    total_knowledge_patterns: int = 0
    patterns_with_strong_evidence: int = 0  # evidence_count >= 3
    total_feedback_entries: int = 0

    # Cron health
    last_aggregation_run: Optional[str] = None
    last_aggregation_status: Optional[str] = None
    last_aggregation_patterns_upserted: int = 0

    # Confidence calibration
    avg_confidence_raw: Optional[float] = None
    avg_confidence_calibrated: Optional[float] = None


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
        if data.plan not in ("free", "pro", "team", "quality", "enterprise"):
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


@router.get("/engine-health", response_model=EngineHealthStats)
async def admin_engine_health(_admin: dict = Depends(get_admin_user)):
    """Engine observability — AI call stats, knowledge injection rates, cron health."""
    db = get_supabase()
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()

    stats = EngineHealthStats()

    # --- AI call stats (last 7 days) ---
    try:
        logs = (
            db.table("ai_engine_logs")
            .select("success, latency_ms, meta, engine")
            .gte("created_at", week_ago)
            .order("created_at", desc=True)
            .limit(1000)
            .execute()
        ).data or []

        stats.total_ai_calls = len(logs)
        stats.successful_ai_calls = sum(1 for l in logs if l.get("success"))
        stats.failed_ai_calls = stats.total_ai_calls - stats.successful_ai_calls

        latencies = [l["latency_ms"] for l in logs if l.get("latency_ms")]
        stats.avg_latency_ms = round(sum(latencies) / len(latencies)) if latencies else None

        # Calls by engine type
        engine_counts: dict[str, int] = {}
        for l in logs:
            eng = (l.get("engine") or (l.get("meta") or {}).get("engine", "unknown"))
            engine_counts[eng] = engine_counts.get(eng, 0) + 1
        stats.calls_by_engine = engine_counts

        # Knowledge injection rate
        calls_with_knowledge = sum(
            1 for l in logs
            if (l.get("meta") or {}).get("knowledge_patterns_injected", 0) > 0
        )
        stats.calls_with_knowledge = calls_with_knowledge
        stats.injection_rate_pct = (
            round(calls_with_knowledge / len(logs) * 100, 1)
            if logs else None
        )

        pattern_counts = [
            (l.get("meta") or {}).get("knowledge_patterns_injected", 0)
            for l in logs
            if (l.get("meta") or {}).get("knowledge_patterns_injected", 0) > 0
        ]
        stats.avg_patterns_per_call = (
            round(sum(pattern_counts) / len(pattern_counts), 1)
            if pattern_counts else None
        )

        # Confidence stats
        raw_scores = [
            (l.get("meta") or {}).get("confidence_raw")
            for l in logs
            if (l.get("meta") or {}).get("confidence_raw") is not None
        ]
        if raw_scores:
            stats.avg_confidence_raw = round(sum(raw_scores) / len(raw_scores), 3)
    except Exception as exc:
        logger.warning(f"Failed to query ai_engine_logs: {exc}")

    # --- Knowledge base health ---
    try:
        kp = db.table("knowledge_patterns").select("id", count="exact").execute()
        stats.total_knowledge_patterns = kp.count or 0

        strong = (
            db.table("knowledge_patterns")
            .select("id", count="exact")
            .gte("evidence_count", 3)
            .execute()
        )
        stats.patterns_with_strong_evidence = strong.count or 0

        fb = db.table("analysis_feedback").select("id", count="exact").execute()
        stats.total_feedback_entries = fb.count or 0
    except Exception as exc:
        logger.warning(f"Failed to query knowledge stats: {exc}")

    # --- Cron health ---
    try:
        last_run = (
            db.table("cron_run_log")
            .select("*")
            .eq("job_name", "aggregate-knowledge")
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if last_run.data:
            row = last_run.data[0]
            stats.last_aggregation_run = str(row.get("created_at"))
            stats.last_aggregation_status = row.get("status")
            result_data = row.get("result") or {}
            stats.last_aggregation_patterns_upserted = result_data.get("patterns_upserted", 0)
    except Exception as exc:
        logger.warning(f"Failed to query cron_run_log: {exc}")

    return stats


# ---------------------------------------------------------------------------
# L1 parity metrics endpoints: /api/admin/metrics/*
# ---------------------------------------------------------------------------

class DateRangeParams(BaseModel):
    range: str = "7d"
    start_date: Optional[str] = None
    end_date: Optional[str] = None


def _compute_window(range_value: str = "7d", start_date: Optional[str] = None, end_date: Optional[str] = None) -> tuple[str, str]:
    now = datetime.now(timezone.utc)
    if range_value == "custom" and start_date and end_date:
        return start_date, end_date
    days = 7
    if range_value == "30d":
        days = 30
    elif range_value == "90d":
        days = 90
    start = (now - timedelta(days=days)).isoformat()
    end = now.isoformat()
    return start, end


@metrics_router.get('/overview', response_model=OverviewStats)
async def admin_metrics_overview(
    range: str = Query("7d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    _admin: dict = Depends(get_admin_user),
):
    # Reuse existing overview payload for compatibility.
    _ = _compute_window(range, start_date, end_date)
    return await admin_overview(_admin)


@metrics_router.get('/ai-engine', response_model=EngineHealthStats)
async def admin_metrics_ai_engine(
    range: str = Query("7d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    _admin: dict = Depends(get_admin_user),
):
    _ = _compute_window(range, start_date, end_date)
    return await admin_engine_health(_admin)


@metrics_router.get('/engagement')
async def admin_metrics_engagement(
    range: str = Query("7d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    _admin: dict = Depends(get_admin_user),
):
    db = get_supabase()
    start, end = _compute_window(range, start_date, end_date)

    users = db.table("users").select("id", count="exact").gte("created_at", start).lte("created_at", end).execute().count or 0
    analyses = db.table("failure_analyses").select("id", count="exact").gte("created_at", start).lte("created_at", end).execute().count or 0
    specs = db.table("spec_requests").select("id", count="exact").gte("created_at", start).lte("created_at", end).execute().count or 0
    activity = await admin_activity(_admin)

    return {
        "window": {"range": range, "start_date": start, "end_date": end},
        "new_users": users,
        "analyses": analyses,
        "specs": specs,
        "recent_activity": [a.model_dump() for a in activity[:25]],
    }


@metrics_router.get('/knowledge')
async def admin_metrics_knowledge(
    range: str = Query("7d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    _admin: dict = Depends(get_admin_user),
):
    db = get_supabase()
    start, end = _compute_window(range, start_date, end_date)

    patterns_total = db.table("knowledge_patterns").select("id", count="exact").execute().count or 0
    patterns_recent = db.table("knowledge_patterns").select("id", count="exact").gte("updated_at", start).lte("updated_at", end).execute().count or 0
    feedback_total = db.table("analysis_feedback").select("id", count="exact").execute().count or 0
    feedback_recent = db.table("analysis_feedback").select("id", count="exact").gte("created_at", start).lte("created_at", end).execute().count or 0

    return {
        "window": {"range": range, "start_date": start, "end_date": end},
        "knowledge_patterns_total": patterns_total,
        "knowledge_patterns_recent": patterns_recent,
        "feedback_total": feedback_total,
        "feedback_recent": feedback_recent,
    }


@metrics_router.get('/system')
async def admin_metrics_system(
    range: str = Query("7d"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    _admin: dict = Depends(get_admin_user),
):
    db = get_supabase()
    start, end = _compute_window(range, start_date, end_date)

    logs = (
        db.table("api_request_logs")
        .select("status_code, duration_ms")
        .gte("created_at", start)
        .lte("created_at", end)
        .limit(2000)
        .execute()
    ).data or []

    total = len(logs)
    err = sum(1 for r in logs if (r.get("status_code") or 0) >= 500)
    p95 = None
    durs = sorted([int(r.get("duration_ms") or 0) for r in logs if r.get("duration_ms") is not None])
    if durs:
        idx = int(round(0.95 * (len(durs)-1)))
        p95 = durs[idx]

    last_cron = (
        db.table("cron_run_log")
        .select("job_name,status,created_at,result")
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    ).data or []

    return {
        "window": {"range": range, "start_date": start, "end_date": end},
        "requests_total": total,
        "server_errors": err,
        "p95_latency_ms": p95,
        "recent_cron_runs": last_cron,
    }
