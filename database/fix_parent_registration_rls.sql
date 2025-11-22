-- Fix RLS policies for parent registration
-- This allows new users to insert their own parent profile during registration

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Parents can view their own profile" ON parents;
DROP POLICY IF EXISTS "Parents can update own profile" ON parents;
DROP POLICY IF EXISTS "Parents can insert their own profile" ON parents;

-- Enable RLS
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- 1. Parents can view their own profile
CREATE POLICY "Parents can view their own profile"
ON parents FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 2. Authenticated users can insert their own parent profile
CREATE POLICY "Users can insert their own parent profile"
ON parents FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Parents can update their own profile
CREATE POLICY "Parents can update their own profile"
ON parents FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Parents can delete their own profile
CREATE POLICY "Parents can delete their own profile"
ON parents FOR DELETE
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
WHERE tablename = 'parents'
ORDER BY policyname;
