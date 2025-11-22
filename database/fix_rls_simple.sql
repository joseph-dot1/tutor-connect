-- Enable RLS on tutors table only
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- Tutors Table Policies

-- 1. Public can view approved tutors
DROP POLICY IF EXISTS "Public can view approved tutors" ON tutors;
CREATE POLICY "Public can view approved tutors"
    ON tutors FOR SELECT
    USING (verification_status = 'approved');

-- 2. Tutors can view their own profile (even if not approved)
DROP POLICY IF EXISTS "Tutors can view own profile" ON tutors;
CREATE POLICY "Tutors can view own profile"
    ON tutors FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Users can insert their own tutor profile
DROP POLICY IF EXISTS "Users can insert own tutor profile" ON tutors;
CREATE POLICY "Users can insert own tutor profile"
    ON tutors FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 4. Tutors can update their own profile
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;
CREATE POLICY "Tutors can update own profile"
    ON tutors FOR UPDATE
    USING (auth.uid() = user_id);

-- NOTE: user_profiles is a view, so we cannot enable RLS on it directly.
-- The underlying tables (likely auth.users or a profiles table) should handle security.
-- If user_profiles is a security definer view, it might bypass RLS.
-- If it is a security invoker view, it will respect underlying RLS.
-- For now, we assume public read access is handled by the view definition or underlying table.


