-- MASTER FIX SCRIPT for Booking Issues (CORRECTED)
-- Run this entire script in the Supabase SQL Editor to fix all permission and data issues.

-- 1. Fix Parent Permissions & Data
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_view_parents" ON parents;
DROP POLICY IF EXISTS "Users can insert their own parent profile" ON parents;
DROP POLICY IF EXISTS "Users can update their own parent profile" ON parents;
-- Allow everyone to see parents (needed for backend checks)
CREATE POLICY "public_view_parents" ON parents FOR SELECT USING (true);
-- Allow users to manage their own parent profile
CREATE POLICY "Users can insert their own parent profile" ON parents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own parent profile" ON parents FOR UPDATE USING (auth.uid() = user_id);

-- Ensure Parent Record Exists for the current user (if logged in) or specific email
INSERT INTO parents (user_id, location_address, location_lat, location_lng)
SELECT id, 'Default Address', 0, 0
FROM auth.users 
WHERE email = 'erivwofoundation@gmail.com'
AND NOT EXISTS (SELECT 1 FROM parents WHERE user_id = auth.users.id);


-- 2. Fix Children Permissions
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_view_children" ON children;
DROP POLICY IF EXISTS "Users can insert their own children" ON children;
-- Allow backend to see children
CREATE POLICY "public_view_children" ON children FOR SELECT USING (true);
-- Allow users to manage their children
CREATE POLICY "Users can insert their own children" ON children FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM parents WHERE id = children.parent_id AND user_id = auth.uid()));


-- 3. Fix Sessions (Booking) Permissions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_view_sessions" ON sessions;
DROP POLICY IF EXISTS "Parents can insert sessions" ON sessions;
-- Allow everyone to view sessions
CREATE POLICY "public_view_sessions" ON sessions FOR SELECT USING (true);
-- Allow Parents to INSERT sessions
CREATE POLICY "Parents can insert sessions" ON sessions FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM parents WHERE id = parent_id));


-- 4. Fix Tutor Permissions
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_view_tutors" ON tutors;
CREATE POLICY "public_view_tutors" ON tutors FOR SELECT USING (true);

-- Verify everything
SELECT 'Parents Policies Fixed' as step, count(*) FROM pg_policies WHERE tablename = 'parents'
UNION ALL
SELECT 'Children Policies Fixed', count(*) FROM pg_policies WHERE tablename = 'children'
UNION ALL
SELECT 'Sessions Policies Fixed', count(*) FROM pg_policies WHERE tablename = 'sessions'
UNION ALL
SELECT 'Tutors Policies Fixed', count(*) FROM pg_policies WHERE tablename = 'tutors';
