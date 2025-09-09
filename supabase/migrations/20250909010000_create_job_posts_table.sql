-- Create job_posts table with all necessary columns for job posting system
CREATE TABLE IF NOT EXISTS public.job_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Basic job information
  title TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('internship', 'apprenticeship', 'professional')),
  team_department TEXT,
  role_family TEXT,
  description TEXT NOT NULL,
  
  -- Location information
  work_mode TEXT NOT NULL CHECK (work_mode IN ('onsite', 'hybrid', 'remote')),
  city TEXT NOT NULL,
  address_street TEXT,
  address_number TEXT,
  postal_code TEXT,
  state TEXT,
  country TEXT DEFAULT 'Deutschland',
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  public_transport BOOLEAN DEFAULT false,
  parking_available BOOLEAN DEFAULT false,
  barrier_free_access BOOLEAN DEFAULT false,
  commute_distance_km INTEGER,
  
  -- Time & Contract
  employment_type TEXT NOT NULL CHECK (employment_type IN ('fulltime', 'parttime', 'minijob', 'werkstudent', 'temporary', 'permanent')),
  start_immediately BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  hours_per_week_min INTEGER,
  hours_per_week_max INTEGER,
  
  -- Salary information
  salary_min INTEGER, -- in cents
  salary_max INTEGER, -- in cents
  salary_currency TEXT DEFAULT 'EUR',
  salary_interval TEXT CHECK (salary_interval IN ('hour', 'month', 'year')),
  
  -- Content descriptions
  tasks_description TEXT,
  requirements_description TEXT,
  benefits_description TEXT,
  
  -- Skills and requirements (stored as JSONB for flexibility)
  skills JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  driving_licenses JSONB DEFAULT '[]'::jsonb,
  
  -- Contact information
  contact_person_name TEXT,
  contact_person_role TEXT,
  contact_person_email TEXT,
  contact_person_phone TEXT,
  
  -- Type-specific fields (stored as JSONB for flexibility)
  internship_data JSONB,
  apprenticeship_data JSONB,
  professional_data JSONB,
  
  -- Additional meta information
  visa_sponsorship BOOLEAN DEFAULT false,
  relocation_support BOOLEAN DEFAULT false,
  travel_percentage INTEGER DEFAULT 0,
  
  -- Publication and status
  is_active BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_company_id ON public.job_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_job_type ON public.job_posts(job_type);
CREATE INDEX IF NOT EXISTS idx_job_posts_employment_type ON public.job_posts(employment_type);
CREATE INDEX IF NOT EXISTS idx_job_posts_work_mode ON public.job_posts(work_mode);
CREATE INDEX IF NOT EXISTS idx_job_posts_city ON public.job_posts(city);
CREATE INDEX IF NOT EXISTS idx_job_posts_is_public ON public.job_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_job_posts_is_active ON public.job_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_job_posts_published_at ON public.job_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_job_posts_created_at ON public.job_posts(created_at);

-- Enable RLS
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Companies can view their own job posts" 
ON public.job_posts FOR SELECT 
USING (company_id IN (
  SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

CREATE POLICY "Companies can insert their own job posts" 
ON public.job_posts FOR INSERT 
WITH CHECK (company_id IN (
  SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

CREATE POLICY "Companies can update their own job posts" 
ON public.job_posts FOR UPDATE 
USING (company_id IN (
  SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

CREATE POLICY "Companies can delete their own job posts" 
ON public.job_posts FOR DELETE 
USING (company_id IN (
  SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

-- Public can view published and active job posts
CREATE POLICY "Public can view published job posts" 
ON public.job_posts FOR SELECT 
USING (is_public = true AND is_active = true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_job_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_job_posts_updated_at
  BEFORE UPDATE ON public.job_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_posts_updated_at();

-- Create trigger to set published_at when job becomes public
CREATE OR REPLACE FUNCTION public.set_job_published_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Set published_at when job becomes public and active
  IF NEW.is_public = true AND NEW.is_active = true AND OLD.is_public = false THEN
    NEW.published_at = now();
  END IF;
  
  -- Set is_draft to false when job becomes public
  IF NEW.is_public = true AND NEW.is_active = true THEN
    NEW.is_draft = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_job_published_at
  BEFORE UPDATE ON public.job_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_job_published_at();
