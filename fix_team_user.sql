-- Fix existing team@ausbildungsbasis.de user
-- Run this SQL in Supabase Dashboard > SQL Editor

-- 1. First, let's see what we have
SELECT 
  u.email,
  u.id as user_id,
  cu.id as company_user_id,
  cu.company_id,
  cu.role,
  cu.accepted_at,
  c.name as company_name
FROM auth.users u
LEFT JOIN public.company_users cu ON u.id = cu.user_id
LEFT JOIN public.companies c ON cu.company_id = c.id
WHERE u.email = 'team@ausbildungsbasis.de';

-- 2. Clean up any problematic entries (with null accepted_at)
DELETE FROM public.company_users 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de'
) 
AND accepted_at IS NULL;

-- 3. Ensure we have a proper company for team@ausbildungsbasis.de
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
  primary_email,
  contact_person,
  phone
) VALUES (
  '66666666-6666-6666-6666-666666666666'::uuid,
  'Ausbildungsbasis GmbH',
  'Test-Unternehmen für team@ausbildungsbasis.de',
  'Bildung',
  'Berlin',
  '11-25',
  'premium',
  100,
  5,
  'active',
  'team@ausbildungsbasis.de',
  'Team Lead',
  '+49 30 12345678'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  active_tokens = EXCLUDED.active_tokens;

-- 4. Create/update company user relationship
INSERT INTO public.company_users (
  id,
  user_id,
  company_id,
  role,
  invited_at,
  accepted_at
)
SELECT 
  gen_random_uuid(),
  u.id,
  '66666666-6666-6666-6666-666666666666'::uuid,
  'admin',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'team@ausbildungsbasis.de'
ON CONFLICT (user_id, company_id) DO UPDATE SET
  accepted_at = now(),
  role = 'admin';

-- 5. Create company settings
INSERT INTO public.company_settings (
  id,
  company_id,
  target_status,
  target_industries,
  target_locations
) VALUES (
  gen_random_uuid(),
  '66666666-6666-6666-6666-666666666666'::uuid,
  '["azubis", "schueler"]'::jsonb,
  '["it", "handwerk", "bildung"]'::jsonb,
  '["Berlin", "München", "Frankfurt"]'::jsonb
) ON CONFLICT DO NOTHING;

-- 6. Verify the fix
SELECT 
  u.email,
  u.id as user_id,
  cu.id as company_user_id,
  cu.company_id,
  cu.role,
  cu.accepted_at,
  c.name as company_name,
  c.active_tokens
FROM auth.users u
LEFT JOIN public.company_users cu ON u.id = cu.user_id
LEFT JOIN public.companies c ON cu.company_id = c.id
WHERE u.email = 'team@ausbildungsbasis.de';
