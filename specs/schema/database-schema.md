# Gravix Database Schema — Complete Reference

> Combined from gravix-final-prd.md Parts II and III. All SQL migrations and table definitions.
>
> **Stack:** Supabase (PostgreSQL) with RLS enabled on all tables.
> **Rule:** Never DROP columns or tables. All new columns NULLABLE or with DEFAULTs.

---

## V1 BASE TABLES (Pre-existing)

These tables exist from V1 deployment:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (Supabase Auth managed) |
| `failure_analyses` | Failure analysis submissions + AI results |
| `spec_requests` | Spec engine submissions + AI results |
| `case_library` | Published case studies (SEO-indexed) |
| `product_specifications` | Product TDS data (name, manufacturer, chemistry, specs) |

---

## V2 MIGRATIONS

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

-e 
---

## QUALITY MODULE (8D) DATA MODEL

> 15 new tables. All additive — no modifications to V2 tables.

Data Model

New Tables

**All tables are additive. No modifications to existing V2 tables.
Total: 15 new tables.**

investigations

  ------------------------ ------------- --------------------- -----------------------------------------------------------------------------
  **Column**               **Type**      **Description**       **Constraints**

  id                       UUID          Primary key           PK, DEFAULT gen_random_uuid()

  investigation_number     TEXT          Human-readable ID     UNIQUE, NOT NULL, GQ-YYYY-NNNN

  title                    TEXT          Investigation title   NOT NULL

  status                   TEXT          Workflow status       CHECK
                                                               (open\|containment\|investigating\|corrective_action\|verification\|closed)

  severity                 TEXT          Impact severity       CHECK (critical\|major\|minor)

  product_part_number      TEXT          Part or product ID    NULLABLE

  customer_name            TEXT          OEM customer name     NULLABLE

  customer_complaint_ref   TEXT          OEM reference number  NULLABLE

  lot_batch_number         TEXT          Affected lot/batch    NULLABLE

  defect_quantity          INTEGER       Number of defective   NULLABLE
                                         units                 

  scrap_rework_cost        DECIMAL       Financial impact (\$) NULLABLE

  analysis_id              UUID          FK to                 NULLABLE, FK
                                         failure_analyses      

  spec_id                  UUID          FK to spec_requests   NULLABLE, FK

  five_whys                JSONB         AI-generated 5-Why    NULLABLE
                                         chain                 

  escape_point             TEXT          Earliest missed       NULLABLE
                                         control point         

  fishbone_data            JSONB         Ishikawa categories   NULLABLE

  closure_summary          TEXT          Auto-generated D8     NULLABLE
                                         narrative             

  lessons_learned          TEXT          Free text lessons     NULLABLE

  publish_case             BOOLEAN       Opt-in to case        DEFAULT true
                                         library               

  report_template_key      TEXT          Selected 8D template  DEFAULT \'generic_8d\'

  source_email_id          TEXT          Inbound email message NULLABLE (set when created via email-in)
                                         ID                    

  created_by               UUID          FK to users           NOT NULL, FK

  created_at               TIMESTAMPTZ   Creation timestamp    DEFAULT now()

  updated_at               TIMESTAMPTZ   Last modified         DEFAULT now()

  closed_at                TIMESTAMPTZ   Closure timestamp     NULLABLE
  ------------------------ ------------- --------------------- -----------------------------------------------------------------------------

investigation_members

  ------------------ ------------- --------------------- -----------------------------------------
  **Column**         **Type**      **Description**       **Constraints**

  id                 UUID          Primary key           PK

  investigation_id   UUID          FK to investigations  NOT NULL, FK, ON DELETE CASCADE

  user_id            UUID          FK to users           NOT NULL, FK

  role               TEXT          Team role             CHECK
                                                         (champion\|team_lead\|member\|approver)

  added_at           TIMESTAMPTZ   When added to team    DEFAULT now()
  ------------------ ------------- --------------------- -----------------------------------------

investigation_actions

  ----------------------- ------------- --------------------- -----------------------------------------------------------------------------------------
  **Column**              **Type**      **Description**       **Constraints**

  id                      UUID          Primary key           PK

  investigation_id        UUID          FK to investigations  NOT NULL, FK, ON DELETE CASCADE

  discipline              TEXT          Which 8D step         CHECK (D3\|D5\|D6\|D7)

  action_type             TEXT          Category              CHECK (containment\|corrective\|verification\|preventive)

  category                TEXT          Change type           NULLABLE
                                                              (design_change\|process_change\|material_change\|training\|supplier_action\|doc_update)

  description             TEXT          Action description    NOT NULL

  owner_user_id           UUID          Responsible person    FK to users

  priority                TEXT          Urgency               CHECK (P1\|P2\|P3), DEFAULT P2

  due_date                DATE          Target completion     NULLABLE

  completed_date          DATE          Actual completion     NULLABLE

  status                  TEXT          Action status         CHECK (open\|in_progress\|complete\|cancelled), DEFAULT open

  verification_method     TEXT          How verified (D6      NULLABLE
                                        only)                 

  verification_criteria   TEXT          Pass/fail criteria    NULLABLE

  verification_result     TEXT          Actual result         NULLABLE

  evidence_urls           JSONB         Attached file URLs    DEFAULT \'\[\]\'

  created_at              TIMESTAMPTZ   Creation time         DEFAULT now()
  ----------------------- ------------- --------------------- -----------------------------------------------------------------------------------------

