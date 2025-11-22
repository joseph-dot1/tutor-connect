-- Check if tutor exists in database
SELECT 
    t.*,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name
FROM tutors t
LEFT JOIN auth.users u ON t.user_id = u.id
WHERE t.id = 'd7d2dfbea-ce35-435b-81af-596caf1610be'
   OR u.email = 'erivwofoundation@gmail.com';

-- Also check all tutors in the database
SELECT 
    t.id,
    t.user_id,
    t.verification_status,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    t.created_at
FROM tutors t
LEFT JOIN auth.users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;
