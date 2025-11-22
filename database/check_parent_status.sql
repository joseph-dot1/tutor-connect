-- Check if the current user has a parent profile
SELECT 
    u.id as user_id,
    u.email,
    p.id as parent_id,
    p.created_at
FROM auth.users u
LEFT JOIN parents p ON u.id = p.user_id
WHERE u.email = 'erivwofoundation@gmail.com';

-- If parent_id is NULL, we need to create it