investigation_signatures

  ------------------ ------------- --------------------- -----------------
  **Column**         **Type**      **Description**       **Constraints**

  id                 UUID          Primary key           PK

  investigation_id   UUID          FK to investigations  NOT NULL, FK

  user_id            UUID          Who signed            NOT NULL, FK

  discipline         TEXT          Which step signed off NOT NULL

  signature_hash     TEXT          SHA-256 of content at NOT NULL
                                   sign time             

  signed_at          TIMESTAMPTZ   Signature timestamp   DEFAULT now()
  ------------------ ------------- --------------------- -----------------

investigation_attachments

  -------------------- ------------- ----------------------- -----------------
  **Column**           **Type**      **Description**         **Constraints**

  id                   UUID          Primary key             PK

  investigation_id     UUID          FK to investigations    NOT NULL, FK

  action_id            UUID          FK to                   NULLABLE, FK
                                     investigation_actions   

  discipline           TEXT          Which 8D step           NOT NULL

  file_name            TEXT          Original filename       NOT NULL

  file_url             TEXT          Storage URL             NOT NULL

  file_size_bytes      INTEGER       File size               NOT NULL

  is_image             BOOLEAN       Whether file is an      DEFAULT false
                                     image                   

  annotation_data      JSONB         Canvas annotation       NULLABLE
                                     overlay (JSON)          

  annotated_file_url   TEXT          Flattened annotated     NULLABLE
                                     image URL               

  original_file_url    TEXT          Pre-annotation original NULLABLE
                                     URL                     

  caption              TEXT          Image caption for       NULLABLE
                                     report                  

  sort_order           INTEGER       Display order within    DEFAULT 0
                                     discipline              

  uploaded_by          UUID          FK to users             NOT NULL, FK

  uploaded_at          TIMESTAMPTZ   Upload timestamp        DEFAULT now()
  -------------------- ------------- ----------------------- -----------------

investigation_comments

  -------------------- ------------- --------------------- -----------------
  **Column**           **Type**      **Description**       **Constraints**

  id                   UUID          Primary key           PK

  investigation_id     UUID          FK to investigations  NOT NULL, FK, ON
                                                           DELETE CASCADE

  discipline           TEXT          Which 8D step         NOT NULL (D1-D8)

  parent_comment_id    UUID          FK to self for        NULLABLE, FK
                                     replies               

  user_id              UUID          Comment author        NOT NULL, FK

  body                 TEXT          Comment content (rich NOT NULL
                                     text as HTML)         

  is_resolution        BOOLEAN       Marked as resolution  DEFAULT false

  is_pinned            BOOLEAN       Pinned to top         DEFAULT false

  is_external          BOOLEAN       From external         DEFAULT false
                                     participant           

  mentioned_user_ids   UUID\[\]      Users \@mentioned     DEFAULT \'{}\'

  image_urls           JSONB         Inline pasted images  DEFAULT \'\[\]\'

  edited_at            TIMESTAMPTZ   Last edit timestamp   NULLABLE

  created_at           TIMESTAMPTZ   Creation timestamp    DEFAULT now()
  -------------------- ------------- --------------------- -----------------

investigation_audit_log

**Immutable append-only table. No UPDATE or DELETE permissions granted
to any role.**

  --------------------- ------------- --------------------- ---------------------------------------------------------
  **Column**            **Type**      **Description**       **Constraints**

  id                    BIGSERIAL     Primary key           PK
                                      (auto-increment)      

  investigation_id      UUID          FK to investigations  NOT NULL, FK

  event_type            TEXT          Event category        NOT NULL (see F9.1 list)

  event_detail          TEXT          Human-readable        NOT NULL
                                      description           

  actor_user_id         UUID          Who performed the     NULLABLE (null = system)
                                      action                

  discipline            TEXT          Related discipline    NULLABLE

  target_type           TEXT          Entity acted on       NULLABLE
                                                            (investigation\|action\|comment\|attachment\|signature)

  target_id             UUID          ID of acted-on entity NULLABLE

  diff_data             JSONB         Field-level change    NULLABLE (old/new values)
                                      data                  

  ai_original_content   JSONB         Snapshot of AI output NULLABLE
                                      before human edit     

  ip_address            INET          Client IP for         NULLABLE
                                      anonymous access      
                                      events                

  created_at            TIMESTAMPTZ   Event timestamp       DEFAULT now(), NOT NULL
  --------------------- ------------- --------------------- ---------------------------------------------------------

