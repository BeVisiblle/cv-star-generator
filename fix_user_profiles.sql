-- Debug und Fix für User-Profil (Unbekannter Nutzer Problem)
-- Dieses Skript überprüft und repariert User-Profile

-- 1. Überprüfung: Alle User in auth.users
SELECT '=== ALLE USER IN AUTH.USERS ===' as info;
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. Überprüfung: Alle Profile in profiles Tabelle
SELECT '=== ALLE PROFILE ===' as info;
SELECT id, email, vorname, nachname, status, branche, profile_published, account_created
FROM profiles
ORDER BY created_at DESC;

-- 3. Überprüfung: Company-User
SELECT '=== ALLE COMPANY-USER ===' as info;
SELECT cu.id, cu.user_id, cu.company_id, cu.role, cu.accepted_at,
       c.name as company_name,
       au.email as user_email
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
JOIN auth.users au ON cu.user_id = au.id
ORDER BY cu.created_at DESC;

-- 4. Problem-Identifikation: User ohne Profil
SELECT '=== USER OHNE PROFIL ===' as info;
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN company_users cu ON au.id = cu.user_id
WHERE p.id IS NULL 
  AND cu.user_id IS NULL  -- Nicht Company-User
ORDER BY au.created_at DESC;

-- 5. Reparatur: Profile für normale User erstellen
SELECT '=== PROFILE ERSTELLEN ===' as info;

-- Erstelle Profile für alle User ohne Profil (die nicht Company-User sind)
INSERT INTO profiles (id, email, account_created, profile_published)
SELECT 
  au.id,
  au.email,
  true,
  false
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LEFT JOIN company_users cu ON au.id = cu.user_id
WHERE p.id IS NULL 
  AND cu.user_id IS NULL  -- Nicht Company-User
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  account_created = true;

-- 6. Finale Überprüfung
SELECT '=== FINALE ÜBERPRÜFUNG ===' as info;
SELECT 'Profile nach Reparatur:' as info;
SELECT p.id, p.email, p.vorname, p.nachname, p.status, p.branche, p.profile_published
FROM profiles p
ORDER BY p.created_at DESC;

SELECT '=== FERTIG ===' as info;
