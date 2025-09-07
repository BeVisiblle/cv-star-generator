-- Create public view for job listings
CREATE OR REPLACE VIEW public_job_listings AS
SELECT
  j.id,
  j.slug,
  j.company_id,
  c.name AS company_name,
  j.title,
  j.category,
  j.city,
  j.country,
  j.work_mode,
  j.employment,
  j.salary_currency,
  j.salary_min,
  j.salary_max,
  j.salary_interval,
  j.published_at,
  left(coalesce(j.description_md,''), 400) AS description_snippet
FROM job_posts j
JOIN companies c ON c.id = j.company_id
WHERE j.is_active = true AND j.is_public = true;

-- Grant access to public view
GRANT SELECT ON public_job_listings TO anon;

-- Create candidates table (minimal)
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  full_name text,
  email text,
  phone text,
  city text,
  country text,
  languages text[],
  skills text[],
  cv_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, email)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'portal',
  stage text NOT NULL DEFAULT 'new',
  unread boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create application events table
CREATE TABLE IF NOT EXISTS application_events (
  id bigserial PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidates
CREATE POLICY candidates_company_access ON candidates
  FOR ALL USING (has_company_access(company_id))
  WITH CHECK (has_company_access(company_id));

-- RLS Policies for applications
CREATE POLICY applications_company_access ON applications
  FOR ALL USING (has_company_access(company_id))
  WITH CHECK (has_company_access(company_id));

-- RLS Policies for application events
CREATE POLICY app_events_company_access ON application_events
  FOR ALL USING (
    has_company_access((SELECT company_id FROM applications a WHERE a.id = application_events.application_id))
  )
  WITH CHECK (
    has_company_access((SELECT company_id FROM applications a WHERE a.id = application_events.application_id))
  );

-- One-Click Apply function (without login)
CREATE OR REPLACE FUNCTION apply_one_click(
  p_job uuid,
  p_full_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_cv_url text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE jid uuid; company_id uuid; app uuid; cand uuid;
BEGIN
  -- Only for published, active jobs
  SELECT id, company_id INTO jid, company_id FROM job_posts 
  WHERE id = p_job AND is_public = true AND is_active = true;
  
  IF jid IS NULL THEN 
    RAISE EXCEPTION 'job_not_public_or_inactive'; 
  END IF;

  -- Upsert candidate by email
  INSERT INTO candidates(company_id, full_name, email, phone, cv_url)
  VALUES (company_id, p_full_name, lower(trim(p_email)), p_phone, p_cv_url)
  ON CONFLICT (company_id, email) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, candidates.phone),
        cv_url = COALESCE(EXCLUDED.cv_url, candidates.cv_url)
  RETURNING id INTO cand;

  -- Create application
  INSERT INTO applications(company_id, job_id, candidate_id, source, stage, unread)
  VALUES (company_id, jid, cand, 'portal', 'new', true)
  RETURNING id INTO app;

  -- Log event
  INSERT INTO application_events(application_id, type, payload)
  VALUES (app, 'created', jsonb_build_object('source','one_click'));

  RETURN app;
END $$;

-- Grant execute permissions
REVOKE ALL ON FUNCTION apply_one_click(uuid,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION apply_one_click(uuid,text,text,text,text) TO anon, authenticated;