notifications

  ------------------ ------------- --------------------- -----------------
  **Column**         **Type**      **Description**       **Constraints**

  id                 UUID          Primary key           PK

  user_id            UUID          Recipient             NOT NULL, FK

  investigation_id   UUID          Related investigation NOT NULL, FK

  event_type         TEXT          Notification type     NOT NULL

  title              TEXT          Notification headline NOT NULL

  body               TEXT          Detail text           NOT NULL

  link_path          TEXT          Deep link to relevant NOT NULL
                                   page                  

  is_read            BOOLEAN       Read status           DEFAULT false

  email_sent         BOOLEAN       Email delivery status DEFAULT false

  created_at         TIMESTAMPTZ   Notification          DEFAULT now()
                                   timestamp             
  ------------------ ------------- --------------------- -----------------

notification_preferences

  ---------------------- ------------- --------------------- -----------------
  **Column**             **Type**      **Description**       **Constraints**

  id                     UUID          Primary key           PK

  user_id                UUID          FK to users           NOT NULL, UNIQUE,
                                                             FK

  email_enabled          BOOLEAN       Global email toggle   DEFAULT true

  digest_mode            BOOLEAN       Daily digest instead  DEFAULT false
                                       of real-time          

  digest_hour_utc        INTEGER       Hour to send digest   DEFAULT 15
                                       (0-23 UTC)            

  quiet_start_utc        INTEGER       Quiet hours start     NULLABLE
                                       (0-23 UTC)            

  quiet_end_utc          INTEGER       Quiet hours end (0-23 NULLABLE
                                       UTC)                  

  event_overrides        JSONB         Per-event channel     DEFAULT \'{}\'
                                       preferences           

  muted_investigations   UUID\[\]      Investigations to     DEFAULT \'{}\'
                                       suppress              
  ---------------------- ------------- --------------------- -----------------

report_templates

  ---------------------- ------------- --------------------- -----------------------------------------------------------
  **Column**             **Type**      **Description**       **Constraints**

  id                     UUID          Primary key           PK

  org_id                 UUID          FK to organizations   NULLABLE (null = system template)

  template_key           TEXT          Template identifier   NOT NULL
                                                             (generic_8d\|ford_global\|vda_8d\|a3_report\|as9100_capa)

  display_name           TEXT          User-facing name      NOT NULL

  paper_size             TEXT          Default paper format  CHECK (letter\|a4), DEFAULT letter

  orientation            TEXT          Page orientation      CHECK (portrait\|landscape), DEFAULT portrait

  logo_url               TEXT          Company logo storage  NULLABLE (Enterprise only)
                                       URL                   

  brand_primary_color    TEXT          Hex color for headers NULLABLE

  brand_accent_color     TEXT          Hex color for accents NULLABLE

  company_info           JSONB         Name, address,        NULLABLE
                                       contact               

  custom_fields          JSONB         Up to 10 custom field DEFAULT \'\[\]\'
                                       definitions           

  hide_gravix_branding   BOOLEAN       White-label mode      DEFAULT false (Enterprise only)

  section_config         JSONB         Section labels,       DEFAULT \'{}\'
                                       order, visibility     
                                       overrides             

  is_default             BOOLEAN       Organization default  DEFAULT false
                                       template              
  ---------------------- ------------- --------------------- -----------------------------------------------------------

product_specifications

**Core of the TDS intelligence layer. Populated by AI extraction from
uploaded TDS PDFs and manual entry.**

  ---------------------------- ------------- --------------------- -------------------------------------------------------------------------------------------------
  **Column**                   **Type**      **Description**       **Constraints**

  id                           UUID          Primary key           PK

  product_name                 TEXT          Commercial product    NOT NULL
                                             name                  

  manufacturer                 TEXT          Manufacturer name     NOT NULL

  chemistry_type               TEXT          Adhesive chemistry    NOT NULL
                                                                   (epoxy\|cyanoacrylate\|polyurethane\|silicone\|acrylic\|anaerobic\|MS_polymer\|phenolic\|other)

  recommended_substrates       TEXT\[\]      TDS-listed substrates DEFAULT \'{}\'

  surface_prep_requirements    TEXT          Prep instructions     NULLABLE
                                             from TDS              

  cure_schedule                JSONB         Cure parameters       {type, temp_min_c, temp_max_c, time_min_hrs, time_max_hrs, humidity_range}

  operating_temp_min_c         DECIMAL       Min service temp (°C) NULLABLE

  operating_temp_max_c         DECIMAL       Max service temp (°C) NULLABLE

  mechanical_properties        JSONB         Strength data from    {lap_shear_mpa, t_peel_n_mm, impact_kj_m2, elongation_pct}
                                             TDS                   

  mix_ratio                    TEXT          Mixing ratio (2-part) NULLABLE

  pot_life_minutes             INTEGER       Working time after    NULLABLE
                                             mix                   

  fixture_time_minutes         INTEGER       Time to handling      NULLABLE
                                             strength              

  full_cure_hours              INTEGER       Time to full strength NULLABLE

  shelf_life_months            INTEGER       Unopened shelf life   NULLABLE

  tds_pdf_url                  TEXT          Original TDS file URL NULLABLE

  extraction_confidence        JSONB         Per-field extraction  DEFAULT \'{}\'
                                             confidence            

  field_failure_count          INTEGER       Total documented      DEFAULT 0
                                             failures              

  field_failure_rate           DECIMAL       Failure rate from     NULLABLE (computed)
                                             Gravix data           

  verified_by_user_id          UUID          Human who reviewed    NULLABLE, FK
                                             extraction            

  manufacturer_claimed         BOOLEAN       Manufacturer verified DEFAULT false
                                             listing               

  manufacturer_org_id          UUID          FK to manufacturer    NULLABLE, FK
                                             org account           

  manufacturer_verified_at     TIMESTAMPTZ   When claim was        NULLABLE
                                             approved              

  manufacturer_contact_email   TEXT          Manufacturer outreach NULLABLE
                                             email                 

  claimed_tds_version          TEXT          TDS revision          NULLABLE
                                             manufacturer          
                                             confirmed             

  page_published               BOOLEAN       Product perf page     DEFAULT false
                                             live                  

  page_slug                    TEXT          URL slug for perf     NULLABLE, UNIQUE
                                             page                  

  created_at                   TIMESTAMPTZ   Creation timestamp    DEFAULT now()

  updated_at                   TIMESTAMPTZ   Last modified         DEFAULT now()
  ---------------------------- ------------- --------------------- -------------------------------------------------------------------------------------------------

