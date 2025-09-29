-- Simple fix for team@ausbildungsbasis.de
-- Run this in Supabase Dashboard > SQL Editor

-- Step 1: Clean up problematic entries
DELETE FROM public.company_users 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de'
) 
AND accepted_at IS NULL;

-- Step 2: Create a simple company
INSERT INTO public.companies (
  id,
  name,
  description,
  industry,
  main_location,
  size_range,
  plan_type,
  active_tokens,
  seats,
  subscription_status,
  primary_email
) VALUES (
  '77777777-7777-7777-7777-777777777777'::uuid,
  'Ausbildungsbasis Test',
  'Test Company für team@ausbildungsbasis.de',
  'IT',
  'Berlin',
  '11-25',
  'premium',
  100,
  3,
  'active',
  'team@ausbildungsbasis.de'
);

-- Step 3: Link user to company
INSERT INTO public.company_users (
  user_id,
  company_id,
  role,
  invited_at,
  accepted_at
)
SELECT 
  u.id,
  '77777777-7777-7777-7777-777777777777'::uuid,
  'admin',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'team@ausbildungsbasis.de';

-- Step 4: Verify
SELECT 
  u.email,
  cu.role,
  cu.accepted_at,
  c.name as company_name
FROM auth.users u
JOIN public.company_users cu ON u.id = cu.user_id
JOIN public.companies c ON cu.company_id = c.id
WHERE u.email = 'team@ausbildungsbasis.de';
