-- REPARATUR: Fehlende get_user_company_id() Funktion erstellen
-- Das Problem: Die Funktion wird in Edge Functions und RLS Policies verwendet, existiert aber nicht

-- 1. Fehlende Funktion erstellen
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT cu.company_id
  FROM public.company_users cu
  WHERE cu.user_id = auth.uid()
    AND cu.accepted_at IS NOT NULL
  LIMIT 1;
$$;

-- 2. Zusätzliche Hilfsfunktionen erstellen
CREATE OR REPLACE FUNCTION public.is_company_member()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.company_users
    WHERE user_id = auth.uid()
      AND accepted_at IS NOT NULL
  );
$$;

-- 3. RLS Policies reparieren (falls sie die Funktion verwenden)
DROP POLICY IF EXISTS "Company users can view their company" ON public.companies;
CREATE POLICY "Company users can view their company" ON public.companies
  FOR SELECT USING (
    id = public.get_user_company_id() OR
    EXISTS (
      SELECT 1 FROM public.company_users
      WHERE user_id = auth.uid()
        AND company_id = companies.id
        AND accepted_at IS NOT NULL
    )
  );

-- 4. Test: Funktion funktioniert
SELECT '=== FUNKTION ERSTELLT ===' as info;
SELECT 'get_user_company_id() Funktion wurde erfolgreich erstellt!' as status;

-- 5. Test-Abfrage
SELECT '=== TEST ABFRAGE ===' as info;
SELECT public.get_user_company_id() as company_id;
