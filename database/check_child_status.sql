-- Check if children exist for this user's parent profile
SELECT 
    u.email,
    p.id as parent_id,
    c.id as child_id,
    c.first_name,
    c.last_name
FROM auth.users u
JOIN parents p ON u.id = p.user_id
LEFT JOIN children c ON p.id = c.parent_id
WHERE u.email = 'erivwofoundation@gmail.com';
