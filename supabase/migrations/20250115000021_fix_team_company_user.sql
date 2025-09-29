-- Create test company user with existing user
-- This will link an existing user to a company for testing

-- 1. Create a test company
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
  phone,
  website_url
) VALUES (
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Test Company GmbH',
  'Test-Unternehmen für Company Dashboard Testing',
  'IT',
  'Berlin',
  '11-25',
  'premium',
  100,
  3,
  'active',
  'test@company.com',
  'Max Mustermann',
  '+49 30 12345678',
  'https://test-company.com'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  active_tokens = EXCLUDED.active_tokens;

-- 2. Link the existing team@ausbildungsbasis.de user to this company
-- First, let's find the user_id for team@ausbildungsbasis.de
-- We'll use a more direct approach by updating the existing company_users entry

-- Update the existing company_users entry to point to our new test company
UPDATE public.company_users 
SET company_id = '44444444-4444-4444-4444-444444444444'::uuid,
    accepted_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'team@ausbildungsbasis.de'
);

-- If no existing entry, create a new one
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
  id,
  '44444444-4444-4444-4444-444444444444'::uuid,
  'admin',
  now(),
  now()
FROM auth.users 
WHERE email = 'team@ausbildungsbasis.de'
AND NOT EXISTS (
  SELECT 1 FROM public.company_users 
  WHERE user_id = auth.users.id
);

-- 3. Create company settings
INSERT INTO public.company_settings (
  id,
  company_id,
  target_status,
  target_industries,
  target_locations
) VALUES (
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444'::uuid,
  '["azubis", "schueler"]'::jsonb,
  '["it", "handwerk"]'::jsonb,
  '["Berlin", "München"]'::jsonb
) ON CONFLICT DO NOTHING;
