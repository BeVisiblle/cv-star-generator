-- Create 5 test groups for testing
INSERT INTO public.groups (id, title, description, type, visibility, school, course_code, region, created_by) VALUES
(gen_random_uuid(), 'Informatik Studiengruppe', 'Gemeinsames Lernen für Informatik-Studierende', 'course', 'public', 'TU München', 'INFO-101', 'Bayern', '00000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'Mathematik Grundlagen', 'Unterstützung bei Mathematik-Grundlagen', 'course', 'public', 'Universität Hamburg', 'MATH-100', 'Hamburg', '00000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'Abschlussprüfung 2024', 'Vorbereitung auf die Abschlussprüfung', 'exam', 'private', 'Berufsschule Berlin', 'ABP-2024', 'Berlin', '00000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'Mechatroniker Azubis', 'Austausch für Mechatroniker-Auszubildende', 'profession', 'public', NULL, NULL, 'NRW', '00000000-0000-0000-0000-000000000001'),
(gen_random_uuid(), 'Fachinformatiker Netzwerk', 'Fachinformatiker vernetzen sich', 'profession', 'public', NULL, NULL, 'Baden-Württemberg', '00000000-0000-0000-0000-000000000001');

-- Enhanced group permissions and join request system
-- Add new columns to groups table for permission control
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS allow_member_invites BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT NULL;

-- Create join requests table for approval workflow
CREATE TABLE IF NOT EXISTS public.group_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES auth.users(id),
    UNIQUE(group_id, user_id)
);

-- Enable RLS on group_join_requests
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_join_requests
CREATE POLICY "Users can create join requests" ON public.group_join_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests" ON public.group_join_requests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Group owners can view and manage requests for their groups" ON public.group_join_requests
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = group_join_requests.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role IN ('owner', 'moderator')
        AND gm.status = 'active'
    )
);

-- Update group_members table to handle approval workflow
-- Add status column if it doesn't exist with more specific states
DO $$ 
BEGIN
    -- Check if we need to modify the status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%group_members_status%' 
        AND check_clause LIKE '%pending%'
    ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_status_check;
        
        -- Add new constraint with pending status
        ALTER TABLE public.group_members 
        ADD CONSTRAINT group_members_status_check 
        CHECK (status IN ('active', 'pending', 'banned', 'left'));
    END IF;
END $$;

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
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.groups;
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
DROP POLICY IF EXISTS "Group members can view their memberships" ON public.group_members;
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