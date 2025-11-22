-- ============================================================================
-- LESSON MATERIALS TABLE
-- ============================================================================
-- This table stores metadata for files uploaded by tutors
-- Actual files are stored in Supabase Storage bucket 'lesson-materials'
-- ============================================================================

-- Create lesson_materials table
CREATE TABLE IF NOT EXISTS lesson_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES tutors(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lesson_materials_tutor_id ON lesson_materials(tutor_id);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_subject ON lesson_materials(subject);
CREATE INDEX IF NOT EXISTS idx_lesson_materials_uploaded_at ON lesson_materials(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Tutors can view their own materials" ON lesson_materials;
DROP POLICY IF EXISTS "Tutors can insert their own materials" ON lesson_materials;
DROP POLICY IF EXISTS "Tutors can update their own materials" ON lesson_materials;
DROP POLICY IF EXISTS "Tutors can delete their own materials" ON lesson_materials;

-- RLS Policies for lesson_materials

-- 1. Tutors can view their own materials
CREATE POLICY "Tutors can view their own materials"
ON lesson_materials
FOR SELECT
TO authenticated
USING (tutor_id = auth.uid());

-- 2. Tutors can insert their own materials
CREATE POLICY "Tutors can insert their own materials"
ON lesson_materials
FOR INSERT
TO authenticated
WITH CHECK (tutor_id = auth.uid());

-- 3. Tutors can update their own materials
CREATE POLICY "Tutors can update their own materials"
ON lesson_materials
FOR UPDATE
TO authenticated
USING (tutor_id = auth.uid())
WITH CHECK (tutor_id = auth.uid());

-- 4. Tutors can delete their own materials
CREATE POLICY "Tutors can delete their own materials"
ON lesson_materials
FOR DELETE
TO authenticated
USING (tutor_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON lesson_materials TO authenticated;
GRANT SELECT ON lesson_materials TO anon;

-- Verification query
SELECT 
    'lesson_materials table created' as status,
    COUNT(*) as material_count
FROM lesson_materials;
