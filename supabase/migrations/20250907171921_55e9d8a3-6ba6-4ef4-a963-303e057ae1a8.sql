-- Create job_posts table using existing companies table
CREATE TABLE IF NOT EXISTS job_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description_md text,
  tasks_md text,
  requirements_md text,
  category text,
  work_mode text,
  employment text,
  duration_months int,
  hours_per_week_min int,
  hours_per_week_max int,
  country text,
  state text,
  city text,
  postal_code text,
  salary_currency char(3) DEFAULT 'EUR',
  salary_min numeric(10,2),
  salary_max numeric(10,2),
  salary_interval text,
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  slug text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS job_posts_slug_uidx ON job_posts(slug) WHERE slug IS NOT NULL;

-- Enable RLS
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

-- Requirement Profiles
CREATE TABLE IF NOT EXISTS requirement_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'fachkraft',
  description_md text,
  tasks_md text,
  requirements_md text,
  work_mode text DEFAULT 'vor_ort',
  employment text,
  duration_months int,
  hours_per_week_min int,
  hours_per_week_max int,
  country text,
  state text,
  city text,
  postal_code text,
  salary_currency char(3) DEFAULT 'EUR',
  salary_min numeric(10,2),
  salary_max numeric(10,2),
  salary_interval text DEFAULT 'month',
  ready_for_publish boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE requirement_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies using existing has_company_access function
CREATE POLICY job_posts_company_access ON job_posts
  FOR ALL USING (has_company_access(company_id))
  WITH CHECK (has_company_access(company_id));

CREATE POLICY rp_company_access ON requirement_profiles
  FOR ALL USING (has_company_access(company_id))
  WITH CHECK (has_company_access(company_id));

-- Public access for published jobs
CREATE POLICY job_posts_public_select ON job_posts
  FOR SELECT TO anon
  USING (is_public = true AND is_active = true);

-- Allow anon to read company names for public jobs
CREATE POLICY companies_public_select ON companies
  FOR SELECT TO anon
  USING (EXISTS (
    SELECT 1 FROM job_posts j 
    WHERE j.company_id = companies.id 
    AND j.is_public = true 
    AND j.is_active = true
  ));

-- Slugify function
CREATE OR REPLACE FUNCTION slugify(txt text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(lower(trim(txt)), '[^a-z0-9]+', '-', 'g');
$$;

-- Ensure job slug function
CREATE OR REPLACE FUNCTION ensure_job_slug(p_job uuid)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE base text; s text; n int := 0; try text;
BEGIN
  SELECT slug INTO s FROM job_posts WHERE id = p_job;
  IF s IS NOT NULL THEN RETURN s; END IF;
  SELECT slugify(COALESCE(title,'job')) INTO base FROM job_posts WHERE id = p_job;
  LOOP
    try := base || CASE WHEN n=0 THEN '' ELSE '-'||n::text END;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM job_posts WHERE slug = try);
    n := n + 1; IF n > 999 THEN EXIT; END IF;
  END LOOP;
  UPDATE job_posts SET slug = try WHERE id = p_job;
  RETURN try;
END $$;

-- Publish requirement profile function
CREATE OR REPLACE FUNCTION publish_requirement_profile(p_profile uuid, p_public boolean DEFAULT true)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE p record; j uuid;
BEGIN
  SELECT * INTO p FROM requirement_profiles WHERE id = p_profile FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'profile_not_found'; END IF;
  IF p.ready_for_publish IS NOT TRUE THEN RAISE EXCEPTION 'profile_not_ready'; END IF;

  INSERT INTO job_posts(
    company_id, title, description_md, tasks_md, requirements_md,
    category, work_mode, employment, duration_months,
    hours_per_week_min, hours_per_week_max,
    country, state, city, postal_code,
    salary_currency, salary_min, salary_max, salary_interval,
    is_active, is_public, published_at
  ) VALUES (
    p.company_id, p.title, p.description_md, p.tasks_md, p.requirements_md,
    p.category, p.work_mode, p.employment, p.duration_months,
    p.hours_per_week_min, p.hours_per_week_max,
    p.country, p.state, p.city, p.postal_code,
    p.salary_currency, p.salary_min, p.salary_max, p.salary_interval,
    true, p_public, now()
  ) RETURNING id INTO j;

  PERFORM ensure_job_slug(j);
  RETURN j;
END $$;