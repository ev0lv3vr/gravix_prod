-- Migration 013: Add missing columns to spec_requests
-- The Pydantic schema (api/schemas/specify.py) has fields that were never added to the DB.
-- These cause PGRST204 errors when the /tool form sends them.

ALTER TABLE spec_requests
ADD COLUMN IF NOT EXISTS product_considered TEXT,
ADD COLUMN IF NOT EXISTS required_fixture_time TEXT,
ADD COLUMN IF NOT EXISTS additional_requirements TEXT,
ADD COLUMN IF NOT EXISTS production_volume TEXT,
ADD COLUMN IF NOT EXISTS application_method TEXT;