visual_analysis_results

  --------------------------- ------------- --------------------- ----------------------------------------
  **Column**                  **Type**      **Description**       **Constraints**

  id                          UUID          Primary key           PK

  analysis_id                 UUID          FK to                 NOT NULL, FK
                                            failure_analyses      

  image_url                   TEXT          Source image URL      NOT NULL

  image_hash                  TEXT          SHA-256 for           NOT NULL
                                            deduplication         

  ai_failure_mode             TEXT          AI visual             NULLABLE
                                            classification        (adhesive\|cohesive\|mixed\|substrate)

  ai_visual_findings          JSONB         Detailed visual       NULLABLE
                                            observations          

  ai_confidence               DECIMAL       Visual classification NULLABLE (0-1)
                                            confidence            

  confirmed_failure_mode      TEXT          Human-verified        NULLABLE
                                            classification        

  confirmed_root_cause        TEXT          From closed           NULLABLE
                                            investigation         

  substrate_pair_normalized   TEXT          Normalized substrates NULLABLE

  adhesive_chemistry          TEXT          Adhesive type         NULLABLE

  environment_tags            TEXT\[\]      Environmental         DEFAULT \'{}\'
                                            conditions            

  is_reference_image          BOOLEAN       Eligible for AI       DEFAULT false
                                            reference set         

  created_at                  TIMESTAMPTZ   Creation timestamp    DEFAULT now()
  --------------------------- ------------- --------------------- ----------------------------------------

pattern_alerts

  ---------------------------- ------------- --------------------- ------------------------------------------------------------------
  **Column**                   **Type**      **Description**       **Constraints**

  id                           UUID          Primary key           PK

  alert_type                   TEXT          Pattern category      NOT NULL
                                                                   (time_cluster\|geographic\|product_lot\|seasonal\|cross_product)

  severity                     TEXT          Alert level           CHECK (informational\|warning\|critical)

  title                        TEXT          Alert headline        NOT NULL

  description                  TEXT          AI-generated          NOT NULL
                                             explanation           

  affected_product             TEXT          Product name if       NULLABLE
                                             applicable            

  affected_substrates          TEXT          Substrate pair if     NULLABLE
                                             applicable            

  affected_failure_mode        TEXT          Failure mode if       NULLABLE
                                             applicable            

  statistical_confidence       DECIMAL       Z-score or p-value    NOT NULL

  baseline_rate                DECIMAL       Expected failure rate NOT NULL

  observed_rate                DECIMAL       Current failure rate  NOT NULL

  window_days                  INTEGER       Detection window      NOT NULL

  affected_investigation_ids   UUID\[\]      Related               DEFAULT \'{}\'
                                             investigations        

  affected_org_count           INTEGER       Number of orgs        NOT NULL
                                             affected              

  hypothesis                   TEXT          AI-suggested          NULLABLE
                                             explanation           

  status                       TEXT          Alert lifecycle       CHECK (active\|acknowledged\|resolved\|dismissed), DEFAULT active

  created_at                   TIMESTAMPTZ   Detection timestamp   DEFAULT now()

  resolved_at                  TIMESTAMPTZ   Resolution timestamp  NULLABLE
  ---------------------------- ------------- --------------------- ------------------------------------------------------------------

