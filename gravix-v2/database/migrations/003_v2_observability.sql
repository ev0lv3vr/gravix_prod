-- Gravix V2 Sprint 1
-- 003_v2_observability.sql
-- Observability tables: ai_engine_logs, api_request_logs, admin_audit_log, daily_metrics + RLS/policies.
-- Additive + safe for Supabase Postgres.

create extension if not exists pgcrypto;

-- Helper: admin check via users.role
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users u
    where u.id = uid and u.role = 'admin'
  );
$$;

-- API_REQUEST_LOGS: request-level logging.
create table if not exists public.api_request_logs (
  id uuid primary key default public.uuid_v4(),
  request_id uuid,
  user_id uuid,
  user_plan text,
  method text,
  path text,
  status_code int,
  duration_ms int,
  ip inet,
  user_agent text,
  error text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_api_request_logs_created_at
  on public.api_request_logs(created_at desc);

create index if not exists idx_api_request_logs_user_id
  on public.api_request_logs(user_id, created_at desc);

alter table public.api_request_logs enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='api_request_logs' and policyname='api_request_logs_select_admin'
  ) then
    create policy api_request_logs_select_admin
      on public.api_request_logs
      for select
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;
end $$;

-- AI_ENGINE_LOGS: model execution metadata.
create table if not exists public.ai_engine_logs (
  id uuid primary key default public.uuid_v4(),
  analysis_id uuid,
  user_id uuid,
  engine text,
  model text,
  prompt_tokens int,
  completion_tokens int,
  latency_ms int,
  success boolean,
  error text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_engine_logs_created_at
  on public.ai_engine_logs(created_at desc);

create index if not exists idx_ai_engine_logs_user_id
  on public.ai_engine_logs(user_id, created_at desc);

alter table public.ai_engine_logs enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='ai_engine_logs' and policyname='ai_engine_logs_select_admin'
  ) then
    create policy ai_engine_logs_select_admin
      on public.ai_engine_logs
      for select
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;
end $$;

-- ADMIN_AUDIT_LOG: admin actions.
create table if not exists public.admin_audit_log (
  id uuid primary key default public.uuid_v4(),
  actor_user_id uuid,
  action text not null,
  target_table text,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_audit_log_created_at
  on public.admin_audit_log(created_at desc);

alter table public.admin_audit_log enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='admin_audit_log' and policyname='admin_audit_log_select_admin'
  ) then
    create policy admin_audit_log_select_admin
      on public.admin_audit_log
      for select
      to authenticated
      using (public.is_admin(auth.uid()));
  end if;
end $$;

-- DAILY_METRICS: aggregated public stats.
create table if not exists public.daily_metrics (
  day date primary key,
  analyses_count int not null default 0,
  spec_requests_count int not null default 0,
  resolution_rate numeric,
  substrate_combinations_count int,
  adhesive_families_count int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_metrics enable row level security;

-- Public read access to aggregate metrics.
DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='daily_metrics' and policyname='daily_metrics_select_public'
  ) then
    create policy daily_metrics_select_public
      on public.daily_metrics
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;
