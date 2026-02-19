# Admin Dashboard — L2 Full Detail

> Extracted from gravix-final-prd.md Part IX. **Focus on:** Part 3 (Admin Dashboard API) and Part 4 (Admin Dashboard Frontend). The observability infrastructure (Part 1-2) is a dependency — see L2/observability-full.md for the data layer.

# PART IX: OBSERVABILITY & ADMIN SYSTEM

> **Source document:** `gravix-v1_1-observability-admin.md` (v2.0)
>
> Complete specification for request logging, daily metrics aggregation, admin dashboard API, and admin dashboard frontend.

**Effort:** 4-5 additional days (Sprint 5-6)  
**Stack additions:** None required â€” built on existing FastAPI + Supabase + Vercel

---

## PART 1: ROLE SYSTEM

### 1.1 Database Migration

**File:** `database/migrations/004_v1_1_roles.sql`

```sql
-- ============================================
-- MIGRATION 004: Role system
-- ============================================

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT 
    DEFAULT 'user' CHECK (role IN ('user', 'admin', 'reviewer'));

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Set yourself as admin (replace with your actual user ID or email)
UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL_HERE';

-- ============================================
-- Admin audit log (tracks admin actions)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,          -- 'viewed_analytics', 'featured_case', 'deleted_case', etc.
    resource_type TEXT,            -- 'user', 'analysis', 'case', 'system'
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log(created_at DESC);

-- RLS: only admins can read audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON admin_audit_log
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
```

### 1.2 Backend: Admin auth dependency

**File:** `api/auth/admin.py` (NEW FILE)

```python
"""
Admin authentication dependency.
Use: @router.get("/admin/...", dependencies=[Depends(require_admin)])
"""

from fastapi import Depends, HTTPException
from auth import get_current_user
from models.user import User
from database import db


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that requires the authenticated user to have admin role."""
    
    user = await db.fetch_one(
        "SELECT role FROM users WHERE id = $1", current_user.id
    )
    
    if not user or user['role'] != 'admin':
        raise HTTPException(403, "Admin access required")
    
    return current_user


async def log_admin_action(
    admin_id, action: str, resource_type: str = None, 
    resource_id=None, metadata: dict = None
):
    """Log an admin action to the audit trail."""
    await db.insert("admin_audit_log", {
        "admin_user_id": admin_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "metadata": metadata,
    })
```

---

## PART 2: OBSERVABILITY INFRASTRUCTURE

### 2.1 Database Migration: Metrics tables

**File:** `database/migrations/005_v1_1_metrics.sql`

```sql
-- ============================================
-- MIGRATION 005: Metrics & Observability Tables
-- ============================================

-- AI Engine performance log (every single AI call)
CREATE TABLE IF NOT EXISTS ai_engine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request context
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('failure_analysis', 'spec_request', 'case_generation', 'other')),
    analysis_id UUID,
    spec_id UUID,
    
    -- Model details
    model TEXT NOT NULL,                     -- 'claude-sonnet-4-20250514'
    temperature REAL,
    max_tokens INTEGER,
    
    -- Prompt metrics
    system_prompt_tokens INTEGER,            -- approximate token count of system prompt
    user_prompt_tokens INTEGER,              -- approximate token count of user prompt (including knowledge context)
    knowledge_context_tokens INTEGER,        -- tokens from knowledge injection specifically
    completion_tokens INTEGER,               -- tokens in the response
    total_tokens INTEGER,                    -- sum of all tokens
    
    -- Knowledge injection details
    had_knowledge_context BOOLEAN DEFAULT FALSE,
    knowledge_patterns_used JSONB,           -- which patterns were injected
    knowledge_confidence_level TEXT,         -- 'low', 'medium', 'high' from patterns
    
    -- Performance
    latency_ms INTEGER NOT NULL,             -- total round-trip time to Claude API
    time_to_first_token_ms INTEGER,          -- if streaming, time to first chunk
    
    -- Quality signals
    response_parsed_ok BOOLEAN DEFAULT TRUE, -- did JSON parse succeed?
    confidence_score REAL,                   -- confidence from AI response
    root_causes_count INTEGER,               -- how many root causes returned
    
    -- Errors
    error BOOLEAN DEFAULT FALSE,
    error_type TEXT,                          -- 'timeout', 'parse_error', 'api_error', 'rate_limit'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Cost tracking
    estimated_cost_usd DECIMAL(10, 6),       -- estimated API cost per call
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_engine_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_engine_logs(request_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_error ON ai_engine_logs(error) WHERE error = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_engine_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_model ON ai_engine_logs(model);

-- RLS: admins only
ALTER TABLE ai_engine_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON ai_engine_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );


-- API request log (every HTTP request to the backend)
CREATE TABLE IF NOT EXISTS api_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request
    method TEXT NOT NULL,                    -- GET, POST, PATCH, DELETE
    path TEXT NOT NULL,                      -- /v1/analyze, /v1/specify, etc.
    status_code INTEGER NOT NULL,
    
    -- Performance
    latency_ms INTEGER NOT NULL,
    
    -- Context
    user_id UUID,
    user_plan TEXT,                           -- 'free', 'pro', 'team'
    ip_address INET,
    user_agent TEXT,
    
    -- Error details (if 4xx/5xx)
    error_code TEXT,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partition-friendly index (query by time range)
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_path ON api_request_logs(path);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_request_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON api_request_logs(user_id);

-- RLS
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON api_request_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );


-- Daily aggregated metrics (pre-computed for fast dashboard loading)
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    
    -- Volume
    total_analyses INTEGER DEFAULT 0,
    total_specs INTEGER DEFAULT 0,
    total_signups INTEGER DEFAULT 0,
    total_feedback INTEGER DEFAULT 0,
    
    -- Engagement
    active_users INTEGER DEFAULT 0,          -- unique users who ran at least 1 analysis
    returning_users INTEGER DEFAULT 0,       -- users who had activity in prior 30 days
    feedback_rate REAL,                      -- feedback / (analyses eligible for feedback)
    
    -- AI engine
    avg_latency_ms INTEGER,
    p95_latency_ms INTEGER,
    p99_latency_ms INTEGER,
    ai_error_rate REAL,
    avg_confidence REAL,
    total_tokens_used INTEGER,
    estimated_ai_cost_usd DECIMAL(10, 4),
    
    -- Knowledge
    analyses_with_knowledge INTEGER DEFAULT 0,  -- analyses where knowledge context was injected
    knowledge_coverage_rate REAL,                -- analyses_with_knowledge / total_analyses
    
    -- Conversion
    free_to_pro_conversions INTEGER DEFAULT 0,
    pdf_exports INTEGER DEFAULT 0,
    expert_review_requests INTEGER DEFAULT 0,
    
    -- Resolution
    feedback_resolved INTEGER DEFAULT 0,
    feedback_not_resolved INTEGER DEFAULT 0,
    resolution_rate REAL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date DESC);
```

