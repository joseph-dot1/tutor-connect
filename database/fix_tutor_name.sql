-- Check and Fix Tutor Name Data
-- 1. Get the User ID for the Tutor
-- 2. Update the User's metadata to ensure full_name exists

DO $$
DECLARE
    target_tutor_id UUID := 'd7d2c9ea-ce35-435b-81af-59c6af1610be';
    target_user_id UUID;
BEGIN
    -- Get the user_id for the tutor
    SELECT user_id INTO target_user_id
    FROM tutors
    WHERE id = target_tutor_id;

    IF target_user_id IS NOT NULL THEN
        -- Update the user's metadata in auth.users
        -- We use a raw update because we can't easily use Supabase API from SQL for this specific auth table usually, 
        -- but in the SQL Editor we have permissions.
        UPDATE auth.users
        SET raw_user_meta_data = 
            CASE 
                WHEN raw_user_meta_data IS NULL THEN '{"full_name": "Verified Tutor"}'::jsonb
                ELSE raw_user_meta_data || '{"full_name": "Verified Tutor"}'::jsonb
            END
        WHERE id = target_user_id;
        
        RAISE NOTICE 'Updated metadata for user %', target_user_id;
    ELSE
        RAISE NOTICE 'Tutor not found with ID %', target_tutor_id;
    END IF;
END $$;

-- Verify the change
SELECT 
    t.id as tutor_id,
    t.user_id,
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name
FROM tutors t
JOIN auth.users u ON t.user_id = u.id
WHERE t.id = 'd7d2c9ea-ce35-435b-81af-59c6af1610be';
