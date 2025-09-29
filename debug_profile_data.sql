-- Debug: Profile-Daten für team@ausbildungsbasis.de prüfen

-- 1. User-ID finden
SELECT '=== USER-ID ===' as info;
SELECT id, email FROM auth.users WHERE email = 'team@ausbildungsbasis.de';

-- 2. Profile-Daten prüfen
SELECT '=== PROFILE-DATEN ===' as info;
SELECT id, email, vorname, nachname, status, branche, account_created, created_at
FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de');

-- 3. Company-User-Daten prüfen
SELECT '=== COMPANY-USER-DATEN ===' as info;
SELECT cu.id, cu.user_id, cu.company_id, cu.role, cu.accepted_at,
       c.name as company_name
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
WHERE cu.user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de');

-- 4. Problem-Diagnose
SELECT '=== PROBLEM-DIAGNOSE ===' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de'))
    THEN 'HAT PROFILE'
    ELSE 'KEIN PROFILE'
  END as profile_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM company_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de') AND accepted_at IS NOT NULL)
    THEN 'HAT COMPANY-ZUGANG'
    ELSE 'KEIN COMPANY-ZUGANG'
  END as company_status;

