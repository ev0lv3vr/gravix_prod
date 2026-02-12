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