---

### 2.2 Backend: Request logging middleware

**File:** `api/middleware/request_logger.py` (NEW FILE)

```python
"""
FastAPI middleware that logs every API request for observability.
Lightweight: captures timing, path, status, user context.
Does NOT log request/response bodies (privacy + performance).
"""

import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from database import db


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    
    # Paths to skip logging (high-frequency, low-value)
    SKIP_PATHS = {"/v1/health", "/v1/stats/public", "/favicon.ico"}
    
    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)
        
        start = time.time()
        
        # Extract user context from token if available
        user_id = None
        user_plan = None
        try:
            # Try to read from already-decoded token in request state
            if hasattr(request.state, 'user'):
                user_id = request.state.user.id
                user_plan = request.state.user.plan
        except:
            pass
        
        # Process request
        response = await call_next(request)
        
        latency_ms = int((time.time() - start) * 1000)
        
        # Log asynchronously (fire and forget â€” don't slow down the response)
        try:
            await db.insert("api_request_logs", {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "latency_ms": latency_ms,
                "user_id": user_id,
                "user_plan": user_plan,
                "ip_address": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent", "")[:500],
                "error_code": None if response.status_code < 400 else str(response.status_code),
            })
        except Exception:
            pass  # Never let logging break the actual request
        
        return response
```

Register in `main.py`:
```python
from middleware.request_logger import RequestLoggerMiddleware
app.add_middleware(RequestLoggerMiddleware)
```

---

### 2.3 Backend: AI engine instrumentation

**File:** `api/services/ai_engine.py` (MODIFY EXISTING)

Wrap every Claude API call with detailed telemetry:

```python
import time
import json
from database import db

# Simple token estimator (4 chars â‰ˆ 1 token)
def estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)

# Pricing per million tokens (update when prices change)
PRICING = {
    "claude-sonnet-4-20250514": {"input": 3.00, "output": 15.00},  # per 1M tokens
}


async def log_ai_call(
    user_id, request_type: str, analysis_id=None, spec_id=None,
    model: str = "", system_prompt: str = "", user_prompt: str = "",
    knowledge_context: str = "", knowledge_patterns_used: list = None,
    knowledge_confidence: str = None,
    response_text: str = "", parsed_result: dict = None,
    latency_ms: int = 0, error: bool = False, error_type: str = None,
    error_message: str = None, retry_count: int = 0
):
    """Log complete AI call telemetry."""
    
    system_tokens = estimate_tokens(system_prompt)
    user_tokens = estimate_tokens(user_prompt)
    knowledge_tokens = estimate_tokens(knowledge_context) if knowledge_context else 0
    completion_tokens = estimate_tokens(response_text)
    total_tokens = system_tokens + user_tokens + completion_tokens
    
    # Estimate cost
    pricing = PRICING.get(model, {"input": 3.0, "output": 15.0})
    cost = ((system_tokens + user_tokens) * pricing["input"] + 
            completion_tokens * pricing["output"]) / 1_000_000
    
    # Extract quality signals from parsed result
    confidence = None
    root_causes_count = None
    if parsed_result:
        confidence = parsed_result.get("confidence_score")
        root_causes = parsed_result.get("root_causes", [])
        root_causes_count = len(root_causes) if isinstance(root_causes, list) else None
    
    try:
        await db.insert("ai_engine_logs", {
            "user_id": user_id,
            "request_type": request_type,
            "analysis_id": analysis_id,
            "spec_id": spec_id,
            "model": model,
            "temperature": 0.3,
            "max_tokens": 4096,
            "system_prompt_tokens": system_tokens,
            "user_prompt_tokens": user_tokens,
            "knowledge_context_tokens": knowledge_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "had_knowledge_context": knowledge_tokens > 50,
            "knowledge_patterns_used": json.dumps(knowledge_patterns_used or []),
            "knowledge_confidence_level": knowledge_confidence,
            "latency_ms": latency_ms,
            "response_parsed_ok": not error and parsed_result is not None,
            "confidence_score": confidence,
            "root_causes_count": root_causes_count,
            "error": error,
            "error_type": error_type,
            "error_message": error_message[:500] if error_message else None,
            "retry_count": retry_count,
            "estimated_cost_usd": round(cost, 6),
        })
    except Exception as e:
        print(f"Failed to log AI call: {e}")  # Never break the analysis


# â”€â”€ Modify existing analyze_failure method â”€â”€

class AIEngine:
    async def analyze_failure(self, data: dict, user_id=None) -> dict:
        start_time = time.time()
        error_occurred = False
        error_type = None
        error_msg = None
        result = None
        knowledge_context = ""
        knowledge_patterns_used = []
        knowledge_confidence = None
        
        try:
            # Build knowledge context (from V1.1 Sprint 3)
            knowledge_context = await build_knowledge_context(data)
            
            # Track which patterns were used
            if "Substrate Pair" in knowledge_context:
                knowledge_patterns_used.append("substrate_pair")
            if "Failure Pattern" in knowledge_context:
                knowledge_patterns_used.append("failure_mode")
            if "Similar Resolved" in knowledge_context:
                knowledge_patterns_used.append("similar_cases")
            
            # Format prompt (existing code)
            base_prompt = FAILURE_ANALYSIS_USER_PROMPT.format(...)
            user_prompt = f"{knowledge_context}\n\n{base_prompt}"
            
            # Call Claude (existing code)
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=FAILURE_ANALYSIS_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}]
            )
            
            response_text = response.content[0].text
            
            # Parse JSON (existing code)
            result = self._parse_response(response_text)
            
        except json.JSONDecodeError as e:
            error_occurred = True
            error_type = "parse_error"
            error_msg = str(e)
            raise
        except TimeoutError:
            error_occurred = True
            error_type = "timeout"
            error_msg = "Claude API timeout after 30s"
            raise
        except Exception as e:
            error_occurred = True
            error_type = "api_error"
            error_msg = str(e)
            raise
        finally:
            # ALWAYS log, even on error
            latency = int((time.time() - start_time) * 1000)
            await log_ai_call(
                user_id=user_id,
                request_type="failure_analysis",
                model=self.model,
                system_prompt=FAILURE_ANALYSIS_SYSTEM_PROMPT,
                user_prompt=user_prompt if 'user_prompt' in dir() else "",
                knowledge_context=knowledge_context,
                knowledge_patterns_used=knowledge_patterns_used,
                knowledge_confidence=knowledge_confidence,
                response_text=response_text if 'response_text' in dir() else "",
                parsed_result=result,
                latency_ms=latency,
                error=error_occurred,
                error_type=error_type,
                error_message=error_msg,
            )
        
        result["processing_time_ms"] = int((time.time() - start_time) * 1000)
        result["ai_model_version"] = self.model
        return result
```

