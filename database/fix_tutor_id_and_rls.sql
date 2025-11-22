-- COMPREHENSIVE FIX SCRIPT
-- 1. Fix RLS Policies
-- 2. Fix Corrupted/Invalid Tutor ID
-- 3. Return the NEW correct URL

-- Enable RLS
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to clear conflicts
DROP POLICY IF EXISTS "Anyone can view all tutors" ON tutors;
DROP POLICY IF EXISTS "Anyone can view approved tutors" ON tutors;
DROP POLICY IF EXISTS "Public can view approved tutors" ON tutors;
DROP POLICY IF EXISTS "Guest tutors are viewable by everyone" ON tutors;
DROP POLICY IF EXISTS "Users can view all tutors" ON tutors;
DROP POLICY IF EXISTS "Tutors can view all tutors" ON tutors;
DROP POLICY IF EXISTS "allow_select_approved_tutors" ON tutors;

-- Create ONE simple, permissive SELECT policy
CREATE POLICY "public_view_tutors"
ON tutors FOR SELECT
USING (true);

-- Fix the Tutor ID (Regenerate a valid UUID)
-- This fixes the issue if the ID was corrupted or malformed
UPDATE tutors 
SET id = gen_random_uuid()
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'erivwofoundation@gmail.com'
);

-- Return the NEW correct ID and URL
SELECT 
    'SUCCESS' as status,
    t.id as new_tutor_id,
    u.email,
    'http://localhost:5173/tutor/' || t.id as CLICK_THIS_URL
FROM tutors t
JOIN auth.users u ON t.user_id = u.id
WHERE u.email = 'erivwofoundation@gmail.com';
