-- Fix RLS policies for SESSIONS table
-- Allow authenticated users (parents) to insert new sessions

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 1. Drop potential conflicting policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON sessions;
DROP POLICY IF EXISTS "Parents can insert sessions" ON sessions;
DROP POLICY IF EXISTS "public_view_sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON sessions;

-- 2. Create permissive SELECT policy (for now)
CREATE POLICY "public_view_sessions"
ON sessions FOR SELECT
USING (true);

-- 3. Allow Parents to INSERT sessions
CREATE POLICY "Parents can insert sessions"
ON sessions FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM parents WHERE id = parent_id
    )
);

-- 4. Allow Users to UPDATE their own sessions
CREATE POLICY "Users can update their own sessions"
ON sessions FOR UPDATE
USING (
    auth.uid() IN (
        SELECT user_id FROM parents WHERE id = parent_id
    )
    OR
    auth.uid() IN (
        SELECT user_id FROM tutors WHERE id = tutor_id
    )
);

-- Verify
SELECT * FROM pg_policies WHERE tablename = 'sessions';
