-- Komplettes Setup für team@ausbildungsbasis.de
-- Erstellt User, Company und Company-User-Verbindung

-- 1. Überprüfung: Existiert der User?
SELECT '=== USER ÜBERPRÜFUNG ===' as info;

SELECT 'Bestehende User:' as info, id, email, created_at 
FROM auth.users 
WHERE email = 'team@ausbildungsbasis.de';

-- 2. Falls User nicht existiert, erstelle ihn
-- (Hinweis: User muss über Supabase Auth erstellt werden, nicht direkt in der DB)

-- 3. Erstelle Company für Ausbildungsbasis
SELECT '=== COMPANY ERSTELLEN ===' as info;

INSERT INTO companies (
  id,
  name,
  description,
  industry,
  plan_type,
  active_tokens,
  seats,
  subscription_status,
  website_url,
  main_location
) VALUES (
  'ausbildungsbasis-main-2025',
  'Ausbildungsbasis',
  'Hauptunternehmen für Ausbildungsbasis - Bildung und Ausbildung',
  'Bildung',
  'premium',
  1000,
  10,
  'active',
  'https://ausbildungsbasis.de',
  'Deutschland'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  active_tokens = EXCLUDED.active_tokens,
  seats = EXCLUDED.seats,
  subscription_status = EXCLUDED.subscription_status;

-- 4. Zeige alle Companies
SELECT 'Alle Companies:' as info, id, name, plan_type, active_tokens, seats, subscription_status
FROM companies;

-- 5. Anweisungen für User-Erstellung
SELECT '=== NÄCHSTE SCHRITTE ===' as info;

SELECT '1. Erstelle User über Supabase Auth Dashboard:' as info;
SELECT '   - Gehe zu Authentication > Users' as info;
SELECT '   - Klicke "Add user"' as info;
SELECT '   - Email: team@ausbildungsbasis.de' as info;
SELECT '   - Passwort: [dein gewünschtes Passwort]' as info;
SELECT '   - Bestätige Email: true' as info;

SELECT '2. Nach User-Erstellung, führe dieses Skript aus:' as info;
SELECT '   - Kopiere die User-ID aus dem Auth Dashboard' as info;
SELECT '   - Ersetze USER_ID_PLACEHOLDER unten mit der echten ID' as info;

-- 6. Company-User-Verbindung (nach User-Erstellung)
-- Ersetze USER_ID_PLACEHOLDER mit der echten User-ID aus Supabase Auth
SELECT '=== COMPANY-USER VERBINDUNG (nach User-Erstellung) ===' as info;

-- Beispiel-Skript (ersetze die User-ID):
/*
INSERT INTO company_users (
  user_id,
  company_id,
  role,
  invited_at,
  accepted_at
) VALUES (
  'USER_ID_HIER_EINFÜGEN',  -- Ersetze mit echter User-ID
  'ausbildungsbasis-main-2025',
  'admin',
  now(),
  now()
);
*/

SELECT '=== FERTIG - FOLGE DEN ANWEISUNGEN OBEN ===' as info;