investigation_sessions

  ---------------------- ------------- --------------------- ----------------------------------------
  **Column**             **Type**      **Description**       **Constraints**

  id                     UUID          Primary key           PK

  analysis_id            UUID          FK to                 NULLABLE, FK
                                       failure_analyses      

  investigation_id       UUID          FK to investigations  NULLABLE, FK

  user_id                UUID          FK to users           NOT NULL, FK

  mode                   TEXT          Investigation type    CHECK (quick\|guided)

  status                 TEXT          Session state         CHECK
                                                             (active\|paused\|completed\|abandoned)

  conversation_history   JSONB         Full message array    DEFAULT \'\[\]\'

  tool_calls             JSONB         Record of AI tool     DEFAULT \'\[\]\'
                                       invocations           

  extracted_data         JSONB         Structured data from  NULLABLE
                                       conversation          

  final_analysis         JSONB         Generated summary at  NULLABLE
                                       completion            

  message_count          INTEGER       Number of turns       DEFAULT 0

  ai_token_usage         INTEGER       Total tokens consumed DEFAULT 0

  created_at             TIMESTAMPTZ   Session start         DEFAULT now()

  updated_at             TIMESTAMPTZ   Last message          DEFAULT now()
  ---------------------- ------------- --------------------- ----------------------------------------

rate_limits

  ------------------ ------------- --------------------- --------------------------------
  **Column**         **Type**      **Description**       **Constraints**

  id                 UUID          Primary key           PK, DEFAULT gen_random_uuid()

  user_id            UUID          User being rate       FK to auth.users, NULLABLE
                                   limited               (IP-based if null)

  ip_address         INET          Client IP for         NULLABLE
                                   unauthenticated       
                                   limits                

  endpoint           TEXT          API endpoint path     NOT NULL

  window_key         TEXT          Rate window           NOT NULL, e.g. \'hourly\',
                                   identifier            \'monthly\', \'per_session\'

  window_start       TIMESTAMPTZ   Current window start  NOT NULL
                                   time                  

  request_count      INTEGER       Requests in current   DEFAULT 0
                                   window                

  limit_value        INTEGER       Maximum allowed in    NOT NULL
                                   window                

  plan_tier          TEXT          User plan at time of  free\|pro\|quality\|enterprise
                                   check                 
  ------------------ ------------- --------------------- --------------------------------

Composite index on (user_id, endpoint, window_key). TTL cleanup: cron
deletes rows where window_start \< now() - 60 days. Rate limit checks
use SELECT \... FOR UPDATE to prevent race conditions under concurrent
requests.

