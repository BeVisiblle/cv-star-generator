-- Create RPC function for profiles with match
CREATE OR REPLACE FUNCTION public.profiles_with_match(
  p_company_id uuid,
  p_variant text DEFAULT 'search',
  p_limit integer DEFAULT 24,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  avatar_url text,
  role text,
  city text,
  fs text,
  seeking text,
  skills text[],
  match integer
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- For now, return profiles with basic matching logic
  -- This can be enhanced with more sophisticated matching later
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.vorname || ' ' || p.nachname, 'Unknown') as name,
    p.avatar_url,
    COALESCE(p.aktueller_beruf, p.ausbildungsberuf, 'Not specified') as role,
    COALESCE(p.ort, 'Not specified') as city,
    CASE 
      WHEN p.status = 'schueler' THEN 'Student'
      WHEN p.status = 'azubi' THEN 'Apprentice' 
      WHEN p.status = 'ausgelernt' THEN 'Graduate'
      ELSE 'Professional'
    END as fs,
    COALESCE(p.ausbildungsberuf, p.aktueller_beruf, 'Open to opportunities') as seeking,
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(p.faehigkeiten)),
      ARRAY[]::text[]
    ) as skills,
    -- Basic match score (can be enhanced)
    CASE 
      WHEN p.visibility_industry && ARRAY[
        (SELECT c.industry FROM companies c WHERE c.id = p_company_id)
      ] THEN 85
      WHEN p.ort = (SELECT c.main_location FROM companies c WHERE c.id = p_company_id) THEN 75
      ELSE 60
    END as match
  FROM public.profiles p
  WHERE p.visibility_mode = 'visible'
    AND (p_variant = 'search' OR p_variant = 'dashboard' OR p_variant = 'unlocked')
  ORDER BY 
    CASE 
      WHEN p.visibility_industry && ARRAY[
        (SELECT c.industry FROM companies c WHERE c.id = p_company_id)
      ] THEN 1
      ELSE 2
    END,
    p.updated_at DESC
  LIMIT p_limit 
  OFFSET p_offset;
END;
$$;