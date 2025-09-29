-- Einfaches SQL-Skript für Company-User-Verbindung
-- Ersetze DEINE_USER_ID_HIER mit der echten User-ID aus Supabase Auth

-- 1. Company erstellen (falls nicht vorhanden)
INSERT INTO companies (
  id,
  name,
  description,
  industry,
  plan_type,
  active_tokens,
  seats,
  subscription_status
) VALUES (
  'ausbildungsbasis-main-2025',
  'Ausbildungsbasis',
  'Hauptunternehmen für Ausbildungsbasis',
  'Bildung',
  'premium',
  1000,
  10,
  'active'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  active_tokens = EXCLUDED.active_tokens;

-- 2. Company-User-Verbindung erstellen
-- WICHTIG: Ersetze DEINE_USER_ID_HIER mit der echten User-ID!
INSERT INTO company_users (
  user_id,
  company_id,
  role,
  invited_at,
  accepted_at
) VALUES (
  'DEINE_USER_ID_HIER',  -- Ersetze mit der echten User-ID aus Supabase Auth
  'ausbildungsbasis-main-2025',
  'admin',
  now(),
  now()
);

-- 3. Überprüfung
SELECT 'Erstellter Company-User:' as info,
       cu.id, cu.user_id, cu.company_id, cu.role, cu.accepted_at,
       c.name as company_name, c.active_tokens
FROM company_users cu
JOIN companies c ON cu.company_id = c.id
WHERE cu.user_id = 'DEINE_USER_ID_HIER';  -- Ersetze mit der echten User-ID
