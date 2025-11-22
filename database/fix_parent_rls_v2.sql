-- Fix RLS policies for PARENTS table (Version 2)
-- Robust script to handle existing policies

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- 1. Drop ALL potential existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own parent profile" ON parents;
DROP POLICY IF EXISTS "Public can view parents" ON parents;
DROP POLICY IF EXISTS "Service role can view all parents" ON parents;
DROP POLICY IF EXISTS "public_view_parents" ON parents;
DROP POLICY IF EXISTS "Users can insert their own parent profile" ON parents;
DROP POLICY IF EXISTS "Users can update their own parent profile" ON parents;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON parents;

-- 2. Re-create the policies

-- Allow everyone to see parent profiles (needed for backend to verify booking permissions)
CREATE POLICY "public_view_parents"
ON parents FOR SELECT
USING (true);

-- Allow users to create their own profile
CREATE POLICY "Users can insert their own parent profile"
ON parents FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own parent profile"
ON parents FOR UPDATE
USING (auth.uid() = user_id);

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'parents';
