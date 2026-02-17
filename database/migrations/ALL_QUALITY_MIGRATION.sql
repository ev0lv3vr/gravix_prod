-- Gravix Quality Sprint 7
-- 007_quality_8d_tables.sql
-- Create 10 new tables for 8D investigation management + add confidence_score to spec_requests.
-- Additive + safe for Supabase Postgres.

create extension if not exists pgcrypto;

-- Add missing confidence_score column to spec_requests
alter table if exists public.spec_requests
  add column if not exists confidence_score decimal;

create index if not exists idx_spec_requests_confidence_score
  on public.spec_requests(confidence_score);

-- INVESTIGATIONS: Top-level 8D investigation container
create table if not exists public.investigations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  investigation_number text not null unique,
  title text not null,
  status text not null default 'open' check (status in ('open', 'containment', 'investigating', 'corrective_action', 'verification', 'closed')),
  severity text not null check (severity in ('critical', 'major', 'minor')),
  
  -- Product/customer info
  product_part_number text,
  customer_oem text,
  lot_batch_number text,
  production_line text,
  shift text,
  date_of_occurrence timestamptz,
  customer_complaint_ref text,
  
  -- D2 Problem Description (5W2H)
  who_reported text,
  what_failed text,
  where_in_process text,
  when_detected timestamptz,
  why_it_matters text,
  how_detected text,
  how_many_affected int,
  defect_quantity int,
  scrap_cost decimal,
  rework_cost decimal,
  
  -- D4 Root Cause (from AI analysis)
  analysis_id uuid references public.failure_analyses(id) on delete set null,
  root_causes jsonb,
  five_why_chain jsonb,
  escape_point text,
  fishbone_data jsonb,
  
  -- D8 Closure
  closure_summary text,
  lessons_learned text,
  closed_at timestamptz,
  
  -- Team roles
  champion_user_id uuid references public.users(id) on delete set null,
  team_lead_user_id uuid references public.users(id) on delete set null,
  approver_user_id uuid references public.users(id) on delete set null,
  
  -- Spec engine cross-link
  spec_id uuid references public.spec_requests(id) on delete set null,
  
  -- Case library opt-in
  publish_case boolean default true,
  
  -- Email-in source
  source_email_id text,
  
  -- Report template
  report_template text default 'generic',
  
  -- Metadata
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_investigations_user_created_at
  on public.investigations(user_id, created_at desc);

create index if not exists idx_investigations_status
  on public.investigations(status);

create index if not exists idx_investigations_severity
  on public.investigations(severity);

create index if not exists idx_investigations_customer
  on public.investigations(customer_oem);

create index if not exists idx_investigations_number
  on public.investigations(investigation_number);


-- Team members can view investigations they're part of

-- INVESTIGATION_MEMBERS: Team members beyond core roles
create table if not exists public.investigation_members (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member',
  discipline text,
  added_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(investigation_id, user_id)
);

create index if not exists idx_investigation_members_investigation
  on public.investigation_members(investigation_id);

create index if not exists idx_investigation_members_user
  on public.investigation_members(user_id);



-- INVESTIGATION_ACTIONS: D3 Containment + D5 Corrective + D7 Preventive actions
create table if not exists public.investigation_actions (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  discipline text not null check (discipline in ('D3', 'D5', 'D7')),
  action_type text,
  description text not null,
  owner_user_id uuid references public.users(id) on delete set null,
  priority text check (priority in ('P1', 'P2', 'P3')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'complete', 'cancelled')),
  due_date date,
  completion_date date,
  
  -- D6 Verification fields
  verification_method text,
  sample_size text,
  acceptance_criteria text,
  verification_results text,
  verified_by uuid references public.users(id) on delete set null,
  verification_date date,
  
  evidence_urls text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_investigation_actions_investigation
  on public.investigation_actions(investigation_id);

create index if not exists idx_investigation_actions_owner
  on public.investigation_actions(owner_user_id);

create index if not exists idx_investigation_actions_status
  on public.investigation_actions(status);

create index if not exists idx_investigation_actions_discipline
  on public.investigation_actions(discipline);



-- INVESTIGATION_SIGNATURES: Electronic signatures for D8 closure
create table if not exists public.investigation_signatures (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null,
  signature_type text not null check (signature_type in ('discipline_signoff', 'closure_approval')),
  discipline text,
  signed_at timestamptz not null default now(),
  signature_hash text not null
);