---

### 2.4 Backend: Daily metrics aggregation

**File:** `api/services/metrics_aggregator.py` (NEW FILE)

```python
"""
Pre-computes daily metrics from raw log tables into daily_metrics.
Run nightly via cron. Makes dashboard queries instant.
"""

from datetime import date, timedelta
from database import db


async def aggregate_daily_metrics(target_date: date = None):
    """Aggregate all metrics for a given date. Defaults to yesterday."""
    
    if target_date is None:
        target_date = date.today() - timedelta(days=1)
    
    day_start = f"{target_date}T00:00:00Z"
    day_end = f"{target_date}T23:59:59Z"
    
    # â”€â”€ Volume metrics â”€â”€
    volume = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(*) FROM failure_analyses 
             WHERE created_at BETWEEN '{day_start}' AND '{day_end}' AND status = 'completed') as analyses,
            (SELECT COUNT(*) FROM spec_requests 
             WHERE created_at BETWEEN '{day_start}' AND '{day_end}' AND status = 'completed') as specs,
            (SELECT COUNT(*) FROM users 
             WHERE created_at BETWEEN '{day_start}' AND '{day_end}') as signups,
            (SELECT COUNT(*) FROM analysis_feedback 
             WHERE created_at BETWEEN '{day_start}' AND '{day_end}') as feedback
    """)
    
    # â”€â”€ Engagement metrics â”€â”€
    engagement = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(DISTINCT user_id) FROM failure_analyses 
             WHERE created_at BETWEEN '{day_start}' AND '{day_end}') +
            (SELECT COUNT(DISTINCT user_id) FROM spec_requests 
             WHERE created_at BETWEEN '{day_start}' AND '{day_end}') as active_users,
            (SELECT COUNT(DISTINCT fa.user_id) FROM failure_analyses fa
             WHERE fa.created_at BETWEEN '{day_start}' AND '{day_end}'
             AND EXISTS (
                SELECT 1 FROM failure_analyses fa2 
                WHERE fa2.user_id = fa.user_id 
                AND fa2.created_at < '{day_start}'
             )) as returning_users
    """)
    
    # â”€â”€ Feedback rate â”€â”€
    feedback_eligible = await db.fetch_one(f"""
        SELECT COUNT(*) as cnt FROM failure_analyses
        WHERE status = 'completed'
        AND created_at BETWEEN ('{day_start}'::timestamptz - INTERVAL '8 days') 
                           AND ('{day_start}'::timestamptz - INTERVAL '6 days')
    """)
    feedback_received = await db.fetch_one(f"""
        SELECT COUNT(*) as cnt FROM analysis_feedback
        WHERE created_at BETWEEN '{day_start}' AND '{day_end}'
    """)
    feedback_rate = (
        feedback_received['cnt'] / feedback_eligible['cnt'] 
        if feedback_eligible['cnt'] > 0 else None
    )
    
    # â”€â”€ AI engine metrics â”€â”€
    ai_metrics = await db.fetch_one(f"""
        SELECT
            AVG(latency_ms) as avg_latency,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
            PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency,
            AVG(CASE WHEN error THEN 1.0 ELSE 0.0 END) as error_rate,
            AVG(confidence_score) as avg_confidence,
            SUM(total_tokens) as total_tokens,
            SUM(estimated_cost_usd) as total_cost,
            COUNT(*) FILTER (WHERE had_knowledge_context) as with_knowledge,
            COUNT(*) as total_calls
        FROM ai_engine_logs
        WHERE created_at BETWEEN '{day_start}' AND '{day_end}'
    """)
    
    knowledge_coverage = (
        ai_metrics['with_knowledge'] / ai_metrics['total_calls']
        if ai_metrics['total_calls'] and ai_metrics['total_calls'] > 0 else None
    )
    
    # â”€â”€ Conversion metrics â”€â”€
    conversions = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(*) FROM subscriptions 
             WHERE plan = 'pro' AND created_at BETWEEN '{day_start}' AND '{day_end}') as pro_conversions,
            (SELECT COUNT(*) FROM usage_logs 
             WHERE action = 'pdf_downloaded' AND created_at BETWEEN '{day_start}' AND '{day_end}') as pdf_exports,
            (SELECT COUNT(*) FROM expert_reviews 
             WHERE created_at BETWEEN '{day_start}' AND '{day_end}') as expert_requests
    """)
    
    # â”€â”€ Resolution metrics â”€â”€
    resolution = await db.fetch_one(f"""
        SELECT
            COUNT(*) FILTER (WHERE outcome IN ('resolved', 'partially_resolved')) as resolved,
            COUNT(*) FILTER (WHERE outcome = 'not_resolved') as not_resolved,
            CASE WHEN COUNT(*) FILTER (WHERE outcome IS NOT NULL) > 0
                THEN COUNT(*) FILTER (WHERE outcome IN ('resolved', 'partially_resolved'))::real / 
                     COUNT(*) FILTER (WHERE outcome IS NOT NULL)
                ELSE NULL END as rate
        FROM analysis_feedback
        WHERE created_at BETWEEN '{day_start}' AND '{day_end}'
    """)
    
    # â”€â”€ Upsert â”€â”€
    await db.execute("""
        INSERT INTO daily_metrics (
            date, total_analyses, total_specs, total_signups, total_feedback,
            active_users, returning_users, feedback_rate,
            avg_latency_ms, p95_latency_ms, p99_latency_ms, ai_error_rate,
            avg_confidence, total_tokens_used, estimated_ai_cost_usd,
            analyses_with_knowledge, knowledge_coverage_rate,
            free_to_pro_conversions, pdf_exports, expert_review_requests,
            feedback_resolved, feedback_not_resolved, resolution_rate,
            updated_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21, $22, $23, NOW()
        )
        ON CONFLICT (date) DO UPDATE SET
            total_analyses = EXCLUDED.total_analyses,
            total_specs = EXCLUDED.total_specs,
            total_signups = EXCLUDED.total_signups,
            total_feedback = EXCLUDED.total_feedback,
            active_users = EXCLUDED.active_users,
            returning_users = EXCLUDED.returning_users,
            feedback_rate = EXCLUDED.feedback_rate,
            avg_latency_ms = EXCLUDED.avg_latency_ms,
            p95_latency_ms = EXCLUDED.p95_latency_ms,
            p99_latency_ms = EXCLUDED.p99_latency_ms,
            ai_error_rate = EXCLUDED.ai_error_rate,
            avg_confidence = EXCLUDED.avg_confidence,
            total_tokens_used = EXCLUDED.total_tokens_used,
            estimated_ai_cost_usd = EXCLUDED.estimated_ai_cost_usd,
            analyses_with_knowledge = EXCLUDED.analyses_with_knowledge,
            knowledge_coverage_rate = EXCLUDED.knowledge_coverage_rate,
            free_to_pro_conversions = EXCLUDED.free_to_pro_conversions,
            pdf_exports = EXCLUDED.pdf_exports,
            expert_review_requests = EXCLUDED.expert_review_requests,
            feedback_resolved = EXCLUDED.feedback_resolved,
            feedback_not_resolved = EXCLUDED.feedback_not_resolved,
            resolution_rate = EXCLUDED.resolution_rate,
            updated_at = NOW()
    """,
        target_date,
        volume['analyses'], volume['specs'], volume['signups'], volume['feedback'],
        engagement['active_users'], engagement['returning_users'], feedback_rate,
        int(ai_metrics['avg_latency']) if ai_metrics['avg_latency'] else None,
        int(ai_metrics['p95_latency']) if ai_metrics['p95_latency'] else None,
        int(ai_metrics['p99_latency']) if ai_metrics['p99_latency'] else None,
        float(ai_metrics['error_rate']) if ai_metrics['error_rate'] else None,
        float(ai_metrics['avg_confidence']) if ai_metrics['avg_confidence'] else None,
        int(ai_metrics['total_tokens']) if ai_metrics['total_tokens'] else 0,
        float(ai_metrics['total_cost']) if ai_metrics['total_cost'] else 0,
        ai_metrics['with_knowledge'] or 0,
        float(knowledge_coverage) if knowledge_coverage else None,
        conversions['pro_conversions'], conversions['pdf_exports'], conversions['expert_requests'],
        resolution['resolved'], resolution['not_resolved'],
        float(resolution['rate']) if resolution['rate'] else None,
    )
    
    return {"date": str(target_date), "status": "aggregated"}
```

