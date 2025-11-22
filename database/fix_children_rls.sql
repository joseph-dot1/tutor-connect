-- Fix RLS policies for CHILDREN table
-- Allow backend/public to see children records (needed for booking validation)

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- 1. Drop potential conflicting policies
DROP POLICY IF EXISTS "Users can view their own children" ON children;
DROP POLICY IF EXISTS "Public can view children" ON children;
DROP POLICY IF EXISTS "public_view_children" ON children;
DROP POLICY IF EXISTS "Users can insert their own children" ON children;
DROP POLICY IF EXISTS "Users can update their own children" ON children;
DROP POLICY IF EXISTS "Users can delete their own children" ON children;

-- 2. Create permissive SELECT policy
CREATE POLICY "public_view_children"
ON children FOR SELECT
USING (true);

-- 3. Restore user management policies
CREATE POLICY "Users can insert their own children"
ON children FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM parents 
        WHERE id = children.parent_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own children"
ON children FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM parents 
        WHERE id = children.parent_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own children"
ON children FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM parents 
        WHERE id = children.parent_id 
        AND user_id = auth.uid()
    )
);

-- Verify
SELECT * FROM pg_policies WHERE tablename = 'children';
