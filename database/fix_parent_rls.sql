-- Fix RLS policies for PARENTS table
-- The backend uses the anon key, so it needs permission to SELECT parents

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own parent profile" ON parents;
DROP POLICY IF EXISTS "Public can view parents" ON parents;
DROP POLICY IF EXISTS "Service role can view all parents" ON parents;

-- Create a permissive SELECT policy for now (similar to what we did for tutors)
-- This allows the backend (and everyone) to see parent profiles
-- In production, you might want to restrict this, but for now we need it to work
CREATE POLICY "public_view_parents"
ON parents FOR SELECT
USING (true);

-- Also ensure INSERT/UPDATE is allowed for the user
CREATE POLICY "Users can insert their own parent profile"
ON parents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parent profile"
ON parents FOR UPDATE
USING (auth.uid() = user_id);

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'parents';