Add to cron router (`api/routers/cron.py`):

```python
from services.metrics_aggregator import aggregate_daily_metrics

@router.post("/aggregate-metrics")
async def trigger_metrics(x_cron_secret: str = Header(...)):
    """Pre-compute daily metrics. Run at 1am daily."""
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(403, "Invalid cron secret")
    result = await aggregate_daily_metrics()
    return result
```

---

## PART 3: ADMIN DASHBOARD API

### 3.1 Comprehensive admin analytics endpoint

**File:** `api/routers/admin.py` (REPLACE the basic version from V1.1 Sprint 4)

```python
"""
Admin dashboard API â€” complete observability for Gravix.
All endpoints require admin role.
"""

from fastapi import APIRouter, Depends, Query
from datetime import date, timedelta
from typing import Optional

from auth.admin import require_admin, log_admin_action
from database import db
from models.user import User

router = APIRouter(prefix="/v1/admin", tags=["admin"])


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# OVERVIEW: Single endpoint for dashboard hero metrics
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@router.get("/overview")
async def get_overview(admin: User = Depends(require_admin)):
    """Top-level KPIs. Powers the dashboard header cards."""
    
    await log_admin_action(admin.id, "viewed_overview", "system")
    
    # Today's live numbers
    today = await db.fetch_one("""
        SELECT
            (SELECT COUNT(*) FROM failure_analyses WHERE created_at >= CURRENT_DATE AND status = 'completed') as analyses_today,
            (SELECT COUNT(*) FROM spec_requests WHERE created_at >= CURRENT_DATE AND status = 'completed') as specs_today,
            (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as signups_today,
            (SELECT COUNT(*) FROM analysis_feedback WHERE created_at >= CURRENT_DATE) as feedback_today
    """)
    
    # Totals (all time)
    totals = await db.fetch_one("""
        SELECT
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM users WHERE plan != 'free') as paying_users,
            (SELECT COUNT(*) FROM failure_analyses WHERE status = 'completed') as total_analyses,
            (SELECT COUNT(*) FROM spec_requests WHERE status = 'completed') as total_specs,
            (SELECT COUNT(*) FROM analysis_feedback) as total_feedback,
            (SELECT COUNT(*) FROM knowledge_patterns WHERE confidence_level IN ('medium', 'high')) as knowledge_patterns
    """)
    
    # MRR estimate
    mrr = await db.fetch_one("""
        SELECT
            COUNT(*) FILTER (WHERE plan = 'pro') * 49 +
            COUNT(*) FILTER (WHERE plan = 'team') * 149 as mrr
        FROM subscriptions WHERE status = 'active'
    """)
    
    # AI cost this month
    ai_cost = await db.fetch_one("""
        SELECT COALESCE(SUM(estimated_cost_usd), 0) as cost
        FROM ai_engine_logs
        WHERE created_at >= date_trunc('month', CURRENT_DATE)
    """)
    
    return {
        "today": today,
        "totals": totals,
        "mrr": mrr['mrr'] or 0,
        "ai_cost_this_month": float(ai_cost['cost']),
        "profit_margin": float(mrr['mrr'] or 0) - float(ai_cost['cost']),
    }


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# TRENDS: Time-series data for charts
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@router.get("/trends")
async def get_trends(
    days: int = Query(30, ge=7, le=90),
    admin: User = Depends(require_admin)
):
    """Daily metrics trend data for charts. Reads from pre-aggregated daily_metrics."""
    
    metrics = await db.fetch_all("""
        SELECT * FROM daily_metrics
        WHERE date >= CURRENT_DATE - $1::integer
        ORDER BY date ASC
    """, days)
    
    return {
        "period_days": days,
        "data": metrics,
    }


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# AI ENGINE: Performance and cost analysis
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@router.get("/ai-engine")
async def get_ai_engine_stats(
    days: int = Query(7, ge=1, le=90),
    admin: User = Depends(require_admin)
):
    """Detailed AI engine performance metrics."""
    
    await log_admin_action(admin.id, "viewed_ai_engine", "system")
    
    # Overall performance
    perf = await db.fetch_one(f"""
        SELECT
            COUNT(*) as total_calls,
            AVG(latency_ms) as avg_latency,
            PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) as p50_latency,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
            PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency,
            MIN(latency_ms) as min_latency,
            MAX(latency_ms) as max_latency,
            AVG(CASE WHEN error THEN 1.0 ELSE 0.0 END) * 100 as error_rate_pct,
            AVG(CASE WHEN response_parsed_ok THEN 1.0 ELSE 0.0 END) * 100 as parse_success_pct
        FROM ai_engine_logs
        WHERE created_at >= CURRENT_DATE - {days}
    """)
    
    # Token usage and cost
    tokens = await db.fetch_one(f"""
        SELECT
            SUM(total_tokens) as total_tokens,
            AVG(total_tokens) as avg_tokens_per_call,
            SUM(system_prompt_tokens) as system_tokens,
            SUM(user_prompt_tokens) as user_tokens,
            SUM(knowledge_context_tokens) as knowledge_tokens,
            SUM(completion_tokens) as completion_tokens,
            SUM(estimated_cost_usd) as total_cost,
            AVG(estimated_cost_usd) as avg_cost_per_call
        FROM ai_engine_logs
        WHERE created_at >= CURRENT_DATE - {days}
    """)
    
    # Knowledge injection stats
    knowledge = await db.fetch_one(f"""
        SELECT
            COUNT(*) FILTER (WHERE had_knowledge_context) as with_context,
            COUNT(*) as total,
            AVG(confidence_score) FILTER (WHERE had_knowledge_context) as avg_conf_with,
            AVG(confidence_score) FILTER (WHERE NOT had_knowledge_context) as avg_conf_without,
            AVG(latency_ms) FILTER (WHERE had_knowledge_context) as avg_latency_with,
            AVG(latency_ms) FILTER (WHERE NOT had_knowledge_context) as avg_latency_without
        FROM ai_engine_logs
        WHERE created_at >= CURRENT_DATE - {days}
        AND request_type = 'failure_analysis'
    """)
    
    # Error breakdown
    errors = await db.fetch_all(f"""
        SELECT error_type, COUNT(*) as count
        FROM ai_engine_logs
        WHERE error = TRUE AND created_at >= CURRENT_DATE - {days}
        GROUP BY error_type
        ORDER BY count DESC
    """)
    
    # Confidence distribution
    confidence_dist = await db.fetch_all(f"""
        SELECT
            CASE 
                WHEN confidence_score >= 0.9 THEN '90-100%'
                WHEN confidence_score >= 0.7 THEN '70-89%'
                WHEN confidence_score >= 0.5 THEN '50-69%'
                ELSE 'Below 50%'
            END as bucket,
            COUNT(*) as count
        FROM ai_engine_logs
        WHERE confidence_score IS NOT NULL
        AND created_at >= CURRENT_DATE - {days}
        GROUP BY bucket
        ORDER BY bucket
    """)
    
    # Daily latency trend
    latency_trend = await db.fetch_all(f"""
        SELECT
            DATE(created_at) as date,
            AVG(latency_ms) as avg,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95,
            COUNT(*) as calls
        FROM ai_engine_logs
        WHERE created_at >= CURRENT_DATE - {days}
        GROUP BY DATE(created_at)
        ORDER BY date
    """)
    
    return {
        "period_days": days,
        "performance": perf,
        "tokens": tokens,
        "knowledge_impact": {
            "calls_with_context": knowledge['with_context'],
            "calls_total": knowledge['total'],
            "coverage_rate": (knowledge['with_context'] / knowledge['total'] * 100) if knowledge['total'] else 0,
            "avg_confidence_with_knowledge": knowledge['avg_conf_with'],
            "avg_confidence_without_knowledge": knowledge['avg_conf_without'],
            "confidence_lift": (
                (knowledge['avg_conf_with'] - knowledge['avg_conf_without']) / knowledge['avg_conf_without'] * 100
                if knowledge['avg_conf_without'] and knowledge['avg_conf_with'] else None
            ),
            "avg_latency_with_knowledge": knowledge['avg_latency_with'],
            "avg_latency_without_knowledge": knowledge['avg_latency_without'],
        },
        "errors": errors,
        "confidence_distribution": confidence_dist,
        "latency_trend": latency_trend,
    }


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# ENGAGEMENT: User behavior and retention
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@router.get("/engagement")
async def get_engagement_stats(
    days: int = Query(30, ge=7, le=90),
    admin: User = Depends(require_admin)
):
    """User engagement and retention metrics."""
    
    # Cohort retention (simplified: what % of users from week N are still active)
    cohorts = await db.fetch_all(f"""
        WITH user_cohorts AS (
            SELECT 
                id as user_id,
                date_trunc('week', created_at)::date as cohort_week
            FROM users
            WHERE created_at >= CURRENT_DATE - {days}
        ),
        user_activity AS (
            SELECT DISTINCT user_id, date_trunc('week', created_at)::date as activity_week
            FROM failure_analyses
            WHERE created_at >= CURRENT_DATE - {days}
            UNION
            SELECT DISTINCT user_id, date_trunc('week', created_at)::date as activity_week
            FROM spec_requests
            WHERE created_at >= CURRENT_DATE - {days}
        )
        SELECT
            uc.cohort_week,
            COUNT(DISTINCT uc.user_id) as cohort_size,
            COUNT(DISTINCT CASE WHEN ua.activity_week = uc.cohort_week THEN uc.user_id END) as week_0,
            COUNT(DISTINCT CASE WHEN ua.activity_week = uc.cohort_week + 7 THEN uc.user_id END) as week_1,
            COUNT(DISTINCT CASE WHEN ua.activity_week = uc.cohort_week + 14 THEN uc.user_id END) as week_2,
            COUNT(DISTINCT CASE WHEN ua.activity_week = uc.cohort_week + 21 THEN uc.user_id END) as week_3
        FROM user_cohorts uc
        LEFT JOIN user_activity ua ON uc.user_id = ua.user_id
        GROUP BY uc.cohort_week
        ORDER BY uc.cohort_week
    """)
    
    # Feedback engagement funnel
    funnel = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(*) FROM failure_analyses 
             WHERE status = 'completed' AND created_at >= CURRENT_DATE - {days}) as analyses_completed,
            (SELECT COUNT(DISTINCT analysis_id) FROM analysis_feedback
             WHERE created_at >= CURRENT_DATE - {days}) as received_any_feedback,
            (SELECT COUNT(DISTINCT analysis_id) FROM analysis_feedback
             WHERE outcome IS NOT NULL AND created_at >= CURRENT_DATE - {days}) as received_outcome,
            (SELECT COUNT(DISTINCT analysis_id) FROM analysis_feedback
             WHERE what_worked IS NOT NULL AND created_at >= CURRENT_DATE - {days}) as received_rich_feedback
    """)
    
    # Top users by usage
    top_users = await db.fetch_all(f"""
        SELECT u.id, u.email, u.name, u.company, u.plan, u.created_at,
            (SELECT COUNT(*) FROM failure_analyses WHERE user_id = u.id) as total_analyses,
            (SELECT COUNT(*) FROM spec_requests WHERE user_id = u.id) as total_specs,
            (SELECT COUNT(*) FROM analysis_feedback WHERE user_id = u.id) as total_feedback,
            (SELECT MAX(created_at) FROM failure_analyses WHERE user_id = u.id) as last_analysis
        FROM users u
        ORDER BY total_analyses DESC
        LIMIT 20
    """)
    
    # Plan distribution
    plans = await db.fetch_all("""
        SELECT plan, COUNT(*) as count
        FROM users
        GROUP BY plan
        ORDER BY count DESC
    """)
    
    # Conversion funnel
    conversion = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - {days}) as signups,
            (SELECT COUNT(DISTINCT user_id) FROM failure_analyses 
             WHERE created_at >= CURRENT_DATE - {days}) as ran_analysis,
            (SELECT COUNT(DISTINCT user_id) FROM failure_analyses fa
             WHERE fa.created_at >= CURRENT_DATE - {days}
             AND (SELECT COUNT(*) FROM failure_analyses fa2 WHERE fa2.user_id = fa.user_id) >= 2
            ) as ran_multiple,
            (SELECT COUNT(*) FROM subscriptions 
             WHERE plan != 'free' AND created_at >= CURRENT_DATE - {days}) as converted_paid
    """)
    
    return {
        "period_days": days,
        "cohort_retention": cohorts,
        "feedback_funnel": funnel,
        "top_users": top_users,
        "plan_distribution": plans,
        "conversion_funnel": conversion,
    }


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# KNOWLEDGE: Data moat health
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@router.get("/knowledge")
async def get_knowledge_stats(admin: User = Depends(require_admin)):
    """Health of the knowledge/data moat."""
    
    # Pattern coverage summary
    coverage = await db.fetch_one("""
        SELECT
            COUNT(*) as total_patterns,
            COUNT(*) FILTER (WHERE confidence_level = 'high') as high_confidence,
            COUNT(*) FILTER (WHERE confidence_level = 'medium') as medium_confidence,
            COUNT(*) FILTER (WHERE confidence_level = 'low') as low_confidence,
            AVG(total_cases) as avg_cases_per_pattern,
            AVG(resolution_rate) FILTER (WHERE resolution_rate IS NOT NULL) as avg_resolution_rate,
            MAX(total_cases) as largest_pattern_size
        FROM knowledge_patterns
    """)
    
    # Top patterns by data density
    top_patterns = await db.fetch_all("""
        SELECT pattern_type, pattern_key, total_cases, cases_with_feedback,
               resolved_cases, resolution_rate, confidence_level, last_updated
        FROM knowledge_patterns
        ORDER BY total_cases DESC
        LIMIT 20
    """)
    
    # Patterns needing feedback (have cases but low feedback rate)
    needs_feedback = await db.fetch_all("""
        SELECT pattern_type, pattern_key, total_cases, cases_with_feedback,
               ROUND(cases_with_feedback::numeric / NULLIF(total_cases, 0) * 100) as feedback_pct
        FROM knowledge_patterns
        WHERE total_cases >= 5 AND cases_with_feedback < total_cases * 0.3
        ORDER BY total_cases DESC
        LIMIT 10
    """)
    
    # Calibration accuracy (does confirmed root cause match AI's top prediction?)
    calibration = await db.fetch_one("""
        SELECT
            COUNT(*) as total_with_feedback,
            COUNT(*) FILTER (WHERE root_cause_confirmed = 1) as ai_top_was_correct,
            COUNT(*) FILTER (WHERE root_cause_confirmed IN (1,2,3)) as ai_had_it_in_top_3,
            COUNT(*) FILTER (WHERE root_cause_confirmed = 0) as ai_completely_wrong
        FROM analysis_feedback
        WHERE root_cause_confirmed IS NOT NULL
    """)
    
    return {
        "coverage": coverage,
        "top_patterns": top_patterns,
        "needs_feedback": needs_feedback,
        "calibration": {
            **calibration,
            "top_1_accuracy": (
                calibration['ai_top_was_correct'] / calibration['total_with_feedback'] * 100
                if calibration['total_with_feedback'] > 0 else None
            ),
            "top_3_accuracy": (
                calibration['ai_had_it_in_top_3'] / calibration['total_with_feedback'] * 100
                if calibration['total_with_feedback'] > 0 else None
            ),
        },
    }


# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# SYSTEM: Technical health
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
@router.get("/system")
async def get_system_health(
    hours: int = Query(24, ge=1, le=168),
    admin: User = Depends(require_admin)
):
    """Technical system health metrics."""
    
    # API performance by endpoint
    endpoints = await db.fetch_all(f"""
        SELECT
            path,
            COUNT(*) as requests,
            AVG(latency_ms) as avg_latency,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
            COUNT(*) FILTER (WHERE status_code >= 400) as errors,
            ROUND(COUNT(*) FILTER (WHERE status_code >= 400)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as error_rate
        FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '{hours} hours'
        GROUP BY path
        ORDER BY requests DESC
    """)
    
    # Error log (recent)
    recent_errors = await db.fetch_all(f"""
        SELECT path, status_code, error_code, error_message, latency_ms, user_id, created_at
        FROM api_request_logs
        WHERE status_code >= 400
        AND created_at >= NOW() - INTERVAL '{hours} hours'
        ORDER BY created_at DESC
        LIMIT 50
    """)
    
    # AI errors (recent)
    ai_errors = await db.fetch_all(f"""
        SELECT request_type, error_type, error_message, latency_ms, user_id, created_at
        FROM ai_engine_logs
        WHERE error = TRUE
        AND created_at >= NOW() - INTERVAL '{hours} hours'
        ORDER BY created_at DESC
        LIMIT 20
    """)
    
    # Hourly request volume (for traffic pattern chart)
    hourly = await db.fetch_all(f"""
        SELECT
            date_trunc('hour', created_at) as hour,
            COUNT(*) as requests,
            AVG(latency_ms) as avg_latency,
            COUNT(*) FILTER (WHERE status_code >= 500) as server_errors
        FROM api_request_logs
        WHERE created_at >= NOW() - INTERVAL '{hours} hours'
        GROUP BY hour
        ORDER BY hour
    """)
    
    # Database size estimate
    db_size = await db.fetch_one("""
        SELECT
            pg_size_pretty(pg_database_size(current_database())) as total_size,
            (SELECT COUNT(*) FROM failure_analyses) as analyses_rows,
            (SELECT COUNT(*) FROM ai_engine_logs) as ai_log_rows,
            (SELECT COUNT(*) FROM api_request_logs) as api_log_rows
    """)
    
    return {
        "period_hours": hours,
        "endpoints": endpoints,
        "recent_errors": recent_errors,
        "ai_errors": ai_errors,
        "hourly_traffic": hourly,
        "database": db_size,
    }
```

