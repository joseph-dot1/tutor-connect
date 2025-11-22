-- Fix RLS policies for tutor registration
-- This allows new users to insert their own tutor profile during registration

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view all tutors" ON tutors;
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can insert their own profile" ON tutors;

-- Enable RLS
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- 1. Anyone (authenticated) can view all tutors (for search/browse)
CREATE POLICY "Anyone can view all tutors"
ON tutors FOR SELECT
TO authenticated
USING (true);

-- 2. Authenticated users can insert their own tutor profile
CREATE POLICY "Users can insert their own tutor profile"
ON tutors FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Tutors can update their own profile
CREATE POLICY "Tutors can update their own profile"
ON tutors FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Tutors can delete their own profile
CREATE POLICY "Tutors can delete their own profile"
ON tutors FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Verification
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'tutors'
ORDER BY policyname;
