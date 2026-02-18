-- Cron execution audit log
CREATE TABLE IF NOT EXISTS public.cron_run_log (
  id uuid PRIMARY KEY DEFAULT public.uuid_v4(),
  job_name text NOT NULL,
  status text NOT NULL DEFAULT 'success',  -- success | error
  duration_ms int,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cron_run_log_job
  ON public.cron_run_log(job_name, created_at DESC);

ALTER TABLE public.cron_run_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='cron_run_log' AND policyname='cron_run_log_admin'
  ) THEN
    CREATE POLICY cron_run_log_admin ON public.cron_run_log
      FOR SELECT TO authenticated
      USING (public.is_admin(auth.uid()));
  END IF;
END $$;
