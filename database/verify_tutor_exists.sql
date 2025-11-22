-- Check if this specific tutor exists
SELECT * FROM tutors WHERE id = 'd7d2c9ea-ce35-435b-81af-59c6af1610be';

-- Also check by user_id
SELECT t.*, u.email 
FROM tutors t
LEFT JOIN auth.users u ON t.user_id = u.id
WHERE u.email = 'erivwofoundation@gmail.com';
