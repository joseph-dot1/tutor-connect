-- Get your Tutor Profile URL
SELECT 
    'http://localhost:5173/tutor/' || t.id as CLICK_THIS_LINK,
    t.id,
    u.email
FROM tutors t
JOIN auth.users u ON t.user_id = u.id
WHERE u.email = 'erivwofoundation@gmail.com';
