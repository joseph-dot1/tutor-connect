-- Comprehensive verification of all booking requirements for user

-- 1. Check if user exists and get their ID
SELECT 'User Check' as check_type, 
       id, 
       email,
       raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
WHERE email = 'erivwofoundation@gmail.com';

-- 2. Check if parent profile exists
SELECT 'Parent Profile Check' as check_type,
       p.id as parent_id,
       p.location_address,
       u.email
FROM auth.users u
LEFT JOIN parents p ON u.id = p.user_id
WHERE u.email = 'erivwofoundation@gmail.com';

-- 3. Check if children exist for this parent
SELECT 'Children Check' as check_type,
       c.id as child_id,
       c.first_name,
       c.last_name,
       c.grade_level,
       p.id as parent_id
FROM auth.users u
JOIN parents p ON u.id = p.user_id
LEFT JOIN children c ON p.id = c.parent_id
WHERE u.email = 'erivwofoundation@gmail.com';

-- 4. Check tutor exists and is valid
SELECT 'Tutor Check' as check_type,
       id as tutor_id,
       user_id,
       verification_status
FROM tutors
WHERE id = 'd7d2c9ea-ce35-435b-81af-59c6af1610be';

-- 5. Check RLS policies on sessions table
SELECT 'Sessions RLS Policies' as check_type,
       policyname,
       cmd,
       qual
FROM pg_policies
WHERE tablename = 'sessions';