API Specification

  ------------ ---------------------------------------------- ----------------------------- ----------------------
  **Method**   **Endpoint**                                   **Description**               **Notes**

  POST         /v1/investigations                             Create investigation          Auth required,
                                                                                            Quality+ plan

  GET          /v1/investigations                             List user\'s investigations   Filterable: status,
                                                                                            severity, customer

  GET          /v1/investigations/:id                         Get investigation detail      Auth + team member
                                                                                            access

  PATCH        /v1/investigations/:id                         Update investigation fields   Auth + Team
                                                                                            Lead/Champion only

  POST         /v1/investigations/:id/team                    Add team member               Auth + Team
                                                                                            Lead/Champion

  DELETE       /v1/investigations/:id/team/:uid               Remove team member            Auth + Team
                                                                                            Lead/Champion

  POST         /v1/investigations/:id/analyze                 Run AI root cause analysis    Triggers full Gravix
                                                              (D4)                          analysis pipeline

  POST         /v1/investigations/:id/actions                 Add action item (D3/D5/D6/D7) Auth + team member

  PATCH        /v1/investigations/:id/actions/:aid            Update action item            Auth + action owner or
                                                                                            Team Lead

  POST         /v1/investigations/:id/attachments             Upload file attachment        Max 20MB, Auth + team
                                                                                            member

  POST         /v1/investigations/:id/sign/:discipline        Electronic sign-off           Auth + Approver (D8)
                                                                                            or Team Lead

  POST         /v1/investigations/:id/close                   Close investigation           Requires all D1-D7
                                                                                            complete + approver
                                                                                            sign

  GET          /v1/investigations/:id/report                  Generate 8D report (PDF/DOCX) Auth + team member

  GET          /v1/investigations/:id/share                   Generate shareable read-only  Auth + Team
                                                              link                          Lead/Champion

  GET          /v1/investigations/:id/revisions               List report revision history  Auth + team member

  POST         /v1/investigations/:id/spec                    Generate corrected            Cross-links to spec
                                                              specification                 engine

  POST         /v1/investigations/:id/comments                Add comment to discipline     Auth + team/external
                                                                                            member

  PATCH        /v1/investigations/:id/comments/:cid           Edit or pin comment           Auth + comment author
                                                                                            or Team Lead

  DELETE       /v1/investigations/:id/comments/:cid           Delete comment                Auth + comment author
                                                                                            or Team Lead

  POST         /v1/investigations/:id/comments/:cid/resolve   Mark comment as resolution    Auth + Team Lead only

  POST         /v1/investigations/:id/photos                  Upload photo to discipline    Auth + team member,
                                                                                            max 20MB

  PUT          /v1/investigations/:id/photos/:pid/annotate    Save annotation overlay       Auth + team member

  GET          /v1/investigations/:id/audit-log               Get investigation audit trail Auth + team member,
                                                                                            exportable

  GET          /v1/investigations/:id/audit-log/export        Export audit log (CSV/PDF)    Auth + Team
                                                                                            Lead/Approver

  POST         /v1/inbound/email                              Webhook: inbound email        SendGrid/Resend
                                                              processing                    webhook, secret
                                                                                            validation

  GET          /v1/notifications                              List user notifications       Auth required,
                                                                                            paginated

  PATCH        /v1/notifications/read                         Mark notifications as read    Auth required, accepts
                                                                                            array of IDs

  GET          /v1/notifications/preferences                  Get notification preferences  Auth required

  PUT          /v1/notifications/preferences                  Update notification           Auth required
                                                              preferences                   

  GET          /v1/report-templates                           List available templates      Auth + Quality+ plan

  GET          /v1/report-templates/:key                      Get template details          Auth + plan-gated per
                                                                                            template

  PUT          /v1/report-templates/org-default               Set org default template      Auth + admin role

  PUT          /v1/report-templates/branding                  Update custom branding        Auth + Enterprise plan
                                                                                            only

  POST         /v1/analyze/visual                             Run visual failure analysis   Auth required, rate
                                                              with images                   limited, images as
                                                                                            multipart/form-data

  POST         /v1/analyze/guided                             Start guided investigation    Auth required, rate
                                                              session                       limited, returns
                                                                                            session_id

  POST         /v1/analyze/guided/:sid/reply                  Send reply in guided          Auth required,
                                                              investigation                 per-session rate limit

  GET          /v1/analyze/guided/:sid                        Get session state and history Auth, session owner
                                                                                            only

  POST         /v1/products                                   Add product to specifications Auth + admin or via
                                                              DB                            TDS upload

  GET          /v1/products                                   Search product specifications Auth,
                                                                                            autocomplete-enabled

  GET          /v1/products/:id                               Get product detail + field    Auth required
                                                              stats                         

  POST         /v1/products/extract-tds                       Upload TDS PDF for AI         Auth, max 10MB PDF
                                                              extraction                    

  GET          /v1/products/:id/field-performance             Get field failure stats for   Auth + Enterprise plan
                                                              product                       

  GET          /v1/products/compare                           Cross-vendor product          Auth + Enterprise,
                                                              comparison                    query: product_ids\[\]

  GET          /v1/alerts                                     List active pattern alerts    Auth + admin or
                                                                                            Enterprise

  PATCH        /v1/alerts/:id                                 Acknowledge/resolve/dismiss   Auth + admin
                                                              alert                         

  GET          /v1/alerts/:id                                 Get alert detail with         Auth + affected team
                                                              investigations                member

  POST         /v1/cron/detect-patterns                       Trigger pattern detection job X-Cron-Secret required

  GET          /v1/intelligence/trends                        Monthly trend intelligence    Auth + Enterprise plan
                                                              data                          

  GET          /v1/products/public                            Public product index          No auth, SEO crawlable
                                                              (paginated)                   

  GET          /v1/products/public/:manufacturer/:slug        Public product performance    No auth, min 10
                                                              page data                     applications

  POST         /v1/products/:id/claim                         Manufacturer claims product   Auth + manufacturer
                                                              listing                       org type (future)
  ------------ ---------------------------------------------- ----------------------------- ----------------------

AI Prompt Specifications

The 8D module adds three new AI prompt templates that extend the
existing failure analysis system prompt, plus one email parsing prompt.
No new AI model or API integration required --- these are additional
prompt templates sent to the same Claude API endpoint.

Prompt 1: 5-Why Chain Generator

Input: Top-ranked root cause from failure analysis + failure
description + substrate pair.

Output: JSON array of 5 levels, each with {level: 1-5, question: \"Why
did X happen?\", answer: \"Because Y\", evidence: \"supporting
detail\"}. The 5th Why should reach a systemic root cause (process gap,
training gap, or design gap) not a proximate cause.

Prompt 2: 8D Narrative Generator

Input: Complete investigation data (D1-D7 fields), failure analysis
results, knowledge context, action items with statuses.

Output: Formatted prose narrative for each discipline section, written
in the formal, third-person style expected by OEM quality auditors. Must
use passive voice and technical language appropriate for
automotive/aerospace quality documentation. Cites confidence scores and
empirical data from Gravix knowledge base where available.

Prompt 3: Escape Point Analyzer

