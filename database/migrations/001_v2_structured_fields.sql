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