---

## PART 4: ADMIN DASHBOARD FRONTEND

### 4.1 Route structure

```
frontend/app/(admin)/
â”œâ”€â”€ admin/
â”‚   â”œâ”€â”€ layout.tsx          # Admin layout with sidebar nav + role gate
â”‚   â”œâ”€â”€ page.tsx            # Overview dashboard (hero metrics + trend charts)
â”‚   â”œâ”€â”€ ai-engine/
â”‚   â”‚   â””â”€â”€ page.tsx        # AI performance, cost, knowledge impact
â”‚   â”œâ”€â”€ engagement/
â”‚   â”‚   â””â”€â”€ page.tsx        # Users, retention, conversion funnel
â”‚   â”œâ”€â”€ knowledge/
â”‚   â”‚   â””â”€â”€ page.tsx        # Data moat health, calibration accuracy
â”‚   â””â”€â”€ system/
â”‚       â””â”€â”€ page.tsx        # API health, errors, traffic patterns
```

### 4.2 Admin layout with role gate

**File:** `frontend/app/(admin)/admin/layout.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Brain, Users, Database, Server, 
  ChevronRight 
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/ai-engine", label: "AI Engine", icon: Brain },
  { href: "/admin/engagement", label: "Engagement", icon: Users },
  { href: "/admin/knowledge", label: "Knowledge Moat", icon: Database },
  { href: "/admin/system", label: "System Health", icon: Server },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/users/me")
      .then(res => res.json())
      .then(user => {
        if (user.role !== "admin") {
          router.push("/dashboard");
        } else {
          setAuthorized(true);
        }
        setLoading(false);
      })
      .catch(() => { router.push("/login"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-12 text-center text-secondary">Loading...</div>;
  if (!authorized) return null;

  return (
    <div className="flex min-h-screen bg-brand-900">
      {/* Sidebar */}
      <aside className="w-56 border-r border-brand-700 bg-brand-800 flex flex-col">
        <div className="p-4 border-b border-brand-700">
          <span className="text-xs font-mono uppercase tracking-wider text-accent-500">
            Gravix Admin
          </span>
        </div>
        <nav className="flex-1 py-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary 
                         hover:text-primary hover:bg-brand-700 transition-colors"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

### 4.3 Overview dashboard page

**File:** `frontend/app/(admin)/admin/page.tsx`

The overview page renders 4 sections:

**Section 1: Hero metric cards (top row, 6 cards)**

| Card | Value Source | Label |
|------|-------------|-------|
| Analyses Today | `overview.today.analyses_today` | with sparkline from `trends` |
| Active Users (30d) | `overview.totals.total_users` | vs last period |
| Paying Users | `overview.totals.paying_users` | MRR below |
| Feedback Rate | `engagement.feedback_funnel` | % with sparkline |
| Knowledge Coverage | `overview.totals.knowledge_patterns` | patterns with medium/high confidence |
| AI Cost (MTD) | `overview.ai_cost_this_month` | vs MRR for margin |

**Section 2: 30-day trend charts (2x2 grid)**

| Chart | Type | Data Source |
|-------|------|-------------|
| Daily analyses + specs volume | Stacked bar | `trends.data[].total_analyses, total_specs` |
| AI latency (avg + p95) | Dual line | `trends.data[].avg_latency_ms, p95_latency_ms` |
| Knowledge coverage % | Line with area fill | `trends.data[].knowledge_coverage_rate` |
| Resolution rate | Line | `trends.data[].resolution_rate` |

**Section 3: Conversion funnel (horizontal)**

```
Signups â†’ Ran Analysis â†’ Ran 2+ â†’ Converted to Pro
  100        67 (67%)      23 (34%)     8 (35%)
