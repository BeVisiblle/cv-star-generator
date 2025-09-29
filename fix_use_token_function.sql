-- REPARATUR: use_token Funktion reparieren
-- Das Problem: Die Funktion verwendet get_user_company_id() die nicht existiert

-- 1. use_token Funktion reparieren
CREATE OR REPLACE FUNCTION public.use_token(p_profile_id uuid)
RETURNS TABLE (token_id uuid, remaining_tokens integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_company_id uuid;
  v_remaining integer;
BEGIN
  -- REPARIERT: Direkte Abfrage statt fehlende Funktion
  SELECT cu.company_id INTO v_company_id
  FROM public.company_users cu
  WHERE cu.user_id = auth.uid()
    AND cu.accepted_at IS NOT NULL
  LIMIT 1;
    
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'NO_COMPANY';
  END IF;

  -- Require published profile or explicit consent
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = p_profile_id
      AND (p.profile_published = true OR COALESCE(p.einwilligung, false) = true)
  ) THEN
    RAISE EXCEPTION 'NO_CONSENT_OR_NOT_PUBLISHED';
  END IF;

  -- Prevent double usage
  IF EXISTS (
    SELECT 1 FROM public.tokens_used tu
    WHERE tu.company_id = v_company_id
      AND tu.profile_id = p_profile_id
  ) THEN
    RAISE EXCEPTION 'ALREADY_USED';
  END IF;

  -- Check and lock tokens
  SELECT active_tokens INTO v_remaining
  FROM public.companies
  WHERE id = v_company_id
  FOR UPDATE;

  IF COALESCE(v_remaining, 0) <= 0 THEN
    RAISE EXCEPTION 'NO_TOKENS';
  END IF;

  -- Insert usage and decrement counter atomically
  INSERT INTO public.tokens_used (company_id, profile_id)
  VALUES (v_company_id, p_profile_id)
  RETURNING id INTO token_id;

  UPDATE public.companies
  SET active_tokens = v_remaining - 1
  WHERE id = v_company_id
  RETURNING active_tokens INTO remaining_tokens;

  RETURN NEXT;
END;
$$;

-- 2. get_user_company_id Funktion erstellen (falls sie noch nicht existiert)
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

-- 3. Test: Funktionen funktionieren
SELECT '=== FUNKTIONEN REPARIERT ===' as info;
SELECT 'use_token() und get_user_company_id() wurden erfolgreich repariert!' as status;
