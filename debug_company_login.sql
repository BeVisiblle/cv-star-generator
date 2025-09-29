-- Debug-Skript für Company-User Problem
-- Überprüft alle Daten und repariert sie

-- 1. Überprüfung: Alle User in auth.users
SELECT '=== ALLE USER ===' as info;
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Überprüfung: Alle Companies
SELECT '=== ALLE COMPANIES ===' as info;
SELECT id, name, plan_type, active_tokens, seats, subscription_status
FROM companies
ORDER BY created_at DESC;

-- 3. Überprüfung: Alle Company-User-Verknüpfungen
SELECT '=== ALLE COMPANY-USER ===' as info;
SELECT cu.id, cu.user_id, cu.company_id, cu.role, cu.accepted_at,
       au.email as user_email,
       c.name as company_name
FROM company_users cu
LEFT JOIN auth.users au ON cu.user_id = au.id
LEFT JOIN companies c ON cu.company_id = c.id
ORDER BY cu.invited_at DESC;

-- 4. Überprüfung: Profile für alle User
SELECT '=== ALLE PROFILE ===' as info;
SELECT p.id, p.email, p.vorname, p.nachname, p.status, p.branche
FROM profiles p
ORDER BY p.created_at DESC;

-- 5. Test: Company-User-Abfrage wie in der App
SELECT '=== TEST COMPANY-USER ABFRAGE ===' as info;
SELECT cu.id, cu.user_id, cu.company_id, cu.role, cu.accepted_at
FROM company_users cu
WHERE cu.user_id IN (
  SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de'
)
AND cu.accepted_at IS NOT NULL
ORDER BY cu.accepted_at DESC
LIMIT 1;
