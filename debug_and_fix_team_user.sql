-- Debug und Fix für team@ausbildungsbasis.de
-- Dieses Skript überprüft den aktuellen Status und repariert den User

-- 1. Aktuellen Status überprüfen
SELECT '=== AKTUELLER STATUS ===' as info;

-- User ID von team@ausbildungsbasis.de finden
SELECT 'User ID von team@ausbildungsbasis.de:' as info, id, email, created_at 
FROM auth.users 
WHERE email = 'team@ausbildungsbasis.de';

-- Alle Company-User-Einträge für diesen User anzeigen
SELECT 'Alle Company-User-Einträge:' as info, 
       cu.id, cu.user_id, cu.company_id, cu.role, cu.invited_at, cu.accepted_at,
       c.name as company_name
FROM company_users cu
LEFT JOIN companies c ON cu.company_id = c.id
WHERE cu.user_id = (
  SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de'
);

-- Alle Companies anzeigen
SELECT 'Alle Companies:' as info, id, name, plan_type, active_tokens, seats
FROM companies;

-- 2. Cleanup: Nur problematische Einträge reparieren (DATEN BEHALTEN!)
SELECT '=== REPARATUR (DATEN BEHALTEN) ===' as info;

-- Finde den besten Company-User-Eintrag (mit accepted_at gesetzt)
WITH best_entry AS (
  SELECT cu.id, cu.company_id, cu.role, cu.accepted_at
  FROM company_users cu
  WHERE cu.user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de')
    AND cu.accepted_at IS NOT NULL
  ORDER BY cu.accepted_at DESC
  LIMIT 1
)
-- Repariere den besten Eintrag: setze accepted_at auf now() falls null
UPDATE company_users 
SET accepted_at = now()
WHERE id = (SELECT id FROM best_entry)
  AND accepted_at IS NULL;

-- Falls kein akzeptierter Eintrag existiert, repariere den neuesten
WITH latest_entry AS (
  SELECT cu.id, cu.company_id, cu.role
  FROM company_users cu
  WHERE cu.user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de')
  ORDER BY cu.invited_at DESC
  LIMIT 1
)
UPDATE company_users 
SET accepted_at = now(), role = 'admin'
WHERE id = (SELECT id FROM latest_entry)
  AND accepted_at IS NULL;

-- 3. Überprüfung der Token-Verwendung (alte Daten)
SELECT '=== TOKEN-VERWENDUNG ÜBERPRÜFEN ===' as info;

-- Zeige alle verwendeten Tokens für die Company
SELECT 'Verwendete Tokens:' as info,
       tu.id, tu.profile_id, tu.used_at,
       p.first_name, p.last_name, p.email
FROM tokens_used tu
JOIN profiles p ON tu.profile_id = p.id
WHERE tu.company_id = (
  SELECT cu.company_id 
  FROM company_users cu 
  WHERE cu.user_id = (SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de')
  AND cu.accepted_at IS NOT NULL
  LIMIT 1
)
ORDER BY tu.used_at DESC;

-- 4. Finale Überprüfung
SELECT '=== FINALE ÜBERPRÜFUNG ===' as info;

-- Überprüfen ob alles korrekt repariert wurde
SELECT 'Reparierter Company-User:' as info,
       cu.id, cu.user_id, cu.company_id, cu.role, cu.accepted_at,
       c.name as company_name, c.active_tokens, c.seats
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
WHERE cu.user_id = (
  SELECT id FROM auth.users WHERE email = 'team@ausbildungsbasis.de'
)
AND cu.accepted_at IS NOT NULL;

SELECT '=== FERTIG - ALTE DATEN ERHALTEN ===' as info;
