-- Ensure tutors can be viewed by anyone (for profile pages)
-- Drop and recreate the SELECT policy to ensure it's correct

DROP POLICY IF EXISTS "Anyone can view all tutors" ON tutors;
DROP POLICY IF EXISTS "Public can view approved tutors" ON tutors;
DROP POLICY IF EXISTS "Guest tutors are viewable by everyone" ON tutors;

-- Create a simple, permissive SELECT policy
CREATE POLICY "Anyone can view approved tutors"
ON tutors FOR SELECT
TO authenticated, anon
USING (verification_status = 'approved');

-- Optional: Also allow viewing tutors even if not approved (for testing)
-- Uncomment if you want to see all tutors regardless of status:
-- CREATE POLICY "Anyone can view all tutors"
-- ON tutors FOR SELECT
-- TO authenticated, anon
-- USING (true);

-- Verification
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'tutors' AND cmd = 'SELECT'
ORDER BY policyname;
