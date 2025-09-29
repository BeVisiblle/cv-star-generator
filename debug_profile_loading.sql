-- Debug-Skript für Profile-Daten in Posts
-- Überprüft ob Profile-Daten korrekt geladen werden können

-- 1. Überprüfung: Profile mit Namen
SELECT '=== PROFILE MIT NAMEN ===' as info;
SELECT id, email, vorname, nachname, status, branche, avatar_url
FROM profiles
WHERE vorname IS NOT NULL AND nachname IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 2. Überprüfung: Profile ohne Namen
SELECT '=== PROFILE OHNE NAMEN ===' as info;
SELECT id, email, vorname, nachname, status, branche
FROM profiles
WHERE vorname IS NULL OR nachname IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 3. Überprüfung: Posts mit User-Autoren
SELECT '=== POSTS MIT USER-AUTOREN ===' as info;
SELECT cp.id, cp.actor_user_id, cp.body_md, cp.created_at,
       p.vorname, p.nachname, p.status, p.branche
FROM community_posts cp
LEFT JOIN profiles p ON cp.actor_user_id = p.id
WHERE cp.actor_user_id IS NOT NULL
ORDER BY cp.created_at DESC
LIMIT 10;

-- 4. Test: Gleiche Abfrage wie in der App
SELECT '=== TEST-ABFRAGE WIE IN APP ===' as info;
SELECT p.id, p.vorname, p.nachname, p.headline, p.aktueller_beruf, p.ausbildungsbetrieb, p.avatar_url
FROM profiles p
WHERE p.id IN (
  SELECT DISTINCT actor_user_id 
  FROM community_posts 
  WHERE actor_user_id IS NOT NULL
  LIMIT 5
)
ORDER BY p.created_at DESC;
