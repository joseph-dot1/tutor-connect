-- Migration: Add missing columns to tutors table

-- Add specializations column (Array of text)
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS specializations TEXT[];

-- Add teaching_mode column (String/Varchar)
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS teaching_mode VARCHAR(50);

-- Add index for specializations for faster searching
CREATE INDEX IF NOT EXISTS idx_tutors_specializations ON tutors USING GIN(specializations);
