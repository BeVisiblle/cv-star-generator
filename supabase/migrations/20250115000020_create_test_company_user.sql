-- Create a new company user for testing
-- This will create a complete company setup with a new user

-- 1. First, create a new company
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
  '22222222-2222-2222-2222-222222222222'::uuid,
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

-- 2. Create a new auth user (this will be handled by Supabase Auth)
-- We'll create a placeholder that will be updated when the user signs up
-- For now, we'll use a known UUID pattern

-- 3. Create company user relationship
-- Note: The user_id will be updated when the actual user signs up
INSERT INTO public.company_users (
  id,
  user_id,
  company_id,
  role,
  invited_at,
  accepted_at
) VALUES (
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333'::uuid, -- Placeholder UUID
  '22222222-2222-2222-2222-222222222222'::uuid,
  'admin',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- 4. Create company settings
INSERT INTO public.company_settings (
  id,
  company_id,
  target_status,
  target_industries,
  target_locations
) VALUES (
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222'::uuid,
  '["azubis", "schueler"]'::jsonb,
  '["it", "handwerk"]'::jsonb,
  '["Berlin", "München"]'::jsonb
) ON CONFLICT DO NOTHING;

-- 5. Create a profile for the company user
INSERT INTO public.profiles (
  id,
  email,
  vorname,
  nachname,
  account_created,
  profile_published
) VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'test@company.com',
  'Max',
  'Mustermann',
  true,
  false
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  vorname = EXCLUDED.vorname,
  nachname = EXCLUDED.nachname;
