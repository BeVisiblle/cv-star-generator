-- Test: Company-User-Abfrage wie in der App
-- Simuliert genau die Query aus Auth.tsx und App.tsx

-- 1. User-ID finden
SELECT '=== USER-ID FINDEN ===' as info;
SELECT id, email FROM auth.users WHERE email = 'team@ausbildungsbasis.de';

-- 2. Company-User-Abfrage (wie in Auth.tsx Zeile 33-40)
SELECT '=== COMPANY-USER ABFRAGE (Auth.tsx) ===' as info;
SELECT company_id
FROM company_users
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de')
AND accepted_at IS NOT NULL
ORDER BY accepted_at DESC
LIMIT 1;

-- 3. Company-User-Abfrage (wie in App.tsx Zeile 129-136)
SELECT '=== COMPANY-USER ABFRAGE (App.tsx) ===' as info;
SELECT *
FROM company_users
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de')
AND accepted_at IS NOT NULL
ORDER BY accepted_at DESC
LIMIT 1;

-- 4. Alle Company-User-Einträge für diesen User
SELECT '=== ALLE COMPANY-USER EINTRÄGE ===' as info;
SELECT id, user_id, company_id, role, invited_at, accepted_at
FROM company_users
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de')
ORDER BY invited_at DESC;

