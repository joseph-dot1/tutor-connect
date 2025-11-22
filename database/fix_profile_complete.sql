-- 1. Fix the missing name in user metadata
-- This updates the user with email 'erivwofoundation@gmail.com'
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{full_name}',
    '"Erivwo Foundation"'
)
WHERE email = 'erivwofoundation@gmail.com';

-- 2. Fix the user_profiles view to be secure and accessible
DROP VIEW IF EXISTS user_profiles;

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

-- 3. Grant access
GRANT SELECT ON user_profiles TO anon, authenticated, service_role;
