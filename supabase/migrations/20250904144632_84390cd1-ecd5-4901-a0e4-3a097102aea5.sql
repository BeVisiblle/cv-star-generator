-- Fix the group type constraint issue and create test groups
-- First check what types are allowed
-- Update the groups table type constraint to include 'course', 'exam', 'profession'
ALTER TABLE public.groups DROP CONSTRAINT IF EXISTS groups_type_check;
ALTER TABLE public.groups ADD CONSTRAINT groups_type_check 
CHECK (type IN ('course', 'exam', 'profession', 'study'));

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