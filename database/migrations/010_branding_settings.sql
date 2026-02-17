-- Sprint 10 gap: Enterprise branding settings
-- Store organization/user-level branding config as JSON on users table (additive).

alter table if exists public.users
  add column if not exists branding_config jsonb not null default '{}'::jsonb;

create index if not exists idx_users_branding_config_gin on public.users using gin (branding_config);
