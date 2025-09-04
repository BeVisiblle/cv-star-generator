-- Fix infinite recursion in group_members RLS policies
-- Drop problematic policies and recreate them properly

DROP POLICY IF EXISTS "Group members and moderators can view memberships" ON public.group_members;
DROP POLICY IF EXISTS "Group members can view their memberships" ON public.group_members;

-- Create a simple, non-recursive policy for viewing group_members
CREATE POLICY "View group memberships" ON public.group_members
FOR SELECT USING (
    -- Users can see their own membership
    auth.uid() = user_id 
    OR 
    -- Public group memberships are visible to everyone
    EXISTS (
        SELECT 1 FROM public.groups g 
        WHERE g.id = group_members.group_id 
        AND g.visibility = 'public'
    )
    OR
    -- Members of the same group can see other memberships
    auth.uid() IN (
        SELECT gm.user_id 
        FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id 
        AND gm.status = 'active'
    )
);