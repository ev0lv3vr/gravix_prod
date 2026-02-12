-- Gravix V2 Sprint 1
-- 001_v2_structured_fields.sql
-- Add structured fields, user role, and indexes.
-- Additive + safe for Supabase Postgres.

-- Ensure UUID helpers are available.
-- Supabase typically enables pgcrypto; uuid-ossp may or may not be present.
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Fallback helper: prefer gen_random_uuid(); else uuid_generate_v4().
-- Using a wrapper avoids migrations breaking on environments that only have one.
create or replace function public.uuid_v4()
returns uuid
language plpgsql
stable
as $$
begin
  if to_regprocedure('gen_random_uuid()') is not null then
    return gen_random_uuid();
  elsif to_regprocedure('uuid_generate_v4()') is not null then
    return uuid_generate_v4();
  else
    raise exception 'No UUID generator available (need pgcrypto.gen_random_uuid or uuid-ossp.uuid_generate_v4)';
  end if;
end;
$$;

-- USERS: add role column for admin gating.
alter table if exists public.users
  add column if not exists role text not null default 'user';

-- Optional: constrain known roles (non-breaking: only adds when column exists and constraint not already present).
DO $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='users' and column_name='role'
  ) then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'users_role_check'
    ) then
      alter table public.users
        add constraint users_role_check
        check (role in ('user','admin'));
    end if;
  end if;
end $$;

create index if not exists idx_users_role on public.users(role);

-- FAILURE_ANALYSES: add normalized substrates + structured fields.
alter table if exists public.failure_analyses
  add column if not exists substrate_a_normalized text,
  add column if not exists substrate_b_normalized text,
  add column if not exists root_cause_category text,
  add column if not exists industry text,
  add column if not exists production_impact text;

create index if not exists idx_failure_analyses_user_created_at
  on public.failure_analyses(user_id, created_at desc);

create index if not exists idx_failure_analyses_substrates_normalized
  on public.failure_analyses(substrate_a_normalized, substrate_b_normalized);

create index if not exists idx_failure_analyses_root_cause_category
  on public.failure_analyses(root_cause_category);

create index if not exists idx_failure_analyses_industry
  on public.failure_analyses(industry);

-- SPEC_REQUESTS: add normalized substrates to support aggregation/search.
alter table if exists public.spec_requests
  add column if not exists substrate_a_normalized text,
  add column if not exists substrate_b_normalized text;

create index if not exists idx_spec_requests_user_created_at
  on public.spec_requests(user_id, created_at desc);

create index if not exists idx_spec_requests_substrates_normalized
  on public.spec_requests(substrate_a_normalized, substrate_b_normalized);
-- Gravix V2 Sprint 1
-- 002_v2_feedback_knowledge.sql
-- Add analysis_feedback + knowledge_patterns with RLS/policies.
-- Additive + safe for Supabase Postgres.

create extension if not exists pgcrypto;

-- ANALYSIS_FEEDBACK: user-submitted outcomes to improve model.
create table if not exists public.analysis_feedback (
  id uuid primary key default public.uuid_v4(),
  analysis_id uuid references public.failure_analyses(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  helpful boolean,
  outcome text,
  confirmed_root_cause text,
  confirmed_fix text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_analysis_feedback_user_created_at
  on public.analysis_feedback(user_id, created_at desc);

create index if not exists idx_analysis_feedback_analysis_id
  on public.analysis_feedback(analysis_id);

alter table public.analysis_feedback enable row level security;

-- Users can insert feedback for themselves
DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='analysis_feedback' and policyname='analysis_feedback_insert_own'
  ) then
    create policy analysis_feedback_insert_own
      on public.analysis_feedback
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='analysis_feedback' and policyname='analysis_feedback_select_own'
  ) then
    create policy analysis_feedback_select_own
      on public.analysis_feedback
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

-- KNOWLEDGE_PATTERNS: aggregated learned patterns. Typically written by service role / jobs.
create table if not exists public.knowledge_patterns (
  id uuid primary key default public.uuid_v4(),
  pattern_type text not null,
  substrate_a_normalized text,
  substrate_b_normalized text,
  root_cause_category text,
  industry text,
  adhesive_family text,
  evidence_count int not null default 0,
  success_rate numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_knowledge_patterns_lookup
  on public.knowledge_patterns(pattern_type, substrate_a_normalized, substrate_b_normalized, root_cause_category);

alter table public.knowledge_patterns enable row level security;

-- Allow authenticated users to read patterns (service role bypasses RLS for writes).
DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='knowledge_patterns' and policyname='knowledge_patterns_select_authenticated'
  ) then
    create policy knowledge_patterns_select_authenticated
      on public.knowledge_patterns
      for select
      to authenticated
      using (true);
  end if;
end $$;
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
-- Gravix V2 Sprint 1
-- 004_v2_seed_cases.sql
-- Optional seed cases for a future case_library table.
--
-- TODO: This migration is a placeholder. The current codebase uses the `public.cases` table.
-- If/when a `public.case_library` table exists, add seed rows here.

DO $$
begin
  if to_regclass('public.case_library') is null then
    -- No-op.
    return;
  end if;

  -- Example (kept commented until schema is confirmed):
  -- insert into public.case_library (id, slug, title, summary, created_at)
  -- values (public.uuid_v4(), 'example-case', 'Example Case', 'Example summary', now())
  -- on conflict (slug) do nothing;
end $$;
-- Gravix V2 Sprint 6
-- 005_v2_knowledge_engine.sql
-- Add knowledge_evidence_count to failure_analyses and spec_requests.
-- Add similar_cases JSONB to failure_analyses (if not already present).
-- Additive + safe for Supabase Postgres.

-- failure_analyses: knowledge evidence count (from empirical data)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'failure_analyses' AND column_name = 'knowledge_evidence_count'
  ) THEN
    ALTER TABLE public.failure_analyses ADD COLUMN knowledge_evidence_count int;
  END IF;
END $$;

-- failure_analyses: similar_cases JSONB (populated on analysis)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'failure_analyses' AND column_name = 'similar_cases'
  ) THEN
    ALTER TABLE public.failure_analyses ADD COLUMN similar_cases jsonb;
  END IF;
END $$;

-- spec_requests: knowledge evidence count
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'spec_requests' AND column_name = 'knowledge_evidence_count'
  ) THEN
    ALTER TABLE public.spec_requests ADD COLUMN knowledge_evidence_count int;
  END IF;
END $$;

-- spec_requests: similar_cases JSONB
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'spec_requests' AND column_name = 'similar_cases'
  ) THEN
    ALTER TABLE public.spec_requests ADD COLUMN similar_cases jsonb;
  END IF;
END $$;

-- Index for faster substrate pair lookups on knowledge_patterns
CREATE INDEX IF NOT EXISTS idx_knowledge_patterns_substrates
  ON public.knowledge_patterns(substrate_a_normalized, substrate_b_normalized);

-- Index for finding similar analyses quickly
CREATE INDEX IF NOT EXISTS idx_failure_analyses_substrates_status
  ON public.failure_analyses(substrate_a_normalized, substrate_b_normalized, status);