create index if not exists idx_investigation_signatures_investigation
  on public.investigation_signatures(investigation_id);

create index if not exists idx_investigation_signatures_user
  on public.investigation_signatures(user_id);



-- INVESTIGATION_ATTACHMENTS: Photos and evidence files
create table if not exists public.investigation_attachments (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  discipline text,
  file_name text not null,
  file_type text not null,
  file_size_bytes bigint,
  storage_path text not null,
  caption text,
  is_annotated boolean default false,
  original_storage_path text,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_investigation_attachments_investigation
  on public.investigation_attachments(investigation_id);

create index if not exists idx_investigation_attachments_discipline
  on public.investigation_attachments(discipline);



-- INVESTIGATION_COMMENTS: Threaded discussion per discipline
create table if not exists public.investigation_comments (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  parent_comment_id uuid references public.investigation_comments(id) on delete cascade,
  discipline text not null,
  user_id uuid not null references public.users(id) on delete cascade,
  comment_text text not null,
  is_resolution boolean default false,
  is_pinned boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_investigation_comments_investigation
  on public.investigation_comments(investigation_id);

create index if not exists idx_investigation_comments_discipline
  on public.investigation_comments(discipline);

create index if not exists idx_investigation_comments_parent
  on public.investigation_comments(parent_comment_id);



-- INVESTIGATION_AUDIT_LOG: Immutable append-only audit trail
create table if not exists public.investigation_audit_log (
  id uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations(id) on delete cascade,
  event_type text not null,
  event_detail text,
  actor_user_id uuid references public.users(id) on delete set null,
  discipline text,
  target_type text,
  target_id uuid,
  diff_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_investigation_audit_log_investigation
  on public.investigation_audit_log(investigation_id, created_at desc);

create index if not exists idx_investigation_audit_log_event_type
  on public.investigation_audit_log(event_type);

create index if not exists idx_investigation_audit_log_actor
  on public.investigation_audit_log(actor_user_id);


-- Audit log is append-only (no UPDATE or DELETE policies)

-- NOTIFICATIONS: User notifications for investigation activity
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  investigation_id uuid references public.investigations(id) on delete cascade,
  notification_type text not null,
  title text not null,
  message text not null,
  is_read boolean default false,
  action_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user_created_at
  on public.notifications(user_id, created_at desc);

create index if not exists idx_notifications_investigation
  on public.notifications(investigation_id);

create index if not exists idx_notifications_is_read
  on public.notifications(user_id, is_read);



-- NOTIFICATION_PREFERENCES: Per-user notification settings
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  email_enabled boolean default true,
  investigation_created boolean default true,
  investigation_status_changed boolean default true,
  action_assigned boolean default true,
  action_due_soon boolean default true,
  action_overdue boolean default true,
  comment_mention boolean default true,
  comment_reply boolean default true,
  investigation_closed boolean default true,
  digest_mode boolean default false,
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notification_preferences_user
  on public.notification_preferences(user_id);



-- REPORT_TEMPLATES: OEM-specific 8D report templates
create table if not exists public.report_templates (
  id uuid primary key default gen_random_uuid(),
  template_name text not null unique,
  template_type text not null check (template_type in ('generic', 'ford_global_8d', 'vw_8d', 'toyota_a3', 'custom')),
  template_config jsonb not null default '{}'::jsonb,
  is_active boolean default true,
  tier_required text default 'free' check (tier_required in ('free', 'quality', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_report_templates_type
  on public.report_templates(template_type);



-- Insert default report templates
insert into public.report_templates (template_name, template_type, template_config, tier_required)
values 
  ('Generic 8D', 'generic', '{"sections": ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"]}'::jsonb, 'free'),
  ('Ford Global 8D', 'ford_global_8d', '{"sections": ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"], "requires_ppap": true}'::jsonb, 'quality')
on conflict (template_name) do nothing;


-- ============================
-- RLS POLICIES (after all tables exist)
-- ============================

alter table public.investigations enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigations' and policyname='investigations_select_team'
  ) then
    create policy investigations_select_team
      on public.investigations
      for select
      to authenticated
      using (
        auth.uid() = user_id
        or auth.uid() = champion_user_id
        or auth.uid() = team_lead_user_id
        or auth.uid() = approver_user_id
        or exists (
          select 1 from public.investigation_members
          where investigation_id = investigations.id
          and user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigations' and policyname='investigations_insert_own'
  ) then
    create policy investigations_insert_own
      on public.investigations
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigations' and policyname='investigations_update_team'
  ) then
    create policy investigations_update_team
      on public.investigations
      for update
      to authenticated
      using (
        auth.uid() = team_lead_user_id
        or auth.uid() = champion_user_id
      );
  end if;
end $$;

alter table public.investigation_members enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_members' and policyname='investigation_members_select_team'
  ) then
    create policy investigation_members_select_team
      on public.investigation_members
      for select
      to authenticated
      using (
        exists (
          select 1 from public.investigations
          where id = investigation_members.investigation_id
          and (
            auth.uid() = user_id
            or auth.uid() = champion_user_id
            or auth.uid() = team_lead_user_id
            or auth.uid() = approver_user_id
          )
        )
        or auth.uid() = investigation_members.user_id
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_members' and policyname='investigation_members_insert_lead'
  ) then
    create policy investigation_members_insert_lead
      on public.investigation_members
      for insert
      to authenticated
      with check (
        exists (
          select 1 from public.investigations
          where id = investigation_members.investigation_id
          and (auth.uid() = team_lead_user_id or auth.uid() = champion_user_id)
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_members' and policyname='investigation_members_delete_lead'
  ) then
    create policy investigation_members_delete_lead
      on public.investigation_members
      for delete
      to authenticated
      using (
        exists (
          select 1 from public.investigations
          where id = investigation_members.investigation_id
          and (auth.uid() = team_lead_user_id or auth.uid() = champion_user_id)
        )
      );
  end if;
end $$;

alter table public.investigation_actions enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_actions' and policyname='investigation_actions_select_team'
  ) then
    create policy investigation_actions_select_team
      on public.investigation_actions
      for select
      to authenticated
      using (
        exists (
          select 1 from public.investigations
          where id = investigation_actions.investigation_id
          and (
            auth.uid() = user_id
            or auth.uid() = champion_user_id
            or auth.uid() = team_lead_user_id
            or auth.uid() = approver_user_id
            or exists (
              select 1 from public.investigation_members
              where investigation_id = investigations.id
              and user_id = auth.uid()
            )
          )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_actions' and policyname='investigation_actions_insert_team'
  ) then
    create policy investigation_actions_insert_team
      on public.investigation_actions
      for insert
      to authenticated
      with check (
        exists (
          select 1 from public.investigations
          where id = investigation_actions.investigation_id
          and (auth.uid() = team_lead_user_id or auth.uid() = champion_user_id)
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_actions' and policyname='investigation_actions_update_team'
  ) then
    create policy investigation_actions_update_team
      on public.investigation_actions
      for update
      to authenticated
      using (
        exists (
          select 1 from public.investigations
          where id = investigation_actions.investigation_id
          and (
            auth.uid() = team_lead_user_id
            or auth.uid() = champion_user_id
            or auth.uid() = owner_user_id
          )
        )
      );
  end if;
end $$;

alter table public.investigation_signatures enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_signatures' and policyname='investigation_signatures_select_team'
  ) then
    create policy investigation_signatures_select_team
      on public.investigation_signatures
      for select
      to authenticated
      using (
        exists (
          select 1 from public.investigations
          where id = investigation_signatures.investigation_id
          and (
            auth.uid() = user_id
            or auth.uid() = champion_user_id
            or auth.uid() = team_lead_user_id
            or auth.uid() = approver_user_id
            or exists (
              select 1 from public.investigation_members
              where investigation_id = investigations.id
              and user_id = auth.uid()
            )
          )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_signatures' and policyname='investigation_signatures_insert_own'
  ) then
    create policy investigation_signatures_insert_own
      on public.investigation_signatures
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;
end $$;

alter table public.investigation_attachments enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_attachments' and policyname='investigation_attachments_select_team'
  ) then
    create policy investigation_attachments_select_team
      on public.investigation_attachments
      for select
      to authenticated
      using (
        exists (
          select 1 from public.investigations
          where id = investigation_attachments.investigation_id
          and (
            auth.uid() = user_id
            or auth.uid() = champion_user_id
            or auth.uid() = team_lead_user_id
            or auth.uid() = approver_user_id
            or exists (
              select 1 from public.investigation_members
              where investigation_id = investigations.id
              and user_id = auth.uid()
            )
          )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_attachments' and policyname='investigation_attachments_insert_team'
  ) then
    create policy investigation_attachments_insert_team
      on public.investigation_attachments
      for insert
      to authenticated
      with check (
        exists (
          select 1 from public.investigations
          where id = investigation_attachments.investigation_id
          and (
            auth.uid() = user_id
            or auth.uid() = team_lead_user_id
            or auth.uid() = champion_user_id
            or exists (
              select 1 from public.investigation_members
              where investigation_id = investigations.id
              and user_id = auth.uid()
            )
          )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_attachments' and policyname='investigation_attachments_delete_uploader'
  ) then
    create policy investigation_attachments_delete_uploader
      on public.investigation_attachments
      for delete
      to authenticated
      using (auth.uid() = uploaded_by);
  end if;
end $$;

alter table public.investigation_comments enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_comments' and policyname='investigation_comments_select_team'
  ) then
    create policy investigation_comments_select_team
      on public.investigation_comments
      for select
      to authenticated
      using (
        exists (
          select 1 from public.investigations
          where id = investigation_comments.investigation_id
          and (
            auth.uid() = user_id
            or auth.uid() = champion_user_id
            or auth.uid() = team_lead_user_id
            or auth.uid() = approver_user_id
            or exists (
              select 1 from public.investigation_members
              where investigation_id = investigations.id
              and user_id = auth.uid()
            )
          )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_comments' and policyname='investigation_comments_insert_team'
  ) then
    create policy investigation_comments_insert_team
      on public.investigation_comments
      for insert
      to authenticated
      with check (
        exists (
          select 1 from public.investigations
          where id = investigation_comments.investigation_id
          and (
            auth.uid() = user_id
            or auth.uid() = champion_user_id
            or auth.uid() = team_lead_user_id
            or auth.uid() = approver_user_id
            or exists (
              select 1 from public.investigation_members
              where investigation_id = investigations.id
              and user_id = auth.uid()
            )
          )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_comments' and policyname='investigation_comments_update_own'
  ) then
    create policy investigation_comments_update_own
      on public.investigation_comments
      for update
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

alter table public.investigation_audit_log enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_audit_log' and policyname='investigation_audit_log_select_team'
  ) then
    create policy investigation_audit_log_select_team
      on public.investigation_audit_log
      for select
      to authenticated
      using (
        exists (
          select 1 from public.investigations
          where id = investigation_audit_log.investigation_id
          and (
            auth.uid() = user_id
            or auth.uid() = champion_user_id
            or auth.uid() = team_lead_user_id
            or auth.uid() = approver_user_id
            or exists (
              select 1 from public.investigation_members
              where investigation_id = investigations.id
              and user_id = auth.uid()
            )
          )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='investigation_audit_log' and policyname='investigation_audit_log_insert_authenticated'
  ) then
    create policy investigation_audit_log_insert_authenticated
      on public.investigation_audit_log
      for insert
      to authenticated
      with check (true);
  end if;
end $$;

alter table public.notifications enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notifications' and policyname='notifications_select_own'
  ) then
    create policy notifications_select_own
      on public.notifications
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notifications' and policyname='notifications_update_own'
  ) then
    create policy notifications_update_own
      on public.notifications
      for update
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notifications' and policyname='notifications_insert_service'
  ) then
    create policy notifications_insert_service
      on public.notifications
      for insert
      to authenticated
      with check (true);
  end if;
end $$;

alter table public.notification_preferences enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notification_preferences' and policyname='notification_preferences_select_own'
  ) then
    create policy notification_preferences_select_own
      on public.notification_preferences
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notification_preferences' and policyname='notification_preferences_insert_own'
  ) then
    create policy notification_preferences_insert_own
      on public.notification_preferences
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='notification_preferences' and policyname='notification_preferences_update_own'
  ) then
    create policy notification_preferences_update_own
      on public.notification_preferences
      for update
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

alter table public.report_templates enable row level security;

DO $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='report_templates' and policyname='report_templates_select_authenticated'
  ) then
    create policy report_templates_select_authenticated
      on public.report_templates
      for select
      to authenticated
      using (true);
  end if;
end $$;
-- Sprint 8: Add shareable link columns to investigations
alter table if exists public.investigations
  add column if not exists share_token text unique,
  add column if not exists share_expires_at timestamptz;

create index if not exists idx_investigations_share_token
  on public.investigations(share_token) where share_token is not null;
