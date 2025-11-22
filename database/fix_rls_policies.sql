-- Permanent Fix for Tutor Profile Creation
-- This adds RLS policies that properly support UPSERT operations

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;
DROP POLICY IF EXISTS "Public tutors are viewable by everyone" ON tutors;
DROP POLICY IF EXISTS "Tutors can view own profile" ON tutors;

-- Allow viewing approved tutors (public)
CREATE POLICY "Public tutors are viewable by everyone"
    ON tutors FOR SELECT
    USING (verification_status = 'approved');

-- Allow users to view their own tutor profile
CREATE POLICY "Tutors can view own profile"
    ON tutors FOR SELECT
    USING (auth.uid() = user_id);

-- Allow authenticated users to INSERT their own tutor profile
CREATE POLICY "Users can insert own tutor profile"
    ON tutors FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow tutors to UPDATE their own profile
CREATE POLICY "Tutors can update own profile"
    ON tutors FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
