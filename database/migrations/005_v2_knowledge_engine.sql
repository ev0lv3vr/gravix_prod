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
