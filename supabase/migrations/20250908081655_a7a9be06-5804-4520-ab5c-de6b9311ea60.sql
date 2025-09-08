-- Extend job_posts table with comprehensive fields
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS job_type text CHECK (job_type IN ('internship', 'apprenticeship', 'professional')) DEFAULT 'professional';
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS team_department text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS role_family text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS work_mode text CHECK (work_mode IN ('onsite', 'hybrid', 'remote')) DEFAULT 'onsite';
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS address_street text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS address_number text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS country text DEFAULT 'Deutschland';
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS location_lat numeric;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS location_lng numeric;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS public_transport boolean DEFAULT false;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS parking_available boolean DEFAULT false;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS barrier_free_access boolean DEFAULT false;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS commute_distance_km integer DEFAULT 0;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS employment_type text CHECK (employment_type IN ('fulltime', 'parttime', 'minijob', 'werkstudent', 'temporary', 'permanent')) DEFAULT 'fulltime';
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS start_immediately boolean DEFAULT true;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS start_date date;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS end_date date;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS hours_per_week_min integer;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS hours_per_week_max integer;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS tasks_description text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS requirements_description text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS benefits_description text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS contact_person_name text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS contact_person_role text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS contact_person_email text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS contact_person_phone text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS contact_person_photo_url text;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS visa_sponsorship boolean DEFAULT false;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS relocation_support boolean DEFAULT false;
ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS travel_percentage integer DEFAULT 0;

-- Create table for job-specific skills
CREATE TABLE IF NOT EXISTS job_skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  skill_level integer CHECK (skill_level >= 1 AND skill_level <= 5) DEFAULT 3,
  is_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for job languages
CREATE TABLE IF NOT EXISTS job_languages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  language text NOT NULL,
  level text CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native')) DEFAULT 'B2',
  is_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for job certifications
CREATE TABLE IF NOT EXISTS job_certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  certification_name text NOT NULL,
  issuing_authority text,
  is_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for internship-specific fields
CREATE TABLE IF NOT EXISTS job_post_internships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  internship_type text CHECK (internship_type IN ('mandatory', 'voluntary')) DEFAULT 'voluntary',
  enrollment_required boolean DEFAULT false,
  field_of_study text,
  duration_weeks_min integer,
  duration_weeks_max integer,
  mentor_assigned boolean DEFAULT true,
  learning_objectives text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for apprenticeship-specific fields
CREATE TABLE IF NOT EXISTS job_post_apprenticeships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  apprenticeship_profession text NOT NULL,
  chamber text CHECK (chamber IN ('IHK', 'HWK', 'Other')),
  training_start_date date,
  duration_months integer DEFAULT 36,
  minimum_education text CHECK (minimum_education IN ('none', 'hauptschule', 'realschule', 'fachabitur', 'abitur')),
  vocational_school text,
  rotation_plan text,
  exam_support boolean DEFAULT true,
  salary_year_1_cents integer,
  salary_year_2_cents integer,
  salary_year_3_cents integer,
  salary_year_4_cents integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for professional-specific fields
CREATE TABLE IF NOT EXISTS job_post_professionals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  min_experience_years integer DEFAULT 0,
  degree_required boolean DEFAULT false,
  minimum_degree text CHECK (minimum_degree IN ('none', 'apprenticeship', 'meister', 'techniker', 'bachelor', 'master', 'phd')),
  professional_qualification text,
  probation_period_months integer DEFAULT 6,
  shift_work boolean DEFAULT false,
  on_call_duty boolean DEFAULT false,
  weekend_work boolean DEFAULT false,
  relocation_assistance boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for driving licenses
CREATE TABLE IF NOT EXISTS job_driving_licenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES job_posts(id) ON DELETE CASCADE,
  license_class text NOT NULL,
  is_required boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_post_internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_post_apprenticeships ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_post_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_driving_licenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job-related tables
CREATE POLICY "Company members can manage job skills" ON job_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_skills.job_id
      AND has_company_access(jp.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_skills.job_id
      AND has_company_access(jp.company_id)
    )
  );

CREATE POLICY "Public can view job skills" ON job_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_skills.job_id
      AND jp.is_public = true
      AND jp.is_active = true
    )
  );

CREATE POLICY "Company members can manage job languages" ON job_languages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_languages.job_id
      AND has_company_access(jp.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_languages.job_id
      AND has_company_access(jp.company_id)
    )
  );

CREATE POLICY "Public can view job languages" ON job_languages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_languages.job_id
      AND jp.is_public = true
      AND jp.is_active = true
    )
  );

CREATE POLICY "Company members can manage job certifications" ON job_certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_certifications.job_id
      AND has_company_access(jp.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_certifications.job_id
      AND has_company_access(jp.company_id)
    )
  );

CREATE POLICY "Public can view job certifications" ON job_certifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_certifications.job_id
      AND jp.is_public = true
      AND jp.is_active = true
    )
  );

CREATE POLICY "Company members can manage internship details" ON job_post_internships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_post_internships.job_id
      AND has_company_access(jp.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_post_internships.job_id
      AND has_company_access(jp.company_id)
    )
  );

CREATE POLICY "Public can view internship details" ON job_post_internships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_post_internships.job_id
      AND jp.is_public = true
      AND jp.is_active = true
    )
  );

CREATE POLICY "Company members can manage apprenticeship details" ON job_post_apprenticeships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_post_apprenticeships.job_id
      AND has_company_access(jp.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_post_apprenticeships.job_id
      AND has_company_access(jp.company_id)
    )
  );

CREATE POLICY "Public can view apprenticeship details" ON job_post_apprenticeships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_post_apprenticeships.job_id
      AND jp.is_public = true
      AND jp.is_active = true
    )
  );

CREATE POLICY "Company members can manage professional details" ON job_post_professionals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_post_professionals.job_id
      AND has_company_access(jp.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_post_professionals.job_id
      AND has_company_access(jp.company_id)
    )
  );

CREATE POLICY "Public can view professional details" ON job_post_professionals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_post_professionals.job_id
      AND jp.is_public = true
      AND jp.is_active = true
    )
  );

CREATE POLICY "Company members can manage driving licenses" ON job_driving_licenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_driving_licenses.job_id
      AND has_company_access(jp.company_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_driving_licenses.job_id
      AND has_company_access(jp.company_id)
    )
  );

CREATE POLICY "Public can view driving licenses" ON job_driving_licenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_posts jp
      WHERE jp.id = job_driving_licenses.job_id
      AND jp.is_public = true
      AND jp.is_active = true
    )
  );

-- Create function to generate job slug
CREATE OR REPLACE FUNCTION ensure_job_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(
      regexp_replace(
        regexp_replace(NEW.title, '[äöüß]', 'ae-oe-ue-ss', 'g'),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )) || '-' || substring(NEW.id::text from 1 for 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for job slug generation
DROP TRIGGER IF EXISTS job_slug_trigger ON job_posts;
CREATE TRIGGER job_slug_trigger
  BEFORE INSERT OR UPDATE ON job_posts
  FOR EACH ROW EXECUTE FUNCTION ensure_job_slug();