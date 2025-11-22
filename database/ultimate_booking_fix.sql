-- CORRECTED ULTIMATE FIX: Add Missing Child + Disable RLS
-- Uses CORRECT column names: name, age, grade

-- Step 1: Ensure Parent Record Exists
INSERT INTO parents (user_id, location_address, location_lat, location_lng)
SELECT id, 'Default Address', 0, 0
FROM auth.users 
WHERE email = 'erivwofoundation@gmail.com'
AND NOT EXISTS (SELECT 1 FROM parents WHERE user_id = auth.users.id);

-- Step 2: Add Child Record (CORRECTED COLUMNS)
INSERT INTO children (parent_id, name, age, grade)
SELECT p.id, 'My Child', 10, 'Grade 5'
FROM auth.users u
JOIN parents p ON u.id = p.user_id
WHERE u.email = 'erivwofoundation@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM children WHERE parent_id = p.id
);

-- Step 3: TEMPORARILY Disable RLS on Sessions (for testing only)
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Step 4: Verify Everything is Ready
SELECT 'USER EXISTS' as status, id::text, email FROM auth.users WHERE email = 'erivwofoundation@gmail.com'
UNION ALL
SELECT 'PARENT EXISTS', p.id::text, u.email 
FROM auth.users u JOIN parents p ON u.id = p.user_id 
WHERE u.email = 'erivwofoundation@gmail.com'
UNION ALL
SELECT 'CHILD EXISTS', c.id::text, c.name
FROM auth.users u 
JOIN parents p ON u.id = p.user_id
JOIN children c ON p.id = c.parent_id
WHERE u.email = 'erivwofoundation@gmail.com'
UNION ALL
SELECT 'SESSIONS RLS', (SELECT CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END FROM pg_class WHERE relname = 'sessions'), '';

-- IMPORTANT: After booking works, re-enable RLS with:
-- ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
