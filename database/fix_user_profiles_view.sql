-- Fix user_profiles view to allow public access to names but protect emails

-- 1. Drop the existing view
DROP VIEW IF EXISTS user_profiles;

-- 2. Recreate the view with security_invoker = false (runs with owner permissions)
-- This allows it to read from auth.users even if the caller (anon) cannot.
CREATE OR REPLACE VIEW user_profiles WITH (security_invoker = false) AS
SELECT 
    u.id,
    -- Privacy: Only show email if it's the user's own profile
    CASE WHEN auth.uid() = u.id THEN u.email ELSE NULL END as email,
    -- Public: Full name is visible to everyone
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'role' as role,
    -- Privacy: Only show phone if it's the user's own profile
    CASE WHEN auth.uid() = u.id THEN u.raw_user_meta_data->>'phone' ELSE NULL END as phone,
    u.created_at,
    -- Profile data from joined tables
    CASE 
        WHEN t.id IS NOT NULL THEN jsonb_build_object(
            'tutor_id', t.id,
            'verification_status', t.verification_status,
            'rating_average', t.rating_average
        )
        WHEN p.id IS NOT NULL THEN jsonb_build_object(
            'parent_id', p.id
        )
        ELSE NULL
    END as profile_data
FROM auth.users u
LEFT JOIN tutors t ON t.user_id = u.id
LEFT JOIN parents p ON p.user_id = u.id;

-- 3. Grant access to roles
GRANT SELECT ON user_profiles TO anon, authenticated, service_role;
