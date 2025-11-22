-- Temporarily disable RLS to test if that's the issue
ALTER TABLE tutors DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'tutors';
