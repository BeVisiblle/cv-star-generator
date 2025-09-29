-- Quick fix: Create a simple test company user
-- Run this SQL directly in Supabase Dashboard

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
  phone
) VALUES (
  '55555555-5555-5555-5555-555555555555'::uuid,
  'Test Company GmbH',
  'Test-Unternehmen für Company Dashboard',
  'IT',
  'Berlin',
  '11-25',
  'premium',
  100,
  3,
  'active',
  'test@company.com',
  'Max Mustermann',
  '+49 30 12345678'
);

-- 2. Create a new auth user first
-- Go to Supabase Auth > Users > Add User
-- Email: test@company.com
-- Password: Test123456!
-- Copy the user ID and replace 'USER_ID_HERE' below

-- 3. Link user to company (replace USER_ID_HERE with actual user ID)
INSERT INTO public.company_users (
  id,
  user_id,
  company_id,
  role,
  invited_at,
  accepted_at
) VALUES (
  gen_random_uuid(),
  'USER_ID_HERE'::uuid, -- Replace with actual user ID from step 2
  '55555555-5555-5555-5555-555555555555'::uuid,
  'admin',
  now(),
  now()
);

-- 4. Create profile for the user
INSERT INTO public.profiles (
  id,
  email,
  vorname,
  nachname,
  account_created,
  profile_published
) VALUES (
  'USER_ID_HERE'::uuid, -- Same user ID as above
  'test@company.com',
  'Max',
  'Mustermann',
  true,
  false
);
