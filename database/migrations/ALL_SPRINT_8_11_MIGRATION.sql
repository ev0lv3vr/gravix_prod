-- Sprint 8: Add shareable link columns to investigations
alter table if exists public.investigations
  add column if not exists share_token text unique,
  add column if not exists share_expires_at timestamptz;

create index if not exists idx_investigations_share_token
  on public.investigations(share_token) where share_token is not null;
-- Sprint 9-10: Additional OEM report templates
INSERT INTO public.report_templates (template_name, template_type, template_config, tier_required)
VALUES
  ('VW/VDA 8D', 'vw_8d', '{"sections": ["D1","D2","D3","D4","D5","D6","D7","D8"], "containment_metrics": true}'::jsonb, 'quality'),
  ('Toyota A3', 'toyota_a3', '{"format": "landscape", "single_page": true}'::jsonb, 'quality'),
  ('AS9100 CAPA', 'custom', '{"sections": ["D1","D2","D3","D4","D5","D6","D7","D8"], "aerospace": true, "risk_assessment": true}'::jsonb, 'enterprise')
ON CONFLICT (template_name) DO NOTHING;
-- Sprint 10 gap: Enterprise branding settings
-- Store organization/user-level branding config as JSON on users table (additive).

alter table if exists public.users
  add column if not exists branding_config jsonb not null default '{}'::jsonb;

create index if not exists idx_users_branding_config_gin on public.users using gin (branding_config);
-- Sprint 11: AI-Forward Tables
-- product_specifications, visual_analysis_results, investigation_sessions, pattern_alerts

-- ============================================================================
-- Product specifications (TDS data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  manufacturer TEXT,
  chemistry_type TEXT,
  recommended_substrates JSONB DEFAULT '[]',
  surface_prep_requirements TEXT,
  cure_schedule JSONB DEFAULT '{}',
  operating_temp_min_c DECIMAL,
  operating_temp_max_c DECIMAL,
  mechanical_properties JSONB DEFAULT '{}',
  shelf_life_months INT,
  mix_ratio TEXT,
  pot_life_minutes INT,
  fixture_time_minutes INT,
  tds_file_url TEXT,
  extraction_confidence JSONB DEFAULT '{}',
  manufacturer_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_specs_name ON public.product_specifications(product_name);
CREATE INDEX IF NOT EXISTS idx_product_specs_manufacturer ON public.product_specifications(manufacturer);
CREATE INDEX IF NOT EXISTS idx_product_specs_chemistry ON public.product_specifications(chemistry_type);

-- RLS
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read product_specifications" ON public.product_specifications;
CREATE POLICY "Authenticated users can read product_specifications"
  ON public.product_specifications FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert product_specifications" ON public.product_specifications;
CREATE POLICY "Authenticated users can insert product_specifications"
  ON public.product_specifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update product_specifications" ON public.product_specifications;
CREATE POLICY "Authenticated users can update product_specifications"
  ON public.product_specifications FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- Visual analysis results
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.visual_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.failure_analyses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  failure_mode_classification TEXT,
  surface_condition JSONB DEFAULT '{}',
  bond_line_assessment TEXT,
  coverage_assessment TEXT,
  ai_caption TEXT,
  confidence_score DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visual_analysis_id ON public.visual_analysis_results(analysis_id);

-- RLS
ALTER TABLE public.visual_analysis_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read visual_analysis_results" ON public.visual_analysis_results;
CREATE POLICY "Authenticated users can read visual_analysis_results"
  ON public.visual_analysis_results FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert visual_analysis_results" ON public.visual_analysis_results;
CREATE POLICY "Authenticated users can insert visual_analysis_results"
  ON public.visual_analysis_results FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- Investigation sessions (guided mode)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.investigation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.failure_analyses(id) ON DELETE SET NULL,
  session_state JSONB DEFAULT '{}',
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_sessions_user ON public.investigation_sessions(user_id);

-- RLS
ALTER TABLE public.investigation_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own investigation_sessions" ON public.investigation_sessions;
CREATE POLICY "Users can read own investigation_sessions"
  ON public.investigation_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own investigation_sessions" ON public.investigation_sessions;
CREATE POLICY "Users can insert own investigation_sessions"
  ON public.investigation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own investigation_sessions" ON public.investigation_sessions;
CREATE POLICY "Users can update own investigation_sessions"
  ON public.investigation_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- Pattern alerts
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pattern_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('time_cluster', 'geographic', 'product_lot', 'seasonal')),
  severity TEXT DEFAULT 'informational' CHECK (severity IN ('informational', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  affected_product TEXT,
  affected_substrate TEXT,
  failure_mode TEXT,
  statistical_confidence DECIMAL,
  affected_investigation_ids JSONB DEFAULT '[]',
  ai_explanation TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pattern_alerts_status ON public.pattern_alerts(status);
CREATE INDEX IF NOT EXISTS idx_pattern_alerts_type ON public.pattern_alerts(alert_type);

-- RLS
ALTER TABLE public.pattern_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read pattern_alerts" ON public.pattern_alerts;
CREATE POLICY "Authenticated users can read pattern_alerts"
  ON public.pattern_alerts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert pattern_alerts" ON public.pattern_alerts;
CREATE POLICY "Authenticated users can insert pattern_alerts"
  ON public.pattern_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update pattern_alerts" ON public.pattern_alerts;
CREATE POLICY "Authenticated users can update pattern_alerts"
  ON public.pattern_alerts FOR UPDATE
  TO authenticated
  USING (true);