Input: Root cause analysis results + production process description
(from 5W2H \"Where in process\" field).

Output: {escape_point: string, control_type:
\"inspection\|test\|SPC\|audit\", why_missed: string,
recommended_control: string}. Identifies the earliest point in the
production flow where the root cause could have been detected and
explains why the existing control failed.

Prompt 4: Inbound Email Parser

Input: Raw email subject + body + list of attachment filenames.

Output: JSON object with extracted fields: {title: string,
customer_name: string\|null, complaint_ref: string\|null, part_number:
string\|null, failure_description: string, affected_quantity:
number\|null, severity_guess: \"critical\|major\|minor\", confidence:
number}. Uses regex patterns for common OEM reference formats and NLP
extraction for unstructured complaint text.

Prompt 5: Visual Failure Classifier

Input: One or more images of the fracture surface or failed assembly
(base64 multimodal content blocks) + text description from engineer +
substrate pair + adhesive type (if known).

Output: {failure_mode: \"adhesive\|cohesive\|mixed\|substrate\",
visual_indicators: \[{indicator: string, location: string, significance:
string}\], surface_condition: string, bond_line_assessment: string,
coverage_estimate_pct: number, contradiction_with_text: string\|null,
confidence: number, auto_caption: string}. The auto_caption is a
publication-ready figure caption for the 8D report. If the visual
classification contradicts the text description, the AI must flag the
contradiction explicitly.

Prompt 6: TDS Extraction

Input: TDS PDF content (as document content block or extracted text).

Output: Structured JSON matching the product_specifications table
schema. Each field includes an extraction_confidence rating (high:
clearly stated in TDS, medium: inferred from context, low: approximate
or ambiguous). Fields not found in the TDS are returned as null. The AI
should also extract warnings, limitations, and incompatible substrates
as a separate warnings array.

Prompt 7: Guided Investigation Orchestrator

Input: Conversation history (message array), current analysis state
(accumulated data from previous answers), available tools
(lookup_product_tds, search_similar_cases,
check_specification_compliance, generate_5why), knowledge context from
knowledge_patterns table if available.

Output: {next_action:
\"ask_question\|call_tool\|present_findings\|request_photo\|generate_summary\",
question?: string, tool_call?: {name: string, params: object},
findings?: string, summary?: AnalysisResult}. The orchestrator decides
at each turn whether to ask another question, invoke an internal tool,
or present findings. It targets completing the investigation in 5-8
turns, prioritizing questions by information value (which question would
most narrow the root cause hypothesis space).

Prompt 8: Pattern Cluster Detector

Input: Aggregated case statistics for the detection window: failure
counts per product/substrate/failure_mode combination for current period
vs. historical baseline, geographic distribution of recent failures,
temporal distribution.

Output: Array of detected clusters, each with: {alert_type, title,
description, affected_entities, statistical_confidence, hypothesis,
severity, recommended_action}. The hypothesis should propose a plausible
explanation (formulation change, seasonal effect, supply chain issue)
and the recommended action should be specific and actionable.

Frontend Specifications

New Pages

  -------------------------------------------- -------------------------------------------------
  **Route**                                    **Description**

  **/investigations**                          Investigation list with search, filter (status,
                                               severity, customer, date range), sort, and
                                               kanban/list toggle. Shows: investigation number,
                                               title, customer, severity badge, status badge,
                                               team lead, last updated, days open.

  **/investigations/new**                      Create investigation form. Two paths: (1) blank
                                               form, (2) pre-filled from existing analysis ID
                                               passed as query param. Validates required fields.
                                               Shows team member selector with email invite.

  **/investigations/\[id\]**                   Investigation detail --- the main workspace.
                                               Vertical stepper showing D1-D8 as collapsible
                                               sections. Active step expanded, completed steps
                                               collapsed with green checkmarks, future steps
                                               grayed. Each section shows its fields, action
                                               items, attachments, and sign-off status.

  **/investigations/\[id\]/report**            8D report preview. Full rendered preview of the
                                               PDF with \"Download PDF\", \"Download DOCX\", and
                                               \"Create Shareable Link\" buttons. Shows revision
                                               selector dropdown.

  **/investigations/\[id\]/share/\[token\]**   Read-only shared view. No auth required. Shows
                                               the 8D report content with Gravix branding. OEM
                                               customer quality reps use this link to review
                                               without creating an account.

  **/notifications**                           Full notification history page. Filterable by
                                               investigation and event type. Mark as read
                                               individually or in bulk. Link to notification
                                               preferences settings.

  **/products**                                Public product index page. Searchable/filterable
                                               catalog of all products with published
                                               performance pages. Sorted by total documented
                                               applications. No auth required. SEO-optimized
                                               with structured data markup.

  **/products/\[manufacturer\]/\[product\]**   Public product performance page. Shows TDS specs,
                                               field failure rate, common failure modes, common
                                               root causes, related case library entries. CTAs
                                               for signup and free diagnosis. No auth required.
                                               Minimum 10 documented applications to publish.

  **/analyze/guided**                          Guided investigation mode. Chat-like interface
                                               showing AI questions and user responses.
                                               Real-time root cause ranking sidebar updates as
                                               answers narrow the hypothesis space. Tool-use
                                               indicators (\"Searching similar cases\...\").
                                               Session pause/resume. One-click convert to 8D
                                               investigation at completion.

  **/alerts**                                  Pattern alerts dashboard (admin/Enterprise).
                                               Active alerts with trend charts, affected
                                               investigation links, severity badges.
                                               Acknowledge/resolve/dismiss actions. Filter by
                                               alert type and severity.
  -------------------------------------------- -------------------------------------------------

Modified Pages

-   Dashboard (/dashboard): Add \"Investigations\" card showing: N open,
    N overdue actions, N awaiting closure. Click navigates to
    /investigations.

-   Analysis Results (/analyze/\[id\]): Add \"Create 8D Investigation\"
    button below the existing FeedbackPrompt component. Passes
    analysis_id as query param to /investigations/new.

-   Navigation: Add \"Investigations\" link in main nav between
    \"History\" and \"Cases\". Badge shows count of open investigations.
    Add bell icon (notification center) in top-right header with unread
    count.

-   Settings (/settings): Add \"Notifications\" tab for notification
    preferences (digest mode, quiet hours, per-event toggles). Add
    \"Report Templates\" tab for Enterprise branding (logo upload,
    colors, company info).

Investigation Detail Page Components

The /investigations/\[id\] page is the primary workspace and the most
complex new page. It consists of the following components:

-   Header bar: Investigation number, title, status badge, severity
    badge, customer name, days open counter, \"Generate Report\" button

-   Discipline stepper (left column, 70% width): Vertical accordion with
    D1-D8 sections. Active step expanded, completed steps show green
    checkmark, future steps grayed. Each section contains its form
    fields, action items, photo gallery with annotation capability, and
    sign-off button.

-   Comment panel (right column, 30% width): Tabbed by discipline. Shows
    threaded comments with \@mentions, resolution markers, pinned
    comments at top. Comment composer at bottom with rich text toolbar
    and image paste.

-   Tabs below stepper: \"Actions\" (filterable list of all action items
    across disciplines), \"Photos\" (gallery view of all annotated
    images), \"History\" (audit log timeline with filters), \"Report\"
    (preview and export).

