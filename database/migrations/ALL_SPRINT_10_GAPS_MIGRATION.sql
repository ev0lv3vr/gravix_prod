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
