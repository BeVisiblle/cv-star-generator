-- Einfaches Debug-Skript für Profile-Problem
-- Überprüft alle Profile und User-Daten

-- 1. Alle User in auth.users
SELECT '=== AUTH.USERS ===' as info;
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. Alle Profile in profiles Tabelle
SELECT '=== PROFILES ===' as info;
SELECT id, email, vorname, nachname, status, branche, profile_published, account_created, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- 3. User ohne Profile
SELECT '=== USER OHNE PROFIL ===' as info;
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- 4. Profile ohne User (sollte nicht passieren)
SELECT '=== PROFILE OHNE USER ===' as info;
SELECT p.id, p.email, p.vorname, p.nachname, p.created_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE au.id IS NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Company-User Status
SELECT '=== COMPANY-USER ===' as info;
SELECT cu.user_id, cu.company_id, cu.role, cu.accepted_at,
       au.email as user_email,
       c.name as company_name
FROM company_users cu
JOIN auth.users au ON cu.user_id = au.id
JOIN companies c ON cu.company_id = c.id
ORDER BY cu.created_at DESC
LIMIT 10;
