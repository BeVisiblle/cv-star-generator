-- Complete the group system with functions and policies
-- Function to handle join request approval
CREATE OR REPLACE FUNCTION public.approve_join_request(request_id UUID, approve BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    req RECORD;
    group_record RECORD;
BEGIN
    -- Get the request details
    SELECT * INTO req FROM public.group_join_requests WHERE id = request_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Join request not found';
    END IF;
    
    -- Get group details
    SELECT * INTO group_record FROM public.groups WHERE id = req.group_id;
    
    -- Check if current user can approve (owner or moderator)
    IF NOT EXISTS (
        SELECT 1 FROM public.group_members 
        WHERE group_id = req.group_id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'moderator')
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Not authorized to approve requests for this group';
    END IF;
    
    -- Update request status
    UPDATE public.group_join_requests 
    SET 
        status = CASE WHEN approve THEN 'approved' ELSE 'rejected' END,
        responded_at = now(),
        responded_by = auth.uid()
    WHERE id = request_id;
    
    -- If approved, add user to group
    IF approve THEN
        INSERT INTO public.group_members (group_id, user_id, role, status)
        VALUES (req.group_id, req.user_id, 'member', 'active')
        ON CONFLICT (group_id, user_id) DO UPDATE SET
            status = 'active',
            joined_at = now();
    END IF;
    
    RETURN approve;
END;
$$;

-- Enhanced RLS policies for groups table
DROP POLICY IF EXISTS "Groups visibility based on type and membership" ON public.groups;
CREATE POLICY "Groups visibility based on type and membership" ON public.groups
FOR SELECT USING (
    visibility = 'public' 
    OR auth.uid() IS NOT NULL 
    OR EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = groups.id 
        AND gm.user_id = auth.uid() 
        AND gm.status = 'active'
    )
);

-- Update group_members RLS for better member visibility control
DROP POLICY IF EXISTS "Group members and moderators can view memberships" ON public.group_members;
CREATE POLICY "Group members and moderators can view memberships" ON public.group_members
FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = group_members.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role IN ('owner', 'moderator')
        AND gm.status = 'active'
    )
    OR EXISTS (
        SELECT 1 FROM public.groups g 
        WHERE g.id = group_members.group_id 
        AND g.visibility = 'public'
    )
);

-- Create function to join group (with approval workflow)
CREATE OR REPLACE FUNCTION public.join_group(group_uuid UUID, join_message TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    group_record RECORD;
    existing_member RECORD;
    existing_request RECORD;
BEGIN
    -- Get group details
    SELECT * INTO group_record FROM public.groups WHERE id = group_uuid;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Group not found';
    END IF;
    
    -- Check if already a member
    SELECT * INTO existing_member FROM public.group_members 
    WHERE group_id = group_uuid AND user_id = auth.uid();
    
    IF FOUND AND existing_member.status = 'active' THEN
        RETURN 'already_member';
    END IF;
    
    -- Check for existing pending request
    SELECT * INTO existing_request FROM public.group_join_requests 
    WHERE group_id = group_uuid AND user_id = auth.uid() AND status = 'pending';
    
    IF FOUND THEN
        RETURN 'request_pending';
    END IF;
    
    -- If group requires approval, create join request
    IF group_record.require_approval THEN
        INSERT INTO public.group_join_requests (group_id, user_id, message)
        VALUES (group_uuid, auth.uid(), join_message);
        RETURN 'request_created';
    ELSE
        -- Direct join
        INSERT INTO public.group_members (group_id, user_id, role, status)
        VALUES (group_uuid, auth.uid(), 'member', 'active')
        ON CONFLICT (group_id, user_id) DO UPDATE SET
            status = 'active',
            joined_at = now();
        RETURN 'joined';
    END IF;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_join_requests_group_id ON public.group_join_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_user_id ON public.group_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_status ON public.group_join_requests(status);
CREATE INDEX IF NOT EXISTS idx_group_members_group_status ON public.group_members(group_id, status);

-- Update the test groups with different permission settings
UPDATE public.groups SET 
    require_approval = true,
    max_members = 20
WHERE title = 'Abschlussprüfung 2024';

UPDATE public.groups SET 
    require_approval = false,
    allow_member_invites = true,
    max_members = 50
WHERE title IN ('Informatik Studiengruppe', 'Mathematik Grundlagen');

UPDATE public.groups SET 
    require_approval = true,
    allow_member_invites = false,
    max_members = 100
WHERE title IN ('Mechatroniker Azubis', 'Fachinformatiker Netzwerk');