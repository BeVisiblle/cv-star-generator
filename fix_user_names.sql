-- Schneller Fix für "Unbekannter Nutzer" Problem
-- Repariert fehlende vorname/nachname in profiles

-- 1. Überprüfung: Profile ohne Namen
SELECT '=== PROFILE OHNE NAMEN ===' as info;
SELECT id, email, vorname, nachname, status, branche
FROM profiles
WHERE (vorname IS NULL OR vorname = '') 
   OR (nachname IS NULL OR nachname = '')
ORDER BY created_at DESC;

-- 2. Reparatur: Namen aus Email extrahieren (falls möglich)
UPDATE profiles 
SET 
  vorname = CASE 
    WHEN vorname IS NULL OR vorname = '' THEN 
      CASE 
        WHEN email ~ '^[a-zA-Z0-9._%+-]+@' THEN 
          INITCAP(SPLIT_PART(SPLIT_PART(email, '@', 1), '.', 1))
        ELSE 'User'
      END
    ELSE vorname
  END,
  nachname = CASE 
    WHEN nachname IS NULL OR nachname = '' THEN 
      CASE 
        WHEN email ~ '^[a-zA-Z0-9._%+-]+@' THEN 
          INITCAP(SPLIT_PART(SPLIT_PART(email, '@', 1), '.', 2))
        ELSE 'User'
      END
    ELSE nachname
  END
WHERE (vorname IS NULL OR vorname = '') 
   OR (nachname IS NULL OR nachname = '');

-- 3. Fallback: Für Profile ohne extrahierbare Namen
UPDATE profiles 
SET 
  vorname = COALESCE(vorname, 'User'),
  nachname = COALESCE(nachname, 'User')
WHERE vorname IS NULL OR vorname = '' OR nachname IS NULL OR nachname = '';

-- 4. Finale Überprüfung
SELECT '=== REPARIERTE PROFILE ===' as info;
SELECT id, email, vorname, nachname, status, branche
FROM profiles
ORDER BY updated_at DESC
LIMIT 10;
