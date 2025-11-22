-- Fix: Ensure the user has a PARENT profile
-- Updated to include required fields (location_address)

INSERT INTO parents (user_id, location_address, location_lat, location_lng)
SELECT 
    id, 
    'Default Address', -- Placeholder address to satisfy NOT NULL constraint
    0,                 -- Default latitude
    0                  -- Default longitude
FROM auth.users 
WHERE email = 'erivwofoundation@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM parents WHERE user_id = auth.users.id
);

-- Verify the fix
SELECT 
    u.email,
    p.id as parent_id,
    p.location_address,
    CASE WHEN p.id IS NOT NULL THEN 'SUCCESS: Parent Profile Exists' ELSE 'ERROR: Still Missing' END as status
FROM auth.users u
LEFT JOIN parents p ON u.id = p.user_id
WHERE u.email = 'erivwofoundation@gmail.com';