```

**Section 4: Recent activity feed**

Last 20 events from `usage_logs` â€” "User X ran analysis", "User Y submitted feedback (resolved)", "User Z exported PDF".

### 4.4 AI Engine page

Renders data from `/admin/ai-engine`:

**Section 1: Performance cards**

| Card | Value |
|------|-------|
| Avg Latency | `performance.avg_latency` with color (green <5s, yellow 5-10s, red >10s) |
| P95 Latency | `performance.p95_latency` |
| Error Rate | `performance.error_rate_pct` % |
| Parse Success | `performance.parse_success_pct` % |

**Section 2: Knowledge impact comparison**

This is the most important chart on this page. Side-by-side comparison:

```
                    With Knowledge    Without Knowledge    Lift
Avg Confidence:     0.83              0.71                +17%
Avg Latency:        4,200ms           3,100ms             +35% (expected: more tokens)
```

This proves the knowledge layer is improving quality. When "confidence lift" is positive, the moat is working.

**Section 3: Token usage and cost**

| Metric | Value |
|--------|-------|
| Total tokens (7d) | formatted with commas |
| Avg tokens/call | breakdown: system / user / knowledge / completion |
| Cost (7d) | $ amount |
| Cost per analysis | $ amount |
| Knowledge tokens % | what % of input tokens are knowledge context |

**Section 4: Confidence distribution** (bar chart)

Buckets: 90-100%, 70-89%, 50-69%, Below 50%

**Section 5: Error breakdown** (table)

| Error Type | Count | % of Errors |
|------------|-------|-------------|
| parse_error | 3 | 60% |
| timeout | 1 | 20% |
| api_error | 1 | 20% |

**Section 6: Latency trend** (line chart, 7 days)

Avg and P95 lines, daily granularity.

### 4.5 Engagement page

Renders data from `/admin/engagement`:

**Section 1: Feedback funnel** (horizontal bar with percentages)

```
Analyses completed:      847  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ  100%
Received any feedback:   234  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ                            28%
Received outcome:        189  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆ                               22%
Received rich feedback:   67  â–ˆâ–ˆâ–ˆâ–ˆ                                       8%
```

This tells you where feedback drops off and what to optimize (email copy, in-app prompting, etc.).

**Section 2: Cohort retention** (heatmap table)

```
Cohort      Size    Week 0    Week 1    Week 2    Week 3
Jan 27      45      100%      42%       28%       22%
Feb 3       52      100%      38%       24%       -
Feb 10      31      100%      -         -         -
```

**Section 3: Conversion funnel** (vertical funnel visualization)

Signups â†’ First analysis â†’ Repeat usage â†’ Paid conversion

**Section 4: Top users** (table)

| User | Company | Plan | Analyses | Specs | Feedback | Last Active |
|------|---------|------|----------|-------|----------|-------------|

**Section 5: Plan distribution** (donut chart)

### 4.6 Knowledge Moat page

Renders data from `/admin/knowledge`:

**Section 1: Calibration accuracy** (THE key quality metric)

```
AI Top-1 Accuracy:    64%   (AI's #1 root cause was confirmed correct)
AI Top-3 Accuracy:    89%   (correct cause was in AI's top 3)
Complete Miss Rate:   11%   (AI had none of the correct causes)
```

This is your quality report card. Track this weekly. If top-1 accuracy improves over time, the knowledge injection is working.

**Section 2: Coverage summary cards**

| Card | Value |
|------|-------|
| Total Patterns | `coverage.total_patterns` |
| High Confidence | `coverage.high_confidence` (â‰¥20 cases, â‰¥10 feedback) |
| Medium Confidence | `coverage.medium_confidence` |
| Low Confidence | `coverage.low_confidence` |
| Avg Cases/Pattern | `coverage.avg_cases_per_pattern` |
| Avg Resolution Rate | `coverage.avg_resolution_rate` % |

**Section 3: Top patterns** (sortable table)

| Pattern | Type | Cases | Feedback | Resolution Rate | Confidence | Last Updated |
|---------|------|-------|----------|-----------------|------------|--------------|
| aluminum::abs | substrate_pair | 23 | 14 | 86% | high | 2h ago |
| cyanoacrylate::debonding | failure_mode | 47 | 28 | 79% | high | 2h ago |

**Section 4: Patterns needing feedback** (action items)

These are patterns with enough cases but low feedback rate. This tells you where to focus follow-up email optimization or in-app prompting.

### 4.7 System Health page

Renders data from `/admin/system`:

**Section 1: Endpoint performance** (table)

| Endpoint | Requests | Avg Latency | P95 | Errors | Error Rate |
|----------|----------|-------------|-----|--------|------------|
| POST /v1/analyze | 45 | 5,200ms | 8,100ms | 2 | 4.4% |
| POST /v1/specify | 23 | 4,800ms | 7,500ms | 0 | 0% |
| GET /v1/cases | 120 | 45ms | 120ms | 0 | 0% |

**Section 2: Hourly traffic** (bar chart, last 24h)

**Section 3: Recent errors** (scrollable log)

Each error row: timestamp, endpoint, status code, error message, user ID.

**Section 4: Database health**

Total size, row counts for main tables, and growth rate estimate.

---

## PART 5: CRON SCHEDULE

After full deployment, configure these cron jobs on Railway/Fly.io or an external cron service:

| Job | Endpoint | Schedule | Purpose |
|-----|----------|----------|---------|
| Follow-up emails | `POST /v1/cron/send-followups` | Daily 9am UTC | Send 7-day feedback emails |
| Knowledge aggregation | `POST /v1/cron/aggregate-knowledge` | Daily 2am UTC | Rebuild knowledge patterns |
| Metrics aggregation | `POST /v1/cron/aggregate-metrics` | Daily 1am UTC | Pre-compute daily dashboard metrics |

All cron endpoints require `X-Cron-Secret` header.

---

## PART 6: ALERTS (Phase 2, Optional)

Once the observability system is running, add threshold-based alerts. These can be simple: the daily metrics cron checks thresholds and sends you a Resend email if breached.

| Alert | Condition | Action |
|-------|-----------|--------|
| High AI error rate | >5% in last 24h | Email admin |
| Latency spike | P95 >15s for >1h | Email admin |
| Zero analyses | No new analyses in 24h | Email admin (traffic died?) |
| Feedback rate drop | <10% for a week | Email admin (follow-up emails broken?) |
| Knowledge regression | Calibration top-1 drops below 50% | Email admin (prompts need tuning) |
| Cost spike | Daily AI cost >$50 | Email admin |
| New paying customer | Subscription created | Email admin (celebrate) |

---

## DEPLOYMENT SEQUENCE

```
Day 1:  Run SQL migrations 004, 005
Day 1:  Deploy admin auth dependency
Day 1:  Deploy request logger middleware
Day 1:  Verify: make API calls, check api_request_logs populating

Day 2:  Deploy AI engine instrumentation (modified ai_engine.py)
Day 2:  Verify: run test analysis, check ai_engine_logs

Day 3:  Deploy metrics_aggregator.py + cron endpoint
Day 3:  Deploy admin router (all 5 dashboard endpoints)
Day 3:  Run manual metrics aggregation for historical dates
Day 3:  Verify: hit /admin/overview, /admin/ai-engine etc. with admin token

Day 4:  Deploy admin frontend (layout + all 5 pages)
Day 4:  Verify: log in as admin, navigate all pages, check data displays

Day 5:  Configure cron jobs (3 daily jobs)
Day 5:  End-to-end verification of full observability pipeline
Day 5:  Set yourself as admin in production DB
```

---

## KEY METRICS TO WATCH WEEKLY

As the operator, these are the numbers that tell you if Gravix is winning:

| Metric | Why It Matters | Healthy Range |
|--------|---------------|---------------|
| **Knowledge coverage %** | Are incoming analyses getting empirical context? | >30% by month 6 |
| **Calibration top-1 accuracy** | Is the AI getting the right answer? | >60% |
| **Confidence lift** | Does knowledge injection improve quality? | >10% lift |
| **Feedback rate** | Are users contributing back? | >20% |
| **Resolution rate** | Are users actually fixing their problems? | >70% |
| **Cost per analysis** | Is the economics sustainable? | <$0.15 |
| **Returning user %** | Are people coming back? | >25% weekly |
| **Freeâ†’Pro conversion** | Is the business model working? | >5% of active free users |

---

**END OF OBSERVABILITY & ADMIN SPEC**

---

