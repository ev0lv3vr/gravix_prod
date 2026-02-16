-- Sprint 8: Add shareable link columns to investigations
alter table if exists public.investigations
  add column if not exists share_token text unique,
  add column if not exists share_expires_at timestamptz;

create index if not exists idx_investigations_share_token
  on public.investigations(share_token) where share_token is not null;
