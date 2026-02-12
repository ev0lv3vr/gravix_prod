-- Migration 006: Align analysis_feedback schema with backend code expectations
-- 
-- Problem: The Python code expects modern column names (was_helpful, root_cause_confirmed, etc.)
-- but the table only has legacy columns (helpful, confirmed_root_cause, confirmed_fix, notes).
--
-- Solution: Add all missing columns without dropping old ones (for backward compatibility).
-- Data migration: Copy helpful → was_helpful where present.

-- Add missing columns
ALTER TABLE public.analysis_feedback 
  ADD COLUMN IF NOT EXISTS spec_id uuid REFERENCES public.spec_requests(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS was_helpful boolean,
  ADD COLUMN IF NOT EXISTS root_cause_confirmed integer DEFAULT 0 CHECK (root_cause_confirmed >= 0 AND root_cause_confirmed <= 5),
  ADD COLUMN IF NOT EXISTS actual_root_cause text,
  ADD COLUMN IF NOT EXISTS what_worked text,
  ADD COLUMN IF NOT EXISTS what_didnt_work text,
  ADD COLUMN IF NOT EXISTS time_to_resolution text,
  ADD COLUMN IF NOT EXISTS estimated_cost_saved numeric(10,2),
  ADD COLUMN IF NOT EXISTS recommendation_implemented jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS substrate_corrections jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS feedback_source text DEFAULT 'in_app',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- Migrate existing data: helpful → was_helpful
UPDATE public.analysis_feedback 
SET was_helpful = helpful 
WHERE helpful IS NOT NULL AND was_helpful IS NULL;

-- Set updated_at to created_at for existing records
UPDATE public.analysis_feedback 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Create index for spec_id lookups
CREATE INDEX IF NOT EXISTS idx_analysis_feedback_spec_id 
  ON public.analysis_feedback(spec_id);

-- Create index for was_helpful queries (used in knowledge aggregation)
CREATE INDEX IF NOT EXISTS idx_analysis_feedback_was_helpful 
  ON public.analysis_feedback(was_helpful) 
  WHERE was_helpful IS NOT NULL;

-- Note: Old columns (helpful, confirmed_root_cause, confirmed_fix, notes) 
-- are kept for backward compatibility and can be dropped in a future migration
-- after confirming no other code depends on them.