-   Photo annotation modal: Opens on click of any uploaded image.
    Full-screen canvas with annotation toolbar (draw, circle, arrow,
    rectangle, text, color picker). Save/cancel buttons. Side-by-side
    toggle for original vs. annotated.

Pricing Model

  ------------------- -------------- -------------- ---------------- --------------
  **Feature**         **Free (\$0)** **Pro          **Quality        **Enterprise
                                     (\$79/mo)**    (\$299/mo)**     (\$799/mo)**

  **Failure           5/month        Unlimited      Unlimited        Unlimited
  Analyses**          (account                                       
                      req\'d)                                        

  **Spec Analyses**   5/month        Unlimited      Unlimited        Unlimited
                      (account                                       
                      req\'d)                                        

  **8D                None           None           Unlimited        Unlimited
  Investigations**                                                   

  **Seats**           1              1              3 included       10 included
                                                    (+\$79/ea)       (+\$49/ea)

  **Photo             N/A            N/A            Full tools       Full tools
  Annotation**                                                       

  **Comments &        N/A            N/A            Full (team only) Full +
  Threads**                                                          external
                                                                     guests

  **Audit Log**       N/A            N/A            View only        View + CSV/PDF
                                                                     export

  **Email-In          N/A            N/A            1 inbound        Unlimited +
  Creation**                                        address          routing rules

  **Notifications**   N/A            N/A            Email + in-app   Email +
                                                                     in-app +
                                                                     digest

  **Report            N/A            N/A            Generic + 1 OEM  All
  Templates**                                                        templates +
                                                                     custom

  **8D Report PDF**   N/A            N/A            Gravix-branded   Custom
                                                                     branding

  **Shareable Links** N/A            N/A            5 active         Unlimited

  **API Access**      No             No             No               Yes

  **SSO / SAML**      No             No             No               Yes

  **Exec Summary**    Blurred        Full access    Full access      Full access
                      preview                                        

  **Knowledge Data**  Case count     Full detail    Full detail      Full detail +
                      only                                           export
  ------------------- -------------- -------------- ---------------- --------------

Revenue Projections

  -------------- ----------- ----------- ----------- ------------- -------------
  **Metric**     **Month 6** **Year 1**  **Year 2**  **Year 3      **Year 3
                                                     (Base)**      (Bull)**

  **Free Users** 500         2,000       6,000       15,000        25,000

  **Pro (\$79)** 20          80          250         500           800

  **Quality      3           15          50          150           250
  (\$299)**                                                        

  **Enterprise   0           2           8           25            40
  (\$799)**                                                        

  **MRR**        \$2,477     \$12,403    \$41,092    \$104,325     \$169,910

  **ARR**        \$29,724    \$148,836   \$493,104   \$1,251,900   \$2,038,920
  -------------- ----------- ----------- ----------- ------------- -------------

Key assumptions: 3% free-to-Pro conversion, 5% Pro-to-Quality upgrade,
15% Quality-to-Enterprise upgrade for companies with 5+ active
investigators. Quality tier extra seat revenue not modeled above
(conservative). Enterprise deals assume 6-month sales cycle beginning
Month 4.

-e 
---

## OBSERVABILITY TABLES

> From Part IX. Role system, audit log, metrics tables.

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

