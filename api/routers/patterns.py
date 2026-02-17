"""Pattern detection and alerts router.

Sprint 11: AI-Forward — Pattern detection cron job, alert management.
"""

import logging
import uuid
import math
from datetime import datetime, timezone, timedelta
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status, Header, Query

from dependencies import get_current_user
from database import get_supabase
from config import settings
from schemas.patterns import (
    PatternAlertResponse,
    PatternAlertUpdate,
    PatternDetectionResult,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/patterns", tags=["patterns"])


def _compute_z_score(current_count: int, historical_mean: float, historical_std: float) -> float:
    """Compute Z-score for anomaly detection."""
    if historical_std == 0:
        return 0.0 if current_count == historical_mean else 3.0
    return (current_count - historical_mean) / historical_std


def _determine_severity(z_score: float) -> str:
    """Map Z-score to severity level."""
    if z_score >= 3.0:
        return "critical"
    elif z_score >= 2.0:
        return "warning"
    return "informational"


@router.post("/detect", response_model=PatternDetectionResult)
async def detect_patterns(
    x_cron_secret: str = Header(None),
    user: dict = Depends(get_current_user),
):
    """Run pattern detection on recent failure analyses.
    
    Groups by product/substrate/failure_mode, computes Z-scores
    against historical averages, flags anomalies.
    
    Can be called via cron (with X-Cron-Secret) or by admin users.
    """
    # Auth: either cron secret or admin user
    is_cron = x_cron_secret and settings.cron_secret and x_cron_secret == settings.cron_secret
    is_admin = user.get("role") == "admin"
    
    if not is_cron and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pattern detection requires admin access or cron secret",
        )
    
    db = get_supabase()
    now = datetime.now(timezone.utc)
    
    # Get recent analyses (last 30 days)
    recent_cutoff = (now - timedelta(days=30)).isoformat()
    recent_result = (
        db.table("failure_analyses")
        .select("id, failure_mode, substrate_a, substrate_b, material_product, root_cause_category, created_at")
        .eq("status", "completed")
        .gte("created_at", recent_cutoff)
        .execute()
    )
    
    # Get historical analyses (31-180 days ago) for baseline
    historical_start = (now - timedelta(days=180)).isoformat()
    historical_end = (now - timedelta(days=31)).isoformat()
    historical_result = (
        db.table("failure_analyses")
        .select("id, failure_mode, substrate_a, substrate_b, material_product, root_cause_category, created_at")
        .eq("status", "completed")
        .gte("created_at", historical_start)
        .lte("created_at", historical_end)
        .execute()
    )
    
    # Group recent failures by composite key
    recent_groups: dict[str, list[dict]] = defaultdict(list)
    for a in recent_result.data:
        key = f"{a.get('failure_mode', 'unknown')}|{a.get('substrate_a', 'unknown')}|{a.get('material_product', 'unknown')}"
        recent_groups[key].append(a)
    
    # Group historical failures by composite key (per month)
    # 5 months of history → compute mean and std per month
    historical_monthly: dict[str, list[int]] = defaultdict(lambda: [0, 0, 0, 0, 0])
    for a in historical_result.data:
        key = f"{a.get('failure_mode', 'unknown')}|{a.get('substrate_a', 'unknown')}|{a.get('material_product', 'unknown')}"
        created = a.get("created_at", "")
        if created:
            days_ago = (now - datetime.fromisoformat(created.replace("Z", "+00:00"))).days
            month_idx = min((days_ago - 31) // 30, 4)
            historical_monthly[key][month_idx] += 1
    
    alerts_created = 0
    patterns_checked = len(recent_groups)
    
    for key, recent_items in recent_groups.items():
        recent_count = len(recent_items)
        
        # Compute historical stats
        hist_counts = historical_monthly.get(key, [0, 0, 0, 0, 0])
        hist_mean = sum(hist_counts) / max(len(hist_counts), 1)
        hist_variance = sum((c - hist_mean) ** 2 for c in hist_counts) / max(len(hist_counts), 1)
        hist_std = math.sqrt(hist_variance) if hist_variance > 0 else 0.5
        
        z_score = _compute_z_score(recent_count, hist_mean, hist_std)
        
        # Only flag if Z-score >= 2.0 (statistically significant)
        if z_score < 2.0:
            continue
        
        parts = key.split("|")
        failure_mode = parts[0] if parts[0] != "unknown" else None
        substrate = parts[1] if len(parts) > 1 and parts[1] != "unknown" else None
        product = parts[2] if len(parts) > 2 and parts[2] != "unknown" else None
        
        severity = _determine_severity(z_score)
        
        # Check if similar alert already exists (avoid duplicates)
        existing = (
            db.table("pattern_alerts")
            .select("id")
            .eq("status", "active")
            .eq("failure_mode", failure_mode or "")
            .eq("affected_substrate", substrate or "")
            .eq("affected_product", product or "")
            .execute()
        )
        
        if existing.data:
            continue
        
        # Create alert
        alert_id = str(uuid.uuid4())
        alert_record = {
            "id": alert_id,
            "alert_type": "time_cluster",
            "severity": severity,
            "title": f"Spike in {failure_mode or 'failures'}" + (f" on {substrate}" if substrate else ""),
            "description": f"{recent_count} failures in the last 30 days vs historical average of {hist_mean:.1f}/month (Z-score: {z_score:.2f})",
            "affected_product": product,
            "affected_substrate": substrate,
            "failure_mode": failure_mode,
            "statistical_confidence": min(z_score / 5.0, 1.0),
            "affected_investigation_ids": [item["id"] for item in recent_items[:20]],
            "status": "active",
            "created_at": now.isoformat(),
        }
        
        try:
            db.table("pattern_alerts").insert(alert_record).execute()
            alerts_created += 1
            logger.info(f"Pattern alert created: {alert_record['title']} (severity={severity}, z={z_score:.2f})")
        except Exception as e:
            logger.warning(f"Failed to create pattern alert: {e}")
    
    # Generate AI explanations for new critical alerts
    if alerts_created > 0:
        try:
            from services.ai_engine import _call_claude
            
            new_alerts = (
                db.table("pattern_alerts")
                .select("*")
                .eq("status", "active")
                .is_("ai_explanation", "null")
                .eq("severity", "critical")
                .limit(5)
                .execute()
            )
            
            for alert in new_alerts.data:
                try:
                    explanation = await _call_claude(
                        system_prompt="You are a materials science expert. Provide a brief (2-3 sentence) explanation of why this failure pattern might be occurring and what actions should be taken. Respond in plain text, not JSON.",
                        user_prompt=f"Pattern alert: {alert['title']}\nDescription: {alert['description']}\nFailure mode: {alert.get('failure_mode', 'N/A')}\nProduct: {alert.get('affected_product', 'N/A')}\nSubstrate: {alert.get('affected_substrate', 'N/A')}",
                        max_tokens=256,
                    )
                    ai_text = explanation.get("raw_text", str(explanation))
                    db.table("pattern_alerts").update({"ai_explanation": ai_text}).eq("id", alert["id"]).execute()
                except Exception as e:
                    logger.warning(f"AI explanation failed for alert {alert['id']}: {e}")
        except Exception as e:
            logger.warning(f"AI explanations batch failed (non-fatal): {e}")
    
    return PatternDetectionResult(
        alerts_created=alerts_created,
        patterns_checked=patterns_checked,
        message=f"Pattern detection complete. {alerts_created} new alerts from {patterns_checked} patterns checked.",
    )


@router.get("/alerts", response_model=list[PatternAlertResponse])
async def list_pattern_alerts(
    status_filter: str = Query(None, alias="status"),
    user: dict = Depends(get_current_user),
):
    """List pattern alerts. Defaults to active alerts."""
    db = get_supabase()
    
    query = db.table("pattern_alerts").select("*")
    
    if status_filter:
        query = query.eq("status", status_filter)
    else:
        query = query.eq("status", "active")
    
    result = query.order("created_at", desc=True).limit(50).execute()
    
    return [PatternAlertResponse(**item) for item in result.data]


@router.patch("/alerts/{alert_id}", response_model=PatternAlertResponse)
async def update_pattern_alert(
    alert_id: str,
    data: PatternAlertUpdate,
    user: dict = Depends(get_current_user),
):
    """Acknowledge or resolve a pattern alert."""
    db = get_supabase()
    
    # Check exists
    existing = db.table("pattern_alerts").select("*").eq("id", alert_id).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    try:
        db.table("pattern_alerts").update({"status": data.status}).eq("id", alert_id).execute()
        result = db.table("pattern_alerts").select("*").eq("id", alert_id).execute()
        return PatternAlertResponse(**result.data[0])
    except Exception as e:
        logger.exception(f"Failed to update alert: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)[:200]}",
        )
