-- Debug-Skript für gemischten User (Profile + Company)

-- 1. User-Details prüfen
SELECT '=== USER DETAILS ===' as info;
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users 
WHERE email = 'team@ausbildungsbasis.de';

-- 2. Profile prüfen (sollte NICHT existieren für Company User)
SELECT '=== PROFILE CHECK ===' as info;
SELECT id, email, vorname, nachname, status, branche, account_created
FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de');

-- 3. Company-User prüfen (sollte existieren)
SELECT '=== COMPANY-USER CHECK ===' as info;
SELECT cu.id, cu.user_id, cu.company_id, cu.role, cu.accepted_at,
       c.name as company_name
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
WHERE cu.user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de');

-- 4. Problem: User hat sowohl Profile als auch Company-Zugang
SELECT '=== PROBLEM DIAGNOSIS ===' as info;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de'))
    THEN 'HAT PROFILE (Problem!)'
    ELSE 'KEIN PROFILE (OK)'
  END as profile_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM company_users WHERE user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de') AND accepted_at IS NOT NULL)
    THEN 'HAT COMPANY-ZUGANG (OK)'
    ELSE 'KEIN COMPANY-ZUGANG (Problem!)'
  END as company_status;

-- 5. Lösung: Profile löschen für Company User
SELECT '=== LÖSUNG: PROFILE LÖSCHEN ===' as info;
SELECT 'DELETE FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = ''team@ausbildungsbasis.de'');' as sql_command;

