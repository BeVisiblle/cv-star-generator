-- Enable RLS on applications table if not already enabled
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policy: Kandidaten können ihre eigenen Bewerbungen erstellen
CREATE POLICY "Candidates can create their own applications"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (
  candidate_id IN (
    SELECT id FROM public.candidates WHERE user_id = auth.uid()
  )
);

-- Policy: Kandidaten können ihre eigenen Bewerbungen sehen
CREATE POLICY "Candidates can view their own applications"
ON public.applications
FOR SELECT
TO authenticated
USING (
  candidate_id IN (
    SELECT id FROM public.candidates WHERE user_id = auth.uid()
  )
  OR
  company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
  )
);

-- Policy: Unternehmen können Bewerbungen für ihre Jobs sehen
CREATE POLICY "Companies can view applications for their jobs"
ON public.applications
FOR SELECT
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
  )
);

-- Policy: Unternehmen können Bewerbungen für ihre Jobs aktualisieren
CREATE POLICY "Companies can update applications for their jobs"
ON public.applications
FOR UPDATE
TO authenticated
USING (
  company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
  )
);