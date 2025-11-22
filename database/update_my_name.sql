-- ============================================================================
-- FIX YOUR TUTOR PROFILE NAME
-- ============================================================================
-- This script updates your user profile to show your actual registered name
-- instead of "Unknown Tutor"
--
-- INSTRUCTIONS:
-- 1. Replace 'YOUR NAME HERE' below with the name you registered with
-- 2. Run this script in your Supabase SQL Editor
-- 3. Refresh your tutor profile page
-- ============================================================================

-- Step 1: Find your user ID from your tutor account
DO $$
DECLARE
    v_user_id UUID;
    v_tutor_email TEXT;
BEGIN
    -- Get the user_id for the approved tutor
    SELECT user_id INTO v_user_id
    FROM tutors
    WHERE verification_status = 'approved'
    LIMIT 1;
    
    -- Get the email for logging
    SELECT email INTO v_tutor_email
    FROM auth.users
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Found tutor account: % (User ID: %)', v_tutor_email, v_user_id;
    
    -- Update the user metadata with the correct name
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{full_name}',
        '"YOUR NAME HERE"'::jsonb  -- ← CHANGE THIS TO YOUR ACTUAL NAME
    )
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Updated user metadata with new name';
END $$;

-- Verify the update
SELECT 
    u.email,
    u.raw_user_meta_data->>'full_name' as full_name,
    t.id as tutor_id
FROM auth.users u
JOIN tutors t ON t.user_id = u.id
WHERE t.verification_status = 'approved';
