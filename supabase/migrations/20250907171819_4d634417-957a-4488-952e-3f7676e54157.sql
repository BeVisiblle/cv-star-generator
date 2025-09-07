-- Enums (if not already existing)
DO $$ BEGIN
  CREATE TYPE job_category AS ENUM ('ausbildung', 'praktikum', 'fachkraft', 'fuehrung', 'aushilfe');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE work_mode AS ENUM ('vor_ort', 'remote', 'hybrid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE employment_type AS ENUM ('vollzeit', 'teilzeit', 'minijob', 'werkstudent', 'praktikum', 'ausbildung');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE salary_interval AS ENUM ('hour', 'day', 'week', 'month', 'year');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE language_level AS ENUM ('a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'native');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Requirement Profiles
CREATE TABLE IF NOT EXISTS requirement_profiles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            uuid NOT NULL,
  title             text NOT NULL,
  category          job_category NOT NULL DEFAULT 'fachkraft',
  description_md    text,
  tasks_md          text,
  requirements_md   text,
  work_mode         work_mode DEFAULT 'vor_ort',
  employment        employment_type,
  duration_months   int,
  hours_per_week_min int,
  hours_per_week_max int,
  country           text,
  state             text,
  city              text,
  postal_code       text,
  salary_currency   char(3) DEFAULT 'EUR',
  salary_min        numeric(10,2),
  salary_max        numeric(10,2),
  salary_interval   salary_interval DEFAULT 'month',
  ready_for_publish boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rp_languages (
  profile_id  uuid REFERENCES requirement_profiles(id) ON DELETE CASCADE,
  lang_code   text NOT NULL,
  min_level   language_level NOT NULL,
  required    boolean DEFAULT true,
  PRIMARY KEY (profile_id, lang_code)
);

CREATE TABLE IF NOT EXISTS rp_skills (
  id          bigserial PRIMARY KEY,
  profile_id  uuid REFERENCES requirement_profiles(id) ON DELETE CASCADE,
  skill       text NOT NULL,
  must_have   boolean DEFAULT true,
  proficiency smallint
);

CREATE TABLE IF NOT EXISTS rp_certifications (
  id          bigserial PRIMARY KEY,
  profile_id  uuid REFERENCES requirement_profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  authority   text,
  mandatory   boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE requirement_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rp_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rp_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE rp_certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY rp_company_access ON requirement_profiles
  FOR ALL USING (has_company_access(org_id))
  WITH CHECK (has_company_access(org_id));

CREATE POLICY rpl_company_access ON rp_languages
  FOR ALL USING (has_company_access((SELECT org_id FROM requirement_profiles p WHERE p.id = rp_languages.profile_id)))
  WITH CHECK (has_company_access((SELECT org_id FROM requirement_profiles p WHERE p.id = rp_languages.profile_id)));

CREATE POLICY rps_company_access ON rp_skills
  FOR ALL USING (has_company_access((SELECT org_id FROM requirement_profiles p WHERE p.id = rp_skills.profile_id)))
  WITH CHECK (has_company_access((SELECT org_id FROM requirement_profiles p WHERE p.id = rp_skills.profile_id)));

CREATE POLICY rpc_company_access ON rp_certifications
  FOR ALL USING (has_company_access((SELECT org_id FROM requirement_profiles p WHERE p.id = rp_certifications.profile_id)))
  WITH CHECK (has_company_access((SELECT org_id FROM requirement_profiles p WHERE p.id = rp_certifications.profile_id)));

-- Job Posts extensions for public publishing
ALTER TABLE job_posts
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS job_posts_slug_uidx ON job_posts(slug) WHERE slug IS NOT NULL;

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
    org_id, title, description_md, tasks_md, requirements_md,
    category, work_mode, employment, duration_months,
    hours_per_week_min, hours_per_week_max,
    country, state, city, postal_code,
    salary_currency, salary_min, salary_max, salary_interval,
    is_active, is_public, published_at
  ) VALUES (
    p.org_id, p.title, p.description_md, p.tasks_md, p.requirements_md,
    p.category, p.work_mode, p.employment, p.duration_months,
    p.hours_per_week_min, p.hours_per_week_max,
    p.country, p.state, p.city, p.postal_code,
    p.salary_currency, p.salary_min, p.salary_max, p.salary_interval,
    true, p_public, now()
  ) RETURNING id INTO j;

  PERFORM ensure_job_slug(j);
  RETURN j;
END $$;