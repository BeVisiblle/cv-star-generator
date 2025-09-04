-- Fix the group type constraint and create test groups with proper created_by
-- Update the groups table type constraint to include 'course', 'exam', 'profession'
ALTER TABLE public.groups DROP CONSTRAINT IF EXISTS groups_type_check;
ALTER TABLE public.groups ADD CONSTRAINT groups_type_check 
CHECK (type IN ('course', 'exam', 'profession', 'study'));

-- Create 5 test groups for testing (with NULL created_by since we don't have a real user)
INSERT INTO public.groups (id, title, description, type, visibility, school, course_code, region, created_by) VALUES
(gen_random_uuid(), 'Informatik Studiengruppe', 'Gemeinsames Lernen für Informatik-Studierende', 'course', 'public', 'TU München', 'INFO-101', 'Bayern', NULL),
(gen_random_uuid(), 'Mathematik Grundlagen', 'Unterstützung bei Mathematik-Grundlagen', 'course', 'public', 'Universität Hamburg', 'MATH-100', 'Hamburg', NULL),
(gen_random_uuid(), 'Abschlussprüfung 2024', 'Vorbereitung auf die Abschlussprüfung', 'exam', 'private', 'Berufsschule Berlin', 'ABP-2024', 'Berlin', NULL),
(gen_random_uuid(), 'Mechatroniker Azubis', 'Austausch für Mechatroniker-Auszubildende', 'profession', 'public', NULL, NULL, 'NRW', NULL),
(gen_random_uuid(), 'Fachinformatiker Netzwerk', 'Fachinformatiker vernetzen sich', 'profession', 'public', NULL, NULL, 'Baden-Württemberg', NULL);

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