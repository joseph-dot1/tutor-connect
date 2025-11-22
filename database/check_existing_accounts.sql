-- Check all existing users and their roles
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'role' as role,
    u.email_confirmed_at,
    u.created_at
FROM auth.users u
ORDER BY created_at DESC;

-- Check for parent records
SELECT 
    p.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name
FROM parents p
JOIN auth.users u ON p.user_id = u.id;

-- Check for tutor records  
SELECT 
    t.id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name
FROM tutors t
JOIN auth.users u ON t.user_id = u.id;

-- Check for existing sessions/bookings
SELECT 
    s.id,
    s.subject,
    s.session_date,
    s.status,
    s.created_at
FROM sessions s
ORDER BY created_at DESC
LIMIT 10;
