-- Completely reset and fix all RLS policies for tutors table
-- This will allow viewing tutors from the backend

-- First, disable RLS temporarily to test
ALTER TABLE tutors DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can view all tutors" ON tutors;
DROP POLICY IF EXISTS "Anyone can view approved tutors" ON tutors;
DROP POLICY IF EXISTS "Public can view approved tutors" ON tutors;
DROP POLICY IF EXISTS "Guest tutors are viewable by everyone" ON tutors;
DROP POLICY IF EXISTS "Users can view all tutors" ON tutors;
DROP POLICY IF EXISTS "Tutors can view all tutors" ON tutors;

-- Create ONE simple SELECT policy that allows EVERYONE to view approved tutors
CREATE POLICY "allow_select_approved_tutors"
ON tutors FOR SELECT
USING (verification_status = 'approved');

-- Verify the policy
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'tutors' AND cmd = 'SELECT';
