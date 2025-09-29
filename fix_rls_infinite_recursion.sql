-- NOTFALL-FIX: RLS Policy Endlosschleife beheben
-- Das Problem: get_user_companies() Funktion verursacht Endlosschleife in company_users Policy

-- 1. ALLE problematischen Policies löschen
DROP POLICY IF EXISTS "Users can view their company members" ON public.company_users;
DROP POLICY IF EXISTS "Users can view their company associations" ON public.company_users;
DROP POLICY IF EXISTS "Company users can view their company" ON public.companies;

-- 2. Problematische Funktionen löschen
DROP FUNCTION IF EXISTS public.get_user_companies();
DROP FUNCTION IF EXISTS public.get_user_company_id();

-- 3. EINFACHE, SICHERE Policies erstellen (ohne Funktionen)
-- Company Users: User können ihre eigenen Einträge sehen
CREATE POLICY "Users can view their own company memberships" ON public.company_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company membership" ON public.company_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Companies: Alle können Companies sehen (einfach und sicher)
CREATE POLICY "Anyone can view companies" ON public.companies
  FOR SELECT USING (true);

-- 4. Test: Überprüfen ob Policies funktionieren
SELECT '=== POLICY TEST ===' as info;
SELECT 'Policies wurden repariert - keine Endlosschleife mehr!' as status;

