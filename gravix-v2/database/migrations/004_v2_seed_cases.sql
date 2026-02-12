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
