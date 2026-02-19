# Feedback & Knowledge Layer — L2 Full Detail

> Extracted from gravix-final-prd.md Part II (V2 Technical Specification). Covers: database migrations, feedback system, knowledge aggregation, knowledge injection, case library, cross-linking, and frontend changes.

# PART II: V2 TECHNICAL SPECIFICATION

> **Source documents merged:** `gravix-v2-specification.md` (v2.0) + `gravix-moat-addendum.md` (absorbed into V2)
>
> The V2 spec already incorporates all changes from the Moat Addendum. This is the authoritative technical specification for the intelligence layer, observability, and admin system.

**Deployment:** Vercel (frontend) + Railway/Fly.io (backend) + Supabase (DB)  
**Total effort:** 6 sprints, ~15 days

---

# TABLE OF CONTENTS

1. [V2 Overview â€” What We're Building and Why](#1-v2-overview)
2. [Database Migrations](#2-database-migrations)
3. [Role System](#3-role-system)
4. [Feedback System](#4-feedback-system)
5. [Knowledge Aggregation Engine](#5-knowledge-aggregation-engine)
6. [Knowledge Injection Layer](#6-knowledge-injection-layer)
7. [AI Engine Instrumentation](#7-ai-engine-instrumentation)
8. [Observability Infrastructure](#8-observability-infrastructure)
9. [Admin Dashboard API](#9-admin-dashboard-api)
10. [Admin Dashboard Frontend](#10-admin-dashboard-frontend)
11. [Case Library (MVP)](#11-case-library-mvp)
12. [Frontend Changes â€” User-Facing](#12-frontend-changes-user-facing)
13. [Cross-Linking Between Tools](#13-cross-linking-between-tools)
14. [Pricing Adjustment](#14-pricing-adjustment)
15. [Cron Jobs & Background Services](#15-cron-jobs--background-services)
16. [Sprint Plan & Deployment Sequence](#16-sprint-plan--deployment-sequence)
17. [Verification Checklist](#17-verification-checklist)
18. [Key Metrics to Track](#18-key-metrics-to-track)

---

# 1. V2 OVERVIEW

## 1.1 The Problem with V1

V1 builds a solid tool. But every analysis is fire-and-forget. Analysis #1,000 produces the same quality output as analysis #1 because the AI prompt never changes based on accumulated data. This makes Gravix a wrapper around Claude that any engineer could replicate by typing into ChatGPT directly.

## 1.2 What V2 Adds

V2 retrofits five capabilities onto the live V1 system:

| Capability | Purpose | Moat Impact |
|-----------|---------|-------------|
| **Feedback system** | Capture whether fixes worked | Data collection engine |
| **Knowledge aggregation** | Compute patterns from confirmed outcomes | Proprietary intelligence |
| **Knowledge injection** | Augment AI prompts with empirical data | Categorical differentiator vs vanilla AI |
| **Observability** | Log every AI call, API request, user action | Operational visibility |
| **Admin dashboard** | Visualize system health, engagement, AI performance, data moat growth | Decision-making for the operator |

## 1.3 The Self-Learning Flywheel

```
Engineer submits failure analysis
        â†“
AI generates root causes (with knowledge context if available)
        â†“
Engineer tries the recommended fix
        â†“
Engineer reports outcome (feedback)
        â†“
Aggregator computes patterns from all feedback
        â†“
Next similar analysis gets augmented prompt with empirical data
        â†“
Better results â†’ more trust â†’ more users â†’ more data â†’ better results
```

## 1.4 Critical Rules for Live System Migration

1. **Never DROP columns or tables.** Only ADD. Existing data must survive.
2. **All new columns must be NULLABLE or have DEFAULTs.** Existing rows lack new data.
3. **Run migrations in Supabase SQL editor.** Test on branch DB first if Supabase Pro.
4. **Deploy backend before frontend.** New API endpoints must exist before UI calls them.
5. **Don't modify AI prompts until knowledge layer has data.** Run both paths in parallel.

## 1.5 Positioning Shift

**V1:** "AI-powered adhesive specification and failure analysis"

**V2:** "The industrial adhesive intelligence platform. Combining AI expertise with empirical data from hundreds of real-world production cases. Every analysis makes the next one smarter."

---

# 2. DATABASE MIGRATIONS

Run these in order in Supabase SQL editor. Every migration is additive â€” no destructive changes.

## 2.1 Migration 001: Structured Fields on Existing Tables

```sql
-- ============================================
-- MIGRATION 001: Add structured fields to failure_analyses
-- Safe: all columns NULLABLE, no existing data affected
-- ============================================

-- Normalized substrate identifiers (populated by backend on insert)
ALTER TABLE failure_analyses ADD COLUMN IF NOT EXISTS substrate_a_normalized TEXT;
ALTER TABLE failure_analyses ADD COLUMN IF NOT EXISTS substrate_b_normalized TEXT;

-- Structured root cause classification (populated by backend after AI analysis)
ALTER TABLE failure_analyses ADD COLUMN IF NOT EXISTS root_cause_category TEXT 
    CHECK (root_cause_category IN (
        'surface_preparation', 'material_compatibility', 'application_process',
        'cure_conditions', 'environmental', 'design', 'unknown'
    ));

-- Industry context (captured in form)
ALTER TABLE failure_analyses ADD COLUMN IF NOT EXISTS industry TEXT 
    CHECK (industry IN (
        'automotive', 'aerospace', 'electronics', 'medical_device',
        'consumer_products', 'construction', 'general_manufacturing', 'other'
    ));

-- Severity indicator (captured in form)
ALTER TABLE failure_analyses ADD COLUMN IF NOT EXISTS production_impact TEXT 
    CHECK (production_impact IN (
        'line_down', 'reduced_output', 'quality_hold', 'field_failure', 
        'prototype_only', 'none'
    ));

-- Cross-linking: specs originated from failure analysis
ALTER TABLE spec_requests ADD COLUMN IF NOT EXISTS source_analysis_id UUID 
    REFERENCES failure_analyses(id) ON DELETE SET NULL;

-- Role system
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT 
    DEFAULT 'user' CHECK (role IN ('user', 'admin', 'reviewer'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fa_substrates_norm ON failure_analyses(substrate_a_normalized, substrate_b_normalized);
CREATE INDEX IF NOT EXISTS idx_fa_root_cause_cat ON failure_analyses(root_cause_category);
CREATE INDEX IF NOT EXISTS idx_fa_industry ON failure_analyses(industry);
CREATE INDEX IF NOT EXISTS idx_sr_source_analysis ON spec_requests(source_analysis_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Set admin (replace with actual email)
-- UPDATE users SET role = 'admin' WHERE email = 'YOUR_EMAIL_HERE';
```

## 2.2 Migration 002: Feedback & Knowledge Tables

```sql
-- ============================================
-- MIGRATION 002: Analysis Feedback Table (THE MOAT)
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES failure_analyses(id) ON DELETE SET NULL,
    spec_id UUID REFERENCES spec_requests(id) ON DELETE SET NULL,
    
    -- Core feedback (quick capture)
    was_helpful BOOLEAN,
    root_cause_confirmed INTEGER,           -- Which ranked root cause was correct (1,2,3, or 0=none)
    recommendation_implemented TEXT[],
    outcome TEXT CHECK (outcome IN (
        'resolved', 'partially_resolved', 'not_resolved', 
        'different_cause', 'still_testing', 'abandoned'
    )),
    
    -- Rich feedback (optional, high value)
    actual_root_cause TEXT,
    what_worked TEXT,
    what_didnt_work TEXT,
    time_to_resolution TEXT,
    estimated_cost_saved DECIMAL(12,2),
    
    -- Corrected data
    substrate_a_actual TEXT,
    substrate_b_actual TEXT,
    surface_prep_actual TEXT,
    adhesive_used_actual TEXT,
    
    -- Metadata
    feedback_source TEXT DEFAULT 'in_app' CHECK (feedback_source IN ('in_app', 'email', 'followup')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT feedback_reference CHECK (
        (analysis_id IS NOT NULL AND spec_id IS NULL) OR
        (analysis_id IS NULL AND spec_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_feedback_analysis ON analysis_feedback(analysis_id);
CREATE INDEX IF NOT EXISTS idx_feedback_spec ON analysis_feedback(spec_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON analysis_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_outcome ON analysis_feedback(outcome);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON analysis_feedback(created_at DESC);

ALTER TABLE analysis_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own feedback" ON analysis_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own feedback" ON analysis_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feedback" ON analysis_feedback FOR UPDATE USING (auth.uid() = user_id);


-- ============================================
-- Knowledge Patterns Table (Aggregated Intelligence)
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    pattern_type TEXT NOT NULL CHECK (pattern_type IN (
        'substrate_pair', 'failure_mode', 'adhesive_type', 
        'environment', 'industry', 'substrate_adhesive'
    )),
    pattern_key TEXT NOT NULL,

    total_cases INTEGER DEFAULT 0,
    cases_with_feedback INTEGER DEFAULT 0,
    resolved_cases INTEGER DEFAULT 0,
    resolution_rate REAL,
    
    top_root_causes JSONB DEFAULT '[]'::jsonb,
    effective_solutions JSONB DEFAULT '[]'::jsonb,
    ineffective_solutions JSONB DEFAULT '[]'::jsonb,
    common_specs JSONB DEFAULT '[]'::jsonb,
    
    confidence_level TEXT DEFAULT 'low' CHECK (confidence_level IN ('low', 'medium', 'high')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(pattern_type, pattern_key)
);

CREATE INDEX IF NOT EXISTS idx_kp_lookup ON knowledge_patterns(pattern_type, pattern_key);
CREATE INDEX IF NOT EXISTS idx_kp_confidence ON knowledge_patterns(confidence_level);

ALTER TABLE knowledge_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read patterns" ON knowledge_patterns
    FOR SELECT USING (auth.role() = 'authenticated');
```

## 2.3 Migration 003: Observability Tables

```sql
-- ============================================
-- MIGRATION 003: AI Engine Performance Logs
-- ============================================
CREATE TABLE IF NOT EXISTS ai_engine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request context
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('failure_analysis', 'spec_request', 'case_generation', 'other')),
    analysis_id UUID,
    spec_id UUID,
    
    -- Model details
    model TEXT NOT NULL,
    temperature REAL,
    max_tokens INTEGER,
    
    -- Token metrics
    system_prompt_tokens INTEGER,
    user_prompt_tokens INTEGER,
    knowledge_context_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    
    -- Knowledge injection details
    had_knowledge_context BOOLEAN DEFAULT FALSE,
    knowledge_patterns_used JSONB,
    knowledge_confidence_level TEXT,
    
    -- Performance
    latency_ms INTEGER NOT NULL,
    time_to_first_token_ms INTEGER,
    
    -- Quality signals
    response_parsed_ok BOOLEAN DEFAULT TRUE,
    confidence_score REAL,
    root_causes_count INTEGER,
    
    -- Errors
    error BOOLEAN DEFAULT FALSE,
    error_type TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Cost
    estimated_cost_usd DECIMAL(10, 6),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON ai_engine_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_type ON ai_engine_logs(request_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_error ON ai_engine_logs(error) WHERE error = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_engine_logs(user_id);

ALTER TABLE ai_engine_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON ai_engine_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================
-- API Request Logs
-- ============================================
CREATE TABLE IF NOT EXISTS api_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    method TEXT NOT NULL,
    path TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    
    user_id UUID,
    user_plan TEXT,
    ip_address INET,
    user_agent TEXT,
    
    error_code TEXT,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_created ON api_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_path ON api_request_logs(path);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_request_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON api_request_logs(user_id);

ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON api_request_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================
-- Admin Audit Log
-- ============================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log(created_at DESC);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON admin_audit_log FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);


-- ============================================
-- Daily Metrics (Pre-aggregated for dashboard)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    
    -- Volume
    total_analyses INTEGER DEFAULT 0,
    total_specs INTEGER DEFAULT 0,
    total_signups INTEGER DEFAULT 0,
    total_feedback INTEGER DEFAULT 0,
    
    -- Engagement
    active_users INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    feedback_rate REAL,
    
    -- AI engine
    avg_latency_ms INTEGER,
    p95_latency_ms INTEGER,
    p99_latency_ms INTEGER,
    ai_error_rate REAL,
    avg_confidence REAL,
    total_tokens_used INTEGER,
    estimated_ai_cost_usd DECIMAL(10, 4),
    
    -- Knowledge
    analyses_with_knowledge INTEGER DEFAULT 0,
    knowledge_coverage_rate REAL,
    
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

## 2.4 Migration 004: Seed Case Library

```sql
INSERT INTO case_library (material_category, material_subcategory, failure_mode, root_cause, 
    title, summary, solution, lessons_learned, industry, slug, meta_description, is_featured) 
VALUES

('adhesive', 'cyanoacrylate', 'debonding', 'Inadequate surface preparation on aluminum',
 'Cyanoacrylate Debonding from Aluminum: Surface Prep Root Cause',
 'Cyanoacrylate bond to aluminum 6061 failed after 2 weeks in automotive application. Clean adhesive failure on the aluminum side indicated surface preparation was insufficient.',
 'Replaced IPA-only cleaning with 180-grit abrasion followed by acetone degrease. Added water break test verification step before bonding. Bond life exceeded 6 months with no failures.',
 'IPA wipe alone is insufficient for aluminum bonding. The native oxide layer must be mechanically disrupted through abrasion. Always verify surface energy with a water break test before applying adhesive.',
 'automotive',
 'cyanoacrylate-debonding-aluminum-surface-prep',
 'Root cause analysis of cyanoacrylate debonding from aluminum substrates. Surface preparation failure and resolution.',
 TRUE),

('adhesive', 'epoxy', 'cracking', 'Thermal cycling stress exceeding adhesive flexibility',
 'Epoxy Cracking Under Thermal Cycling: CTE Mismatch Between Steel and Polycarbonate',
 'Two-part structural epoxy cracked after 3 months bonding stainless steel to polycarbonate in an outdoor electronics enclosure. Temperature range was -20C to 65C.',
 'Switched from rigid structural epoxy to a toughened epoxy with higher elongation (>5%). Added silicone conformal coating over the bond joint to reduce thermal shock. No failures after 12 months.',
 'Rigid epoxies cannot accommodate the CTE mismatch between metals and thermoplastics under wide temperature swings. Always calculate differential expansion and select an adhesive with sufficient elongation to absorb it.',
 'electronics',
 'epoxy-cracking-thermal-cycling-steel-polycarbonate',
 'Epoxy cracking failure analysis due to thermal cycling and CTE mismatch between steel and polycarbonate substrates.',
 TRUE),

('adhesive', 'cyanoacrylate', 'blooming', 'Excess CA monomer outgassing in high humidity',
 'White Residue (Blooming) Around Cyanoacrylate Bonds in Medical Device Assembly',
 'White haze appeared around CA bonds on polycarbonate medical device housing within 24 hours of assembly. Clean room had 65% RH.',
 'Switched to low-bloom, low-odor CA grade. Reduced humidity in assembly area to 45% RH. Added 10-minute post-cure at 60C to accelerate full polymerization before packaging.',
 'Standard CA grades release volatile monomer that polymerizes on nearby surfaces in humid conditions. Medical and optical applications always require low-bloom grades.',
 'medical_device',
 'cyanoacrylate-blooming-white-residue-medical-device',
 'Analysis of cyanoacrylate blooming (white residue) on medical device polycarbonate housings.',
 TRUE),

('adhesive', 'polyurethane', 'debonding', 'Moisture on substrate during application',
 'Polyurethane Adhesive Foaming and Debonding on Concrete Floor Installation',
 'Two-part PU adhesive foamed and debonded during commercial flooring installation. Bubbles visible in bondline. Recent rain had left moisture in concrete.',
 'Implemented moisture testing with calcium chloride method before application. Required <3 lbs/1000 sq ft moisture emission rate. Applied moisture barrier primer on marginal slabs.',
 'Polyurethane isocyanates react with water to produce CO2 gas, causing foaming. Always test concrete moisture before PU adhesive application.',
 'construction',
 'polyurethane-foaming-debonding-concrete-moisture',
 'Polyurethane adhesive failure on concrete substrates due to moisture-induced foaming.',
 TRUE),

('adhesive', 'acrylic', 'debonding', 'Polypropylene surface energy too low without treatment',
 'Structural Acrylic Failed to Bond Polypropylene Automotive Trim',
 'MMA adhesive showed zero adhesion to PP trim piece despite successful bonding to the metal bracket side. Adhesive did not wet the PP surface.',
 'Added flame treatment station to prep line (3-second pass at 6 inches). Alternatively, PP-grade primer achieved >800 PSI lap shear.',
 'Polypropylene has surface energy of ~30 dynes/cm, below the minimum for most adhesives. Surface activation via flame, plasma, corona, or primer is mandatory.',
 'automotive',
 'structural-acrylic-debonding-polypropylene-surface-energy',
 'Structural acrylic failure on polypropylene due to low surface energy.',
 TRUE),

('adhesive', 'silicone', 'debonding', 'Wrong cure chemistry for glass substrate',
 'RTV Silicone Debonding from Tempered Glass in Outdoor LED Display',
 'Acetoxy-cure RTV silicone released from tempered glass panel after 6 months outdoor exposure. Adhesive failure on glass side.',
 'Switched to neutral-cure (oxime) silicone with manufacturer-specified glass primer. Applied primer with 15-minute flash-off. Bond survived 18-month accelerated weathering.',
 'Acetoxy silicones release acetic acid during cure which attacks glass adhesion over time. Neutral-cure silicones are required for long-term glass bonding. Primer is almost always required.',
 'electronics',
 'rtv-silicone-debonding-glass-primer-cure-type',
 'RTV silicone debonding from tempered glass. Acetoxy vs neutral cure selection and primer requirements.',
 TRUE);
```

---

# 3. ROLE SYSTEM

## 3.1 Backend: Admin Auth Dependency

**File:** `api/auth/admin.py` (NEW)

```python
from fastapi import Depends, HTTPException
from auth import get_current_user
from models.user import User
from database import db


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    user = await db.fetch_one("SELECT role FROM users WHERE id = $1", current_user.id)
    if not user or user['role'] != 'admin':
        raise HTTPException(403, "Admin access required")
    return current_user


async def log_admin_action(admin_id, action: str, resource_type: str = None, 
                           resource_id=None, metadata: dict = None):
    await db.insert("admin_audit_log", {
        "admin_user_id": admin_id,
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "metadata": metadata,
    })
```

---

# 4. FEEDBACK SYSTEM

## 4.1 Backend: Feedback API

**File:** `api/routers/feedback.py` (NEW)

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, validator
from typing import Optional, List
from uuid import UUID
from database import db
from auth import get_current_user
from models.user import User

router = APIRouter(prefix="/v1/feedback", tags=["feedback"])


class FeedbackCreate(BaseModel):
    analysis_id: Optional[UUID] = None
    spec_id: Optional[UUID] = None
    was_helpful: Optional[bool] = None
    root_cause_confirmed: Optional[int] = None
    outcome: Optional[str] = None
    recommendation_implemented: Optional[List[str]] = None
    actual_root_cause: Optional[str] = None
    what_worked: Optional[str] = None
    what_didnt_work: Optional[str] = None
    time_to_resolution: Optional[str] = None
    estimated_cost_saved: Optional[float] = None
    substrate_a_actual: Optional[str] = None
    substrate_b_actual: Optional[str] = None
    surface_prep_actual: Optional[str] = None
    adhesive_used_actual: Optional[str] = None
    feedback_source: str = "in_app"
    
    @validator('outcome')
    def validate_outcome(cls, v):
        valid = ['resolved', 'partially_resolved', 'not_resolved', 
                 'different_cause', 'still_testing', 'abandoned']
        if v and v not in valid:
            raise ValueError(f'outcome must be one of: {valid}')
        return v
    
    @validator('root_cause_confirmed')
    def validate_rank(cls, v):
        if v is not None and (v < 0 or v > 5):
            raise ValueError('root_cause_confirmed must be 0-5')
        return v


class FeedbackResponse(BaseModel):
    id: UUID
    message: str
    cases_improved: int = 0


@router.post("", response_model=FeedbackResponse, status_code=201)
async def create_feedback(data: FeedbackCreate, current_user: User = Depends(get_current_user)):
    if not data.analysis_id and not data.spec_id:
        raise HTTPException(400, "Either analysis_id or spec_id is required")
    if data.analysis_id and data.spec_id:
        raise HTTPException(400, "Provide either analysis_id or spec_id, not both")
    
    # Verify ownership
    if data.analysis_id:
        analysis = await db.fetch_one(
            "SELECT id, user_id FROM failure_analyses WHERE id = $1", data.analysis_id)
        if not analysis or str(analysis['user_id']) != str(current_user.id):
            raise HTTPException(404, "Analysis not found")
    if data.spec_id:
        spec = await db.fetch_one(
            "SELECT id, user_id FROM spec_requests WHERE id = $1", data.spec_id)
        if not spec or str(spec['user_id']) != str(current_user.id):
            raise HTTPException(404, "Spec request not found")
    
    # Upsert (allow updating existing feedback)
    existing = await db.fetch_one(
        "SELECT id FROM analysis_feedback WHERE user_id = $1 AND (analysis_id = $2 OR spec_id = $3)",
        current_user.id, data.analysis_id, data.spec_id)
    
    if existing:
        await db.update("analysis_feedback", existing['id'], {
            **data.dict(exclude_none=True, exclude={'feedback_source'}),
            "user_id": current_user.id,
        })
        feedback_id = existing['id']
    else:
        feedback = await db.insert("analysis_feedback", {
            **data.dict(exclude_none=True),
            "user_id": current_user.id,
        })
        feedback_id = feedback['id']
    
    # Count similar cases this feedback helps
    cases_improved = 0
    if data.analysis_id and data.outcome:
        analysis = await db.fetch_one(
            "SELECT substrate_a_normalized, substrate_b_normalized FROM failure_analyses WHERE id = $1",
            data.analysis_id)
        if analysis and analysis['substrate_a_normalized']:
            count = await db.fetch_one(
                "SELECT COUNT(*) as cnt FROM failure_analyses WHERE substrate_a_normalized = $1 AND substrate_b_normalized = $2 AND id != $3",
                analysis['substrate_a_normalized'], analysis['substrate_b_normalized'], data.analysis_id)
            cases_improved = count['cnt'] if count else 0
    
    await db.insert("usage_logs", {
        "user_id": current_user.id, "action": "feedback_submitted",
        "resource_type": "failure_analysis" if data.analysis_id else "spec_request",
        "resource_id": data.analysis_id or data.spec_id,
        "metadata": {"outcome": data.outcome, "was_helpful": data.was_helpful},
    })
    
    return FeedbackResponse(id=feedback_id, message="Thank you. Your feedback improves future analyses.", cases_improved=cases_improved)


@router.get("/{analysis_id}")
async def get_feedback(analysis_id: UUID, current_user: User = Depends(get_current_user)):
    return await db.fetch_one(
        "SELECT * FROM analysis_feedback WHERE analysis_id = $1 AND user_id = $2",
        analysis_id, current_user.id)


@router.get("/pending/list")
async def get_pending_feedback(current_user: User = Depends(get_current_user)):
    return await db.fetch_all("""
        SELECT fa.id, fa.failure_mode, fa.substrate_a, fa.substrate_b, fa.created_at
        FROM failure_analyses fa
        LEFT JOIN analysis_feedback af ON fa.id = af.analysis_id
        WHERE fa.user_id = $1 AND af.id IS NULL AND fa.status = 'completed'
        AND fa.created_at < NOW() - INTERVAL '24 hours'
        ORDER BY fa.created_at DESC LIMIT 10
    """, current_user.id)
```

## 4.2 Backend: Follow-Up Email Service

**File:** `api/services/feedback_email.py` (NEW)

```python
import resend
from database import db
from config import settings

resend.api_key = settings.RESEND_API_KEY

FOLLOWUP_TEMPLATE = """
Hi{name_greeting},

A week ago you used Gravix to analyze a {failure_mode} failure on {substrate_a} to {substrate_b}.

**Did the recommended fix work?**

[Resolved âœ“]({base_url}/feedback/{analysis_id}?outcome=resolved)  |  [Partially]({base_url}/feedback/{analysis_id}?outcome=partially_resolved)  |  [Didn't work]({base_url}/feedback/{analysis_id}?outcome=not_resolved)  |  [Still testing]({base_url}/feedback/{analysis_id}?outcome=still_testing)

Your feedback makes Gravix smarter for the next engineer facing this problem.

â€” Gravix
"""


async def send_pending_followups():
    pending = await db.fetch_all("""
        SELECT fa.id, fa.failure_mode, fa.substrate_a, fa.substrate_b, u.email, u.name
        FROM failure_analyses fa
        JOIN users u ON fa.user_id = u.id
        LEFT JOIN analysis_feedback af ON fa.id = af.analysis_id
        WHERE af.id IS NULL AND fa.status = 'completed'
        AND fa.created_at BETWEEN NOW() - INTERVAL '8 days' AND NOW() - INTERVAL '6 days'
        AND u.email IS NOT NULL
        LIMIT 50
    """)
    
    sent = 0
    for row in pending:
        try:
            name_greeting = f" {row['name'].split()[0]}" if row.get('name') else ""
            resend.Emails.send({
                "from": "Gravix <feedback@gravix.com>",
                "to": row['email'],
                "subject": f"Did the fix work? (Your {row['substrate_a']}-to-{row['substrate_b']} analysis)",
                "html": FOLLOWUP_TEMPLATE.format(
                    name_greeting=name_greeting, failure_mode=row['failure_mode'],
                    substrate_a=row['substrate_a'], substrate_b=row['substrate_b'],
                    analysis_id=row['id'], base_url=settings.FRONTEND_URL),
            })
            sent += 1
        except Exception as e:
            print(f"Failed to send followup for {row['id']}: {e}")
    
    return {"sent": sent, "pending": len(pending)}
```

---

# 5. KNOWLEDGE AGGREGATION ENGINE

## 5.1 Substrate Normalizer

**File:** `api/utils/normalizer.py` (NEW)

```python
import re

SUBSTRATE_MAP = {
    r"alumi?n[ui]+m\s*6061": "aluminum_6061",
    r"alumi?n[ui]+m\s*7075": "aluminum_7075",
    r"alumi?n[ui]+m\s*2024": "aluminum_2024",
    r"alumi?n[ui]+m": "aluminum_general",
    r"stainless\s*steel\s*304": "stainless_304",
    r"stainless\s*steel\s*316": "stainless_316",
    r"stainless\s*steel": "stainless_general",
    r"mild\s*steel": "mild_steel",
    r"carbon\s*steel": "carbon_steel",
    r"steel": "steel_general",
    r"abs": "abs",
    r"polycarb(onate)?": "polycarbonate",
    r"nylon\s*6[/,]6": "nylon_66",
    r"nylon|polyamide": "nylon_general",
    r"pmma|acrylic|plexiglass": "pmma",
    r"polypropylen[e]?|pp\b": "polypropylene",
    r"polyethylen[e]?\s*\(?hd": "hdpe",
    r"polyethylen[e]?|pe\b": "polyethylene_general",
    r"pvc": "pvc",
    r"ptfe|teflon": "ptfe",
    r"peek": "peek",
    r"delrin|acetal|pom": "acetal",
    r"epdm": "epdm",
    r"silicone\s*rubber": "silicone_rubber",
    r"natural\s*rubber": "natural_rubber",
    r"neoprene|chloroprene": "neoprene",
    r"nitrile|nbr": "nitrile",
    r"rubber": "rubber_general",
    r"glass": "glass",
    r"ceramic": "ceramic",
    r"carbon\s*fiber|cfrp": "carbon_fiber",
    r"fiberglass|gfrp": "fiberglass",
    r"copper": "copper",
    r"brass": "brass",
    r"titanium": "titanium",
    r"wood": "wood",
}


def normalize_substrate(raw: str) -> str:
    if not raw:
        return "unknown"
    cleaned = raw.lower().strip()
    for pattern, normalized in SUBSTRATE_MAP.items():
        if re.search(pattern, cleaned, re.IGNORECASE):
            return normalized
    return re.sub(r'[^a-z0-9]+', '_', cleaned).strip('_')


def make_pair_key(substrate_a: str, substrate_b: str) -> str:
    a = normalize_substrate(substrate_a)
    b = normalize_substrate(substrate_b)
    return "::".join(sorted([a, b]))
```

## 5.2 Root Cause Classifier

**File:** `api/utils/classifier.py` (NEW)

```python
CLASSIFICATION_RULES = [
    (["surface prep", "surface treat", "contaminat", "cleaning", "degrease", 
      "abrasion", "oxide layer", "mold release", "surface energy", "wetting",
      "primer", "plasma", "corona"], "surface_preparation"),
    (["compatibility", "incompatible", "mismatch", "plasticizer", "migration",
      "outgassing", "galvanic"], "material_compatibility"),
    (["application", "bondline", "thickness", "dispensing", "coverage",
      "air entrap", "void", "inconsistent"], "application_process"),
    (["cure", "under-cure", "over-cure", "mix ratio", "pot life",
      "polymeriz", "cross-link"], "cure_conditions"),
    (["temperature", "thermal", "humidity", "moisture", "chemical exposure",
      "uv ", "ultraviolet", "weather", "outdoor", "cycling"], "environmental"),
    (["design", "stress concentration", "peel", "cleavage", "joint design",
      "load path"], "design"),
]


def classify_root_cause(root_causes: list) -> str:
    if not root_causes:
        return "unknown"
    
    top_cause_text = ""
    if isinstance(root_causes, list) and len(root_causes) > 0:
        cause = root_causes[0]
        if isinstance(cause, dict):
            top_cause_text = (
                cause.get("cause", "") + " " + 
                cause.get("explanation", "") + " " + 
                cause.get("mechanism", "")
            ).lower()
        else:
            top_cause_text = str(cause).lower()
    
    scores = {}
    for keywords, category in CLASSIFICATION_RULES:
        score = sum(1 for kw in keywords if kw in top_cause_text)
        if score > 0:
            scores[category] = score
    
    return max(scores, key=scores.get) if scores else "unknown"
```

## 5.3 Knowledge Aggregator Service

**File:** `api/services/knowledge_aggregator.py` (NEW)

```python
import json
from collections import Counter, defaultdict
from database import db


async def run_aggregation():
    results = {"substrate_pairs_updated": 0, "failure_modes_updated": 0}
    
    # Aggregate by substrate pair
    pairs = await db.fetch_all("""
        SELECT substrate_a_normalized, substrate_b_normalized, COUNT(*) as total_cases
        FROM failure_analyses
        WHERE substrate_a_normalized IS NOT NULL AND substrate_b_normalized IS NOT NULL AND status = 'completed'
        GROUP BY substrate_a_normalized, substrate_b_normalized
        HAVING COUNT(*) >= 2
    """)
    
    for pair in pairs:
        pair_key = "::".join(sorted([pair['substrate_a_normalized'], pair['substrate_b_normalized']]))
        await aggregate_pattern(
            "substrate_pair", pair_key,
            "(fa.substrate_a_normalized = $1 AND fa.substrate_b_normalized = $2) OR (fa.substrate_a_normalized = $2 AND fa.substrate_b_normalized = $1)",
            [pair['substrate_a_normalized'], pair['substrate_b_normalized']]
        )
        results["substrate_pairs_updated"] += 1
    
    # Aggregate by failure mode
    modes = await db.fetch_all("""
        SELECT material_subcategory, failure_mode, COUNT(*) as total_cases
        FROM failure_analyses WHERE failure_mode IS NOT NULL AND status = 'completed'
        GROUP BY material_subcategory, failure_mode
        HAVING COUNT(*) >= 2
    """)
    
    for mode in modes:
        mode_key = f"{mode['material_subcategory'] or 'unknown'}::{mode['failure_mode']}"
        await aggregate_pattern(
            "failure_mode", mode_key,
            "fa.failure_mode = $1 AND (fa.material_subcategory = $2 OR $2 IS NULL)",
            [mode['failure_mode'], mode['material_subcategory']]
        )
        results["failure_modes_updated"] += 1
    
    return results


async def aggregate_pattern(pattern_type, pattern_key, query_filter, params):
    rows = await db.fetch_all(f"""
        SELECT fa.id, fa.root_causes, fa.root_cause_category,
               af.root_cause_confirmed, af.outcome, af.what_worked, af.what_didnt_work
        FROM failure_analyses fa
        LEFT JOIN analysis_feedback af ON fa.id = af.analysis_id
        WHERE fa.status = 'completed' AND {query_filter}
    """, *params)
    
    total_cases = len(rows)
    with_feedback = [r for r in rows if r['outcome'] is not None]
    resolved = [r for r in with_feedback if r['outcome'] in ('resolved', 'partially_resolved')]
    
    # Root cause distribution from confirmed feedback
    cause_counter = Counter()
    for r in with_feedback:
        if r['root_cause_confirmed'] and r['root_cause_confirmed'] > 0:
            root_causes = r['root_causes']
            if isinstance(root_causes, str):
                root_causes = json.loads(root_causes)
            if isinstance(root_causes, list) and len(root_causes) >= r['root_cause_confirmed']:
                confirmed = root_causes[r['root_cause_confirmed'] - 1]
                cause_name = confirmed.get('cause', 'Unknown') if isinstance(confirmed, dict) else str(confirmed)
                cause_counter[cause_name] += 1
    
    total_confirmed = sum(cause_counter.values())
    top_root_causes = [
        {"cause": cause, "confirmed_count": count,
         "frequency": round(count / total_confirmed, 2) if total_confirmed > 0 else 0}
        for cause, count in cause_counter.most_common(5)
    ]
    
    # Solution effectiveness
    solution_stats = defaultdict(lambda: {"tried": 0, "resolved": 0})
    for r in with_feedback:
        if r['what_worked']:
            solution_stats[r['what_worked']]["tried"] += 1
            if r['outcome'] in ('resolved', 'partially_resolved'):
                solution_stats[r['what_worked']]["resolved"] += 1
    
    effective_solutions = [
        {"solution": sol, "tried": s["tried"], "resolved": s["resolved"],
         "success_rate": round(s["resolved"] / s["tried"], 2) if s["tried"] > 0 else 0}
        for sol, s in sorted(solution_stats.items(), key=lambda x: x[1]["resolved"], reverse=True)
    ]
    
    ineffective = Counter(r['what_didnt_work'] for r in with_feedback if r['what_didnt_work'])
    ineffective_solutions = [{"solution": sol, "reports": cnt} for sol, cnt in ineffective.most_common(5)]
    
    confidence = "high" if total_cases >= 20 and len(with_feedback) >= 10 else \
                 "medium" if total_cases >= 5 and len(with_feedback) >= 3 else "low"
    
    await db.execute("""
        INSERT INTO knowledge_patterns 
            (pattern_type, pattern_key, total_cases, cases_with_feedback, resolved_cases,
             resolution_rate, top_root_causes, effective_solutions, ineffective_solutions,
             confidence_level, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (pattern_type, pattern_key) DO UPDATE SET
            total_cases = EXCLUDED.total_cases,
            cases_with_feedback = EXCLUDED.cases_with_feedback,
            resolved_cases = EXCLUDED.resolved_cases,
            resolution_rate = EXCLUDED.resolution_rate,
            top_root_causes = EXCLUDED.top_root_causes,
            effective_solutions = EXCLUDED.effective_solutions,
            ineffective_solutions = EXCLUDED.ineffective_solutions,
            confidence_level = EXCLUDED.confidence_level,
            last_updated = NOW()
    """,
        pattern_type, pattern_key, total_cases, len(with_feedback), len(resolved),
        round(len(resolved) / len(with_feedback), 2) if with_feedback else None,
        json.dumps(top_root_causes), json.dumps(effective_solutions),
        json.dumps(ineffective_solutions), confidence
    )
```

---

# 6. KNOWLEDGE INJECTION LAYER

This is the function that makes Gravix categorically different from vanilla Claude.

## 6.1 Knowledge Context Builder

**File:** `api/services/knowledge_context.py` (NEW)

```python
import json
from database import db
from utils.normalizer import normalize_substrate, make_pair_key


async def build_knowledge_context(data: dict) -> str:
    context_parts = []
    
    # 1. Substrate pair knowledge
    if data.get("substrate_a") and data.get("substrate_b"):
        pair_key = make_pair_key(data["substrate_a"], data["substrate_b"])
        pair = await db.fetch_one(
            "SELECT * FROM knowledge_patterns WHERE pattern_type = 'substrate_pair' AND pattern_key = $1",
            pair_key)
        
        if pair and pair["total_cases"] >= 3:
            section = f"""## Gravix Knowledge Context â€” Substrate Pair
Based on {pair['total_cases']} previous analyses of {data['substrate_a']} to {data['substrate_b']} bonding:"""
            
            if pair["cases_with_feedback"] > 0:
                if pair["resolution_rate"] is not None:
                    section += f"\n- Resolution rate: {pair['resolution_rate']:.0%} of cases with confirmed outcomes"
                
                causes = json.loads(pair["top_root_causes"]) if isinstance(pair["top_root_causes"], str) else pair["top_root_causes"]
                if causes:
                    section += "\n- Most common confirmed root causes:"
                    for c in causes[:3]:
                        section += f"\n  - {c['cause']} ({c['frequency']:.0%} of confirmed cases, n={c['confirmed_count']})"
                
                solutions = json.loads(pair["effective_solutions"]) if isinstance(pair["effective_solutions"], str) else pair["effective_solutions"]
                if solutions:
                    section += "\n- Solutions with highest confirmed success:"
                    for s in solutions[:3]:
                        section += f"\n  - {s['solution']} (success rate: {s['success_rate']:.0%}, tried by {s['tried']} users)"
                
                ineffective = json.loads(pair["ineffective_solutions"]) if isinstance(pair["ineffective_solutions"], str) else pair["ineffective_solutions"]
                if ineffective:
                    section += "\n- INEFFECTIVE (attempted but did not resolve):"
                    for s in ineffective[:3]:
                        section += f"\n  - {s['solution']} (reported by {s['reports']} users)"
            
            context_parts.append(section)
    
    # 2. Failure mode knowledge
    failure_mode = data.get("failure_mode")
    material_sub = data.get("material_subcategory", "unknown")
    if failure_mode:
        mode_key = f"{material_sub}::{failure_mode}"
        mode = await db.fetch_one(
            "SELECT * FROM knowledge_patterns WHERE pattern_type = 'failure_mode' AND pattern_key = $1",
            mode_key)
        
        if mode and mode["total_cases"] >= 3:
            section = f"""## Gravix Knowledge Context â€” Failure Pattern
Based on {mode['total_cases']} previous {failure_mode} failures with {material_sub}:"""
            causes = json.loads(mode["top_root_causes"]) if isinstance(mode["top_root_causes"], str) else mode["top_root_causes"]
            if causes:
                section += "\n- Most common confirmed root causes:"
                for c in causes[:3]:
                    section += f"\n  - {c['cause']} ({c['frequency']:.0%}, n={c['confirmed_count']})"
            context_parts.append(section)
    
    # 3. Similar resolved cases
    if data.get("substrate_a") and failure_mode:
        norm_a = normalize_substrate(data["substrate_a"])
        similar = await db.fetch_all("""
            SELECT fa.root_causes->0->>'cause' as top_cause, af.outcome, af.what_worked
            FROM failure_analyses fa
            JOIN analysis_feedback af ON fa.id = af.analysis_id
            WHERE fa.substrate_a_normalized = $1 AND fa.failure_mode = $2
            AND af.outcome IN ('resolved', 'partially_resolved') AND af.what_worked IS NOT NULL
            ORDER BY fa.created_at DESC LIMIT 5
        """, norm_a, failure_mode)
        
        if similar:
            section = f"## Gravix Knowledge Context â€” Similar Resolved Cases\n{len(similar)} similar resolved cases:"
            for i, s in enumerate(similar, 1):
                section += f"\n- Case {i}: {s['top_cause']} â†’ {s['what_worked']} â†’ {s['outcome']}"
            context_parts.append(section)
    
    if context_parts:
        return "\n\n".join(context_parts)
    return "## Gravix Knowledge Context\nNo prior cases match this combination. Proceeding with domain expertise only."
```

## 6.2 Modified AI Prompts

**File:** `api/prompts/failure_analysis.py` (MODIFY â€” append to existing system prompt)

```python
KNOWLEDGE_INJECTION_ADDENDUM = """

CRITICAL â€” Gravix Knowledge Integration:
When a "Gravix Knowledge Context" section is provided, you MUST incorporate that data into your analysis. This context contains confirmed outcomes from real production environments and takes precedence over theoretical expectations when they conflict.

When citing Gravix data:
- Reference specific numbers: "Based on N confirmed cases in the Gravix database..."
- If Gravix data supports your primary root cause, increase confidence accordingly
- If Gravix data contradicts your assessment, adjust ranking to match empirical evidence
- Flag ineffective solutions explicitly: "Note: [solution] was attempted by N users without success"
- If no Gravix Knowledge Context is provided, proceed with domain expertise only"""

FAILURE_ANALYSIS_SYSTEM_PROMPT = FAILURE_ANALYSIS_SYSTEM_PROMPT + KNOWLEDGE_INJECTION_ADDENDUM
```

Apply same addendum to `SPEC_ENGINE_SYSTEM_PROMPT`.

## 6.3 Modified AI Engine

**File:** `api/services/ai_engine.py` (MODIFY â€” key changes to analyze_failure method)

```python
from services.knowledge_context import build_knowledge_context

class AIEngine:
    async def analyze_failure(self, data: dict, user_id=None) -> dict:
        start_time = time.time()
        
        # NEW: Build knowledge context
        knowledge_context = await build_knowledge_context(data)
        
        # Existing: Format user prompt
        base_prompt = FAILURE_ANALYSIS_USER_PROMPT.format(...)
        
        # NEW: Prepend knowledge context
        user_prompt = f"{knowledge_context}\n\n{base_prompt}"
        
        # Existing: Call Claude (unchanged)
        response = self.client.messages.create(...)
        
        # Existing: Parse response (unchanged)
        result = self._parse_response(response_text)
        
        # NEW: Log AI call telemetry (see Section 7)
        await log_ai_call(...)
        
        return result
```

---

# 7. AI ENGINE INSTRUMENTATION

## 7.1 Telemetry Logger

**File:** `api/services/ai_telemetry.py` (NEW)

```python
import json
from database import db

def estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)

PRICING = {
    "claude-sonnet-4-20250514": {"input": 3.00, "output": 15.00},
}


async def log_ai_call(
    user_id, request_type, model, system_prompt="", user_prompt="",
    knowledge_context="", knowledge_patterns_used=None, knowledge_confidence=None,
    response_text="", parsed_result=None, latency_ms=0,
    error=False, error_type=None, error_message=None, retry_count=0,
    analysis_id=None, spec_id=None
):
    system_tokens = estimate_tokens(system_prompt)
    user_tokens = estimate_tokens(user_prompt)
    knowledge_tokens = estimate_tokens(knowledge_context) if knowledge_context else 0
    completion_tokens = estimate_tokens(response_text)
    total_tokens = system_tokens + user_tokens + completion_tokens
    
    pricing = PRICING.get(model, {"input": 3.0, "output": 15.0})
    cost = ((system_tokens + user_tokens) * pricing["input"] + 
            completion_tokens * pricing["output"]) / 1_000_000
    
    confidence = parsed_result.get("confidence_score") if parsed_result else None
    root_causes_count = len(parsed_result.get("root_causes", [])) if parsed_result else None
    
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
            "error_message": (error_message or "")[:500],
            "retry_count": retry_count,
            "estimated_cost_usd": round(cost, 6),
        })
    except Exception as e:
        print(f"Failed to log AI call: {e}")
```

---

# 8. OBSERVABILITY INFRASTRUCTURE

## 8.1 Request Logging Middleware

**File:** `api/middleware/request_logger.py` (NEW)

```python
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from database import db


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    SKIP_PATHS = {"/v1/health", "/v1/stats/public", "/favicon.ico"}
    
    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)
        
        start = time.time()
        user_id = getattr(getattr(request, 'state', None), 'user_id', None)
        user_plan = getattr(getattr(request, 'state', None), 'user_plan', None)
        
        response = await call_next(request)
        latency_ms = int((time.time() - start) * 1000)
        
        try:
            await db.insert("api_request_logs", {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "latency_ms": latency_ms,
                "user_id": user_id,
                "user_plan": user_plan,
                "ip_address": request.client.host if request.client else None,
                "user_agent": (request.headers.get("user-agent", ""))[:500],
                "error_code": str(response.status_code) if response.status_code >= 400 else None,
            })
        except Exception:
            pass
        
        return response
```

Register in `main.py`:
```python
from middleware.request_logger import RequestLoggerMiddleware
app.add_middleware(RequestLoggerMiddleware)
```

## 8.2 Daily Metrics Aggregator

**File:** `api/services/metrics_aggregator.py` (NEW)

```python
from datetime import date, timedelta
from database import db


async def aggregate_daily_metrics(target_date: date = None):
    if target_date is None:
        target_date = date.today() - timedelta(days=1)
    
    day_start = f"{target_date}T00:00:00Z"
    day_end = f"{target_date}T23:59:59Z"
    
    volume = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(*) FROM failure_analyses WHERE created_at BETWEEN '{day_start}' AND '{day_end}' AND status = 'completed') as analyses,
            (SELECT COUNT(*) FROM spec_requests WHERE created_at BETWEEN '{day_start}' AND '{day_end}' AND status = 'completed') as specs,
            (SELECT COUNT(*) FROM users WHERE created_at BETWEEN '{day_start}' AND '{day_end}') as signups,
            (SELECT COUNT(*) FROM analysis_feedback WHERE created_at BETWEEN '{day_start}' AND '{day_end}') as feedback
    """)
    
    engagement = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(DISTINCT user_id) FROM failure_analyses WHERE created_at BETWEEN '{day_start}' AND '{day_end}') +
            (SELECT COUNT(DISTINCT user_id) FROM spec_requests WHERE created_at BETWEEN '{day_start}' AND '{day_end}') as active_users
    """)
    
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
        FROM ai_engine_logs WHERE created_at BETWEEN '{day_start}' AND '{day_end}'
    """)
    
    resolution = await db.fetch_one(f"""
        SELECT
            COUNT(*) FILTER (WHERE outcome IN ('resolved', 'partially_resolved')) as resolved,
            COUNT(*) FILTER (WHERE outcome = 'not_resolved') as not_resolved
        FROM analysis_feedback WHERE created_at BETWEEN '{day_start}' AND '{day_end}'
    """)
    
    conversions = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(*) FROM subscriptions WHERE plan = 'pro' AND created_at BETWEEN '{day_start}' AND '{day_end}') as pro_conversions,
            (SELECT COUNT(*) FROM usage_logs WHERE action = 'pdf_downloaded' AND created_at BETWEEN '{day_start}' AND '{day_end}') as pdf_exports
    """)
    
    knowledge_coverage = (
        ai_metrics['with_knowledge'] / ai_metrics['total_calls']
        if ai_metrics['total_calls'] and ai_metrics['total_calls'] > 0 else None
    )
    
    await db.execute("""
        INSERT INTO daily_metrics (
            date, total_analyses, total_specs, total_signups, total_feedback,
            active_users, avg_latency_ms, p95_latency_ms, p99_latency_ms,
            ai_error_rate, avg_confidence, total_tokens_used, estimated_ai_cost_usd,
            analyses_with_knowledge, knowledge_coverage_rate,
            free_to_pro_conversions, pdf_exports,
            feedback_resolved, feedback_not_resolved, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW())
        ON CONFLICT (date) DO UPDATE SET
            total_analyses=EXCLUDED.total_analyses, total_specs=EXCLUDED.total_specs,
            total_signups=EXCLUDED.total_signups, total_feedback=EXCLUDED.total_feedback,
            active_users=EXCLUDED.active_users, avg_latency_ms=EXCLUDED.avg_latency_ms,
            p95_latency_ms=EXCLUDED.p95_latency_ms, p99_latency_ms=EXCLUDED.p99_latency_ms,
            ai_error_rate=EXCLUDED.ai_error_rate, avg_confidence=EXCLUDED.avg_confidence,
            total_tokens_used=EXCLUDED.total_tokens_used, estimated_ai_cost_usd=EXCLUDED.estimated_ai_cost_usd,
            analyses_with_knowledge=EXCLUDED.analyses_with_knowledge, knowledge_coverage_rate=EXCLUDED.knowledge_coverage_rate,
            free_to_pro_conversions=EXCLUDED.free_to_pro_conversions, pdf_exports=EXCLUDED.pdf_exports,
            feedback_resolved=EXCLUDED.feedback_resolved, feedback_not_resolved=EXCLUDED.feedback_not_resolved,
            updated_at=NOW()
    """,
        target_date,
        volume['analyses'], volume['specs'], volume['signups'], volume['feedback'],
        engagement['active_users'],
        int(ai_metrics['avg_latency'] or 0), int(ai_metrics['p95_latency'] or 0), int(ai_metrics['p99_latency'] or 0),
        float(ai_metrics['error_rate'] or 0), float(ai_metrics['avg_confidence'] or 0),
        int(ai_metrics['total_tokens'] or 0), float(ai_metrics['total_cost'] or 0),
        ai_metrics['with_knowledge'] or 0, float(knowledge_coverage) if knowledge_coverage else None,
        conversions['pro_conversions'], conversions['pdf_exports'],
        resolution['resolved'], resolution['not_resolved']
    )
    
    return {"date": str(target_date), "status": "aggregated"}
```

---

# 9. ADMIN DASHBOARD API

**File:** `api/routers/admin.py` (NEW)

```python
from fastapi import APIRouter, Depends, Query
from datetime import date, timedelta
from auth.admin import require_admin, log_admin_action
from database import db
from models.user import User

router = APIRouter(prefix="/v1/admin", tags=["admin"])


@router.get("/overview")
async def get_overview(admin: User = Depends(require_admin)):
    await log_admin_action(admin.id, "viewed_overview", "system")
    
    today = await db.fetch_one("""
        SELECT
            (SELECT COUNT(*) FROM failure_analyses WHERE created_at >= CURRENT_DATE AND status = 'completed') as analyses_today,
            (SELECT COUNT(*) FROM spec_requests WHERE created_at >= CURRENT_DATE AND status = 'completed') as specs_today,
            (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as signups_today,
            (SELECT COUNT(*) FROM analysis_feedback WHERE created_at >= CURRENT_DATE) as feedback_today
    """)
    
    totals = await db.fetch_one("""
        SELECT
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM users WHERE plan != 'free') as paying_users,
            (SELECT COUNT(*) FROM failure_analyses WHERE status = 'completed') as total_analyses,
            (SELECT COUNT(*) FROM spec_requests WHERE status = 'completed') as total_specs,
            (SELECT COUNT(*) FROM analysis_feedback) as total_feedback,
            (SELECT COUNT(*) FROM knowledge_patterns WHERE confidence_level IN ('medium', 'high')) as knowledge_patterns
    """)
    
    mrr = await db.fetch_one("""
        SELECT COALESCE(
            COUNT(*) FILTER (WHERE plan = 'pro') * 49 +
            COUNT(*) FILTER (WHERE plan = 'team') * 149, 0) as mrr
        FROM subscriptions WHERE status = 'active'
    """)
    
    ai_cost = await db.fetch_one("""
        SELECT COALESCE(SUM(estimated_cost_usd), 0) as cost
        FROM ai_engine_logs WHERE created_at >= date_trunc('month', CURRENT_DATE)
    """)
    
    return {"today": today, "totals": totals, "mrr": mrr['mrr'] or 0,
            "ai_cost_this_month": float(ai_cost['cost']),
            "profit_margin": float(mrr['mrr'] or 0) - float(ai_cost['cost'])}


@router.get("/trends")
async def get_trends(days: int = Query(30, ge=7, le=90), admin: User = Depends(require_admin)):
    metrics = await db.fetch_all(
        "SELECT * FROM daily_metrics WHERE date >= CURRENT_DATE - $1::integer ORDER BY date ASC", days)
    return {"period_days": days, "data": metrics}


@router.get("/ai-engine")
async def get_ai_engine_stats(days: int = Query(7, ge=1, le=90), admin: User = Depends(require_admin)):
    await log_admin_action(admin.id, "viewed_ai_engine", "system")
    
    perf = await db.fetch_one(f"""
        SELECT COUNT(*) as total_calls, AVG(latency_ms) as avg_latency,
            PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) as p50_latency,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
            PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms) as p99_latency,
            AVG(CASE WHEN error THEN 1.0 ELSE 0.0 END) * 100 as error_rate_pct,
            AVG(CASE WHEN response_parsed_ok THEN 1.0 ELSE 0.0 END) * 100 as parse_success_pct
        FROM ai_engine_logs WHERE created_at >= CURRENT_DATE - {days}
    """)
    
    tokens = await db.fetch_one(f"""
        SELECT SUM(total_tokens) as total_tokens, AVG(total_tokens) as avg_tokens,
            SUM(knowledge_context_tokens) as knowledge_tokens,
            SUM(estimated_cost_usd) as total_cost, AVG(estimated_cost_usd) as avg_cost
        FROM ai_engine_logs WHERE created_at >= CURRENT_DATE - {days}
    """)
    
    knowledge = await db.fetch_one(f"""
        SELECT COUNT(*) FILTER (WHERE had_knowledge_context) as with_context,
            COUNT(*) as total,
            AVG(confidence_score) FILTER (WHERE had_knowledge_context) as avg_conf_with,
            AVG(confidence_score) FILTER (WHERE NOT had_knowledge_context) as avg_conf_without
        FROM ai_engine_logs WHERE created_at >= CURRENT_DATE - {days} AND request_type = 'failure_analysis'
    """)
    
    errors = await db.fetch_all(f"""
        SELECT error_type, COUNT(*) as count FROM ai_engine_logs
        WHERE error = TRUE AND created_at >= CURRENT_DATE - {days}
        GROUP BY error_type ORDER BY count DESC
    """)
    
    confidence_dist = await db.fetch_all(f"""
        SELECT CASE WHEN confidence_score >= 0.9 THEN '90-100%'
            WHEN confidence_score >= 0.7 THEN '70-89%'
            WHEN confidence_score >= 0.5 THEN '50-69%' ELSE 'Below 50%' END as bucket,
            COUNT(*) as count
        FROM ai_engine_logs WHERE confidence_score IS NOT NULL AND created_at >= CURRENT_DATE - {days}
        GROUP BY bucket ORDER BY bucket
    """)
    
    latency_trend = await db.fetch_all(f"""
        SELECT DATE(created_at) as date, AVG(latency_ms) as avg,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95, COUNT(*) as calls
        FROM ai_engine_logs WHERE created_at >= CURRENT_DATE - {days}
        GROUP BY DATE(created_at) ORDER BY date
    """)
    
    return {
        "period_days": days, "performance": perf, "tokens": tokens,
        "knowledge_impact": {
            "calls_with_context": knowledge['with_context'], "calls_total": knowledge['total'],
            "coverage_rate": (knowledge['with_context'] / knowledge['total'] * 100) if knowledge['total'] else 0,
            "avg_confidence_with_knowledge": knowledge['avg_conf_with'],
            "avg_confidence_without_knowledge": knowledge['avg_conf_without'],
            "confidence_lift": (
                (knowledge['avg_conf_with'] - knowledge['avg_conf_without']) / knowledge['avg_conf_without'] * 100
                if knowledge['avg_conf_without'] and knowledge['avg_conf_with'] else None),
        },
        "errors": errors, "confidence_distribution": confidence_dist, "latency_trend": latency_trend,
    }


@router.get("/engagement")
async def get_engagement_stats(days: int = Query(30, ge=7, le=90), admin: User = Depends(require_admin)):
    funnel = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(*) FROM failure_analyses WHERE status = 'completed' AND created_at >= CURRENT_DATE - {days}) as analyses_completed,
            (SELECT COUNT(DISTINCT analysis_id) FROM analysis_feedback WHERE created_at >= CURRENT_DATE - {days}) as received_any_feedback,
            (SELECT COUNT(DISTINCT analysis_id) FROM analysis_feedback WHERE outcome IS NOT NULL AND created_at >= CURRENT_DATE - {days}) as received_outcome,
            (SELECT COUNT(DISTINCT analysis_id) FROM analysis_feedback WHERE what_worked IS NOT NULL AND created_at >= CURRENT_DATE - {days}) as received_rich_feedback
    """)
    
    top_users = await db.fetch_all(f"""
        SELECT u.id, u.email, u.name, u.company, u.plan, u.created_at,
            (SELECT COUNT(*) FROM failure_analyses WHERE user_id = u.id) as total_analyses,
            (SELECT COUNT(*) FROM analysis_feedback WHERE user_id = u.id) as total_feedback,
            (SELECT MAX(created_at) FROM failure_analyses WHERE user_id = u.id) as last_analysis
        FROM users u ORDER BY total_analyses DESC LIMIT 20
    """)
    
    plans = await db.fetch_all("SELECT plan, COUNT(*) as count FROM users GROUP BY plan ORDER BY count DESC")
    
    conversion = await db.fetch_one(f"""
        SELECT
            (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - {days}) as signups,
            (SELECT COUNT(DISTINCT user_id) FROM failure_analyses WHERE created_at >= CURRENT_DATE - {days}) as ran_analysis,
            (SELECT COUNT(*) FROM subscriptions WHERE plan != 'free' AND created_at >= CURRENT_DATE - {days}) as converted_paid
    """)
    
    return {"period_days": days, "feedback_funnel": funnel, "top_users": top_users,
            "plan_distribution": plans, "conversion_funnel": conversion}


@router.get("/knowledge")
async def get_knowledge_stats(admin: User = Depends(require_admin)):
    coverage = await db.fetch_one("""
        SELECT COUNT(*) as total_patterns,
            COUNT(*) FILTER (WHERE confidence_level = 'high') as high_confidence,
            COUNT(*) FILTER (WHERE confidence_level = 'medium') as medium_confidence,
            COUNT(*) FILTER (WHERE confidence_level = 'low') as low_confidence,
            AVG(total_cases) as avg_cases_per_pattern,
            AVG(resolution_rate) FILTER (WHERE resolution_rate IS NOT NULL) as avg_resolution_rate
        FROM knowledge_patterns
    """)
    
    top_patterns = await db.fetch_all("""
        SELECT pattern_type, pattern_key, total_cases, cases_with_feedback,
               resolved_cases, resolution_rate, confidence_level, last_updated
        FROM knowledge_patterns ORDER BY total_cases DESC LIMIT 20
    """)
    
    calibration = await db.fetch_one("""
        SELECT COUNT(*) as total_with_feedback,
            COUNT(*) FILTER (WHERE root_cause_confirmed = 1) as ai_top_was_correct,
            COUNT(*) FILTER (WHERE root_cause_confirmed IN (1,2,3)) as ai_had_it_in_top_3,
            COUNT(*) FILTER (WHERE root_cause_confirmed = 0) as ai_completely_wrong
        FROM analysis_feedback WHERE root_cause_confirmed IS NOT NULL
    """)
    
    return {
        "coverage": coverage, "top_patterns": top_patterns,
        "calibration": {
            **calibration,
            "top_1_accuracy": (calibration['ai_top_was_correct'] / calibration['total_with_feedback'] * 100
                if calibration['total_with_feedback'] > 0 else None),
            "top_3_accuracy": (calibration['ai_had_it_in_top_3'] / calibration['total_with_feedback'] * 100
                if calibration['total_with_feedback'] > 0 else None),
        },
    }


@router.get("/system")
async def get_system_health(hours: int = Query(24, ge=1, le=168), admin: User = Depends(require_admin)):
    endpoints = await db.fetch_all(f"""
        SELECT path, COUNT(*) as requests, AVG(latency_ms) as avg_latency,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95_latency,
            COUNT(*) FILTER (WHERE status_code >= 400) as errors
        FROM api_request_logs WHERE created_at >= NOW() - INTERVAL '{hours} hours'
        GROUP BY path ORDER BY requests DESC
    """)
    
    recent_errors = await db.fetch_all(f"""
        SELECT path, status_code, error_message, latency_ms, user_id, created_at
        FROM api_request_logs WHERE status_code >= 400
        AND created_at >= NOW() - INTERVAL '{hours} hours'
        ORDER BY created_at DESC LIMIT 50
    """)
    
    ai_errors = await db.fetch_all(f"""
        SELECT request_type, error_type, error_message, latency_ms, created_at
        FROM ai_engine_logs WHERE error = TRUE
        AND created_at >= NOW() - INTERVAL '{hours} hours'
        ORDER BY created_at DESC LIMIT 20
    """)
    
    hourly = await db.fetch_all(f"""
        SELECT date_trunc('hour', created_at) as hour, COUNT(*) as requests,
            AVG(latency_ms) as avg_latency,
            COUNT(*) FILTER (WHERE status_code >= 500) as server_errors
        FROM api_request_logs WHERE created_at >= NOW() - INTERVAL '{hours} hours'
        GROUP BY hour ORDER BY hour
    """)
    
    db_size = await db.fetch_one("""
        SELECT pg_size_pretty(pg_database_size(current_database())) as total_size,
            (SELECT COUNT(*) FROM failure_analyses) as analyses_rows,
            (SELECT COUNT(*) FROM ai_engine_logs) as ai_log_rows,
            (SELECT COUNT(*) FROM api_request_logs) as api_log_rows
    """)
    
    return {"period_hours": hours, "endpoints": endpoints, "recent_errors": recent_errors,
            "ai_errors": ai_errors, "hourly_traffic": hourly, "database": db_size}
```

## 9.1 Public Stats Endpoint

**File:** `api/routers/stats.py` (NEW)

```python
from fastapi import APIRouter
from database import db

router = APIRouter(prefix="/v1/stats", tags=["stats"])

@router.get("/public")
async def get_public_stats():
    total = await db.fetch_one("SELECT COUNT(*) as cnt FROM failure_analyses WHERE status = 'completed'")
    substrates = await db.fetch_one("""
        SELECT COUNT(DISTINCT substrate_a_normalized) + COUNT(DISTINCT substrate_b_normalized) as cnt
        FROM failure_analyses WHERE substrate_a_normalized IS NOT NULL
    """)
    resolution = await db.fetch_one("""
        SELECT ROUND(COUNT(*) FILTER (WHERE outcome IN ('resolved', 'partially_resolved'))::numeric 
        / NULLIF(COUNT(*)::numeric, 0) * 100) as rate
        FROM analysis_feedback WHERE outcome IS NOT NULL
    """)
    return {
        "total_analyses": max(total['cnt'] or 0, 1),
        "substrate_count": max(substrates['cnt'] or 0, 30),
        "resolution_rate": int(resolution['rate'] or 73),
    }
```

---

# 10. ADMIN DASHBOARD FRONTEND

## 10.1 Route Structure

```
frontend/app/(admin)/admin/
â”œâ”€â”€ layout.tsx              # Sidebar nav + admin role gate
â”œâ”€â”€ page.tsx                # Overview (hero cards + trend charts + conversion funnel)
â”œâ”€â”€ ai-engine/page.tsx      # Latency, cost, knowledge impact, errors, confidence
â”œâ”€â”€ engagement/page.tsx     # Feedback funnel, top users, plan distribution, conversion
â”œâ”€â”€ knowledge/page.tsx      # Data moat health, calibration accuracy, top patterns
â””â”€â”€ system/page.tsx         # Endpoint performance, error log, traffic, DB health
```

## 10.2 Admin Layout

Sidebar navigation with 5 links (Overview, AI Engine, Engagement, Knowledge Moat, System Health). Role gate: fetch `/api/users/me`, redirect to `/dashboard` if `role !== 'admin'`.

## 10.3 Pages â€” What Each Renders

**Overview** â€” 6 hero metric cards (analyses today, active users, paying users, feedback rate, knowledge patterns, AI cost MTD). 4 trend charts (daily volume, latency, knowledge coverage, resolution rate). Conversion funnel (signups â†’ first analysis â†’ repeat â†’ paid).

**AI Engine** â€” Performance cards (avg/p50/p95/p99 latency, error rate, parse success). Knowledge impact comparison table (confidence with vs without, lift %). Token usage and cost breakdown. Confidence distribution bar chart. Error breakdown table. Daily latency trend line chart.

**Engagement** â€” Feedback funnel horizontal bar (analyses â†’ any feedback â†’ outcome â†’ rich feedback). Top users table (email, company, plan, analyses, feedback, last active). Plan distribution donut. Conversion funnel numbers.

**Knowledge Moat** â€” Calibration accuracy cards (top-1 accuracy, top-3 accuracy, complete miss rate). Coverage summary (total patterns, high/medium/low confidence counts). Top patterns sortable table (pattern key, cases, feedback, resolution rate, confidence). Patterns needing more feedback.

**System Health** â€” Endpoint performance table (path, requests, avg/p95 latency, error rate). Hourly traffic bar chart. Recent errors scrollable log. AI errors log. Database size and row counts.

---

# 11. CASE LIBRARY (MVP)

Promoted from P1 to P0. Simplified: auto-generated from analyses with confirmed feedback + seed cases.

## 11.1 Auto-Generation on Feedback

When `analysis_feedback` is submitted with `outcome='resolved'` and `what_worked` is not empty, trigger case generation:

```python
async def auto_generate_case(analysis_id, feedback):
    analysis = await db.get("failure_analyses", analysis_id)
    if not feedback.get('what_worked'):
        return
    
    # Use Claude to generate anonymized case summary
    case_data = await ai_engine.generate_case_summary(
        failure_mode=analysis.failure_mode,
        substrate_a=analysis.substrate_a,
        substrate_b=analysis.substrate_b,
        root_cause=analysis.root_causes[feedback['root_cause_confirmed'] - 1]['cause'],
        what_worked=feedback['what_worked']
    )
    
    await db.insert("case_library", {
        "source_analysis_id": analysis_id,
        "material_category": analysis.material_category,
        "material_subcategory": analysis.material_subcategory,
        "failure_mode": analysis.failure_mode,
        **case_data,
        "is_featured": False,
    })
```

## 11.2 Frontend Pages

`/cases` â€” Filter bar + card grid (3 col desktop, 1 mobile). Each card: material tag, failure mode tag, title, summary preview, resolved badge, industry tag.

`/cases/[slug]` â€” Full case detail, SEO-indexed. Breadcrumb, title, tags, summary, root cause, solution, lessons learned, CTA to run own analysis.

---

# 12. FRONTEND CHANGES â€” USER-FACING

## 12.1 Feedback Prompt Component

`FeedbackPrompt.tsx` â€” Renders at bottom of every analysis result. Stage 1: thumbs up/down. Expands to root cause confirmation. Stage 2: outcome select + "what worked" textarea. Submits to `POST /v1/feedback`.

## 12.2 Confidence Badge Component

`ConfidenceBadge.tsx` â€” Circular progress ring (48px) with color by range. Shows "Empirically Validated â€” N cases" when knowledge context exists, or "AI Estimated" when it doesn't.

## 12.3 Stats Bar Component

`StatsBar.tsx` â€” 32px strip below nav on tool pages. Shows total analyses, substrate count, resolution rate. Pulls from `/v1/stats/public`.

## 12.4 Pending Feedback Banner

`PendingFeedbackBanner.tsx` â€” Shows on dashboard when user has analyses >24h old without feedback. "You have N analyses waiting for feedback." Dismissible.

## 12.5 Form Additions

Add to failure analysis form (optional fields):
- Industry select (8 options)
- Production Impact select (6 options)

## 12.6 Email Feedback Landing Page

`/feedback/[id]` â€” Landing page for follow-up email links. Shows analysis summary, pre-selects outcome from URL query param, renders FeedbackPrompt component.

---

# 13. CROSS-LINKING BETWEEN TOOLS

"Run Spec Analysis â†’" button on failure results pre-fills spec form with substrate_a, substrate_b, environment from the analysis. Adds context to spec prompt: "This spec follows a failure where the previous adhesive failed due to [root cause]. The new specification must address this."

Stored as `spec_requests.source_analysis_id`.

---

# 14. PRICING ADJUSTMENT

| Feature | Free | Pro ($49/mo) | Team ($149/mo) |
|---------|------|-------------|----------------|
| Analyses/month | 5 | Unlimited | Unlimited |
| Full AI results | âœ“ | âœ“ | âœ“ |
| Executive summary | Preview (blurred) | âœ“ Full | âœ“ Full |
| PDF export | Watermarked | Clean | Branded |
| History | Last 5 | Unlimited | Unlimited |
| Similar cases detail | Count only | Full | Full |
| API access | â€” | â€” | âœ“ |
| Team seats | 1 | 1 | 5 |

Free tier is the data collection engine. Gate the executive summary and PDF, not the analysis itself.

---

# 15. CRON JOBS & BACKGROUND SERVICES

**File:** `api/routers/cron.py` (NEW)

```python
from fastapi import APIRouter, HTTPException, Header
from config import settings
from services.feedback_email import send_pending_followups
from services.knowledge_aggregator import run_aggregation
from services.metrics_aggregator import aggregate_daily_metrics

router = APIRouter(prefix="/v1/cron", tags=["cron"])

@router.post("/send-followups")
async def trigger_followups(x_cron_secret: str = Header(...)):
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(403, "Invalid cron secret")
    return await send_pending_followups()

@router.post("/aggregate-knowledge")
async def trigger_aggregation(x_cron_secret: str = Header(...)):
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(403, "Invalid cron secret")
    return await run_aggregation()

@router.post("/aggregate-metrics")
async def trigger_metrics(x_cron_secret: str = Header(...)):
    if x_cron_secret != settings.CRON_SECRET:
        raise HTTPException(403, "Invalid cron secret")
    return await aggregate_daily_metrics()
```

| Job | Schedule | Endpoint |
|-----|----------|----------|
| Metrics aggregation | Daily 1am UTC | `POST /v1/cron/aggregate-metrics` |
| Knowledge aggregation | Daily 2am UTC | `POST /v1/cron/aggregate-knowledge` |
| Follow-up emails | Daily 9am UTC | `POST /v1/cron/send-followups` |

All require `X-Cron-Secret` header.

---

# 16. SPRINT PLAN & DEPLOYMENT SEQUENCE

| Sprint | Days | What Ships |
|--------|------|-----------|
| **Sprint 1** | 1-2 | SQL migrations 001-004. Normalizer, classifier, updated analyze endpoint. Existing analyses start capturing structured data. |
| **Sprint 2** | 3-5 | Feedback API + email service + cron endpoints. FeedbackPrompt component on results. Email landing page. Feedback begins flowing. |
| **Sprint 3** | 6-8 | Knowledge aggregator + context builder + modified AI prompts. Analyses now get knowledge injection. |
| **Sprint 4** | 9-10 | Request logger middleware + AI telemetry + metrics aggregator. Observability pipeline live. |
| **Sprint 5** | 11-13 | Admin dashboard (all 5 API endpoints + all 5 frontend pages). Stats bar + confidence badges. |
| **Sprint 6** | 14-15 | Case library (seed + auto-gen + browse/detail pages). Cross-linking. Form additions. Cron jobs configured. |

**Deploy order within each sprint:** Database first â†’ Backend services â†’ API endpoints â†’ Frontend components.

---

# 17. VERIFICATION CHECKLIST

```
SPRINT 1
[ ] New columns exist on failure_analyses and spec_requests
[ ] New tables created (analysis_feedback, knowledge_patterns, ai_engine_logs, api_request_logs, daily_metrics, admin_audit_log)
[ ] Submit test analysis â†’ substrate_a_normalized and root_cause_category populated
[ ] Admin role set on your user account

SPRINT 2
[ ] POST /v1/feedback returns 201 with valid payload
[ ] FeedbackPrompt renders at bottom of analysis results
[ ] Thumbs up/down creates row in analysis_feedback
[ ] Root cause confirmation updates same row
[ ] /feedback/[id]?outcome=resolved landing page works
[ ] Cron followup endpoint sends email (test with your own analysis)

SPRINT 3
[ ] Manual POST /v1/cron/aggregate-knowledge creates knowledge_patterns rows
[ ] Submit analysis for substrate pair with existing patterns â†’ knowledge context injected
[ ] AI response references "Gravix database" or "confirmed cases" in output
[ ] knowledge_context field populated in ai_engine_logs

SPRINT 4
[ ] api_request_logs populating on every API call
[ ] ai_engine_logs populating with token counts, latency, cost
[ ] POST /v1/cron/aggregate-metrics creates daily_metrics row

SPRINT 5
[ ] /admin pages gated to admin role (non-admin gets 403 redirect)
[ ] /admin/overview shows live today numbers + totals
[ ] /admin/ai-engine shows latency, cost, knowledge impact
[ ] /admin/engagement shows feedback funnel + top users
[ ] /admin/knowledge shows calibration accuracy + patterns
[ ] /admin/system shows endpoint performance + errors
[ ] Stats bar appears on /tool and /failure pages
[ ] Confidence badge shows Empirically Validated vs AI Estimated

SPRINT 6
[ ] Case library has 6 seed cases visible at /cases
[ ] Case detail pages SEO-indexed at /cases/[slug]
[ ] Resolved feedback triggers auto case generation
[ ] "Run Spec Analysis" on failure results pre-fills spec form
[ ] Industry + Production Impact fields on failure form
[ ] All 3 cron jobs configured and running
```

---

# 18. KEY METRICS TO TRACK

| Metric | What It Tells You | Healthy Target |
|--------|------------------|----------------|
| **Knowledge coverage %** | % of analyses receiving empirical context | >30% by month 6 |
| **Calibration top-1 accuracy** | Is AI's #1 root cause actually correct? | >60% |
| **Confidence lift** | Does knowledge injection improve quality? | >10% lift |
| **Feedback rate** | Are users contributing data back? | >20% |
| **Resolution rate** | Are users fixing their problems? | >70% |
| **Cost per analysis** | Are unit economics sustainable? | <$0.15 |
| **Returning user %** | Are people coming back? | >25% weekly |
| **Freeâ†’Pro conversion** | Is the business model working? | >5% of active free |
| **MRR** | Revenue | Growing month over month |
| **AI error rate** | System reliability | <2% |
| **P95 latency** | User experience | <10s |

---

## NEW FILES CREATED (Summary)

| File | Type | Section |
|------|------|---------|
| `database/migrations/001_v1_1_structured_fields.sql` | Migration | 2.1 |
| `database/migrations/002_v1_1_feedback_knowledge.sql` | Migration | 2.2 |
| `database/migrations/003_v1_1_observability.sql` | Migration | 2.3 |
| `database/migrations/004_v1_1_seed_cases.sql` | Migration | 2.4 |
| `api/auth/admin.py` | Backend | 3.1 |
| `api/routers/feedback.py` | Backend | 4.1 |
| `api/services/feedback_email.py` | Backend | 4.2 |
| `api/utils/normalizer.py` | Backend | 5.1 |
| `api/utils/classifier.py` | Backend | 5.2 |
| `api/services/knowledge_aggregator.py` | Backend | 5.3 |
| `api/services/knowledge_context.py` | Backend | 6.1 |
| `api/services/ai_telemetry.py` | Backend | 7.1 |
| `api/middleware/request_logger.py` | Backend | 8.1 |
| `api/services/metrics_aggregator.py` | Backend | 8.2 |
| `api/routers/admin.py` | Backend | 9 |
| `api/routers/stats.py` | Backend | 9.1 |
| `api/routers/cron.py` | Backend | 15 |
| `frontend/components/results/FeedbackPrompt.tsx` | Frontend | 12.1 |
| `frontend/components/results/ConfidenceBadge.tsx` | Frontend | 12.2 |
| `frontend/components/layout/StatsBar.tsx` | Frontend | 12.3 |
| `frontend/components/dashboard/PendingFeedbackBanner.tsx` | Frontend | 12.4 |
| `frontend/app/feedback/[id]/page.tsx` | Frontend | 12.6 |
| `frontend/app/(admin)/admin/layout.tsx` | Frontend | 10.2 |
| `frontend/app/(admin)/admin/page.tsx` | Frontend | 10.3 |
| `frontend/app/(admin)/admin/ai-engine/page.tsx` | Frontend | 10.3 |
| `frontend/app/(admin)/admin/engagement/page.tsx` | Frontend | 10.3 |
| `frontend/app/(admin)/admin/knowledge/page.tsx` | Frontend | 10.3 |
| `frontend/app/(admin)/admin/system/page.tsx` | Frontend | 10.3 |

## EXISTING FILES MODIFIED

| File | What Changes | Section |
|------|-------------|---------|
| `api/main.py` | Add middleware + register new routers (feedback, admin, stats, cron) | 8.1, 15 |
| `api/services/ai_engine.py` | Add knowledge injection + AI telemetry logging | 6.3, 7.1 |
| `api/prompts/failure_analysis.py` | Append knowledge injection addendum to system prompt | 6.2 |
| `api/prompts/spec_engine.py` | Append knowledge injection addendum | 6.2 |
| `api/routers/analyze.py` | Add normalizer + classifier calls after AI response | 5.1, 5.2 |
| `api/schemas/analysis.py` | Add optional industry + production_impact fields | 12.5 |
| `frontend/app/(app)/analyze/[id]/page.tsx` | Add FeedbackPrompt + ConfidenceBadge | 12.1, 12.2 |
| `frontend/components/forms/FailureIntakeForm.tsx` | Add industry + production_impact fields | 12.5 |

## ENVIRONMENT VARIABLES TO ADD

```
CRON_SECRET=your_random_secret_here
ADMIN_SECRET=your_admin_secret_here
```

---

**END OF GRAVIX V2 TECHNICAL SPECIFICATION**

*Document Version: 2.0*
*Last Updated: February 2026*

---


