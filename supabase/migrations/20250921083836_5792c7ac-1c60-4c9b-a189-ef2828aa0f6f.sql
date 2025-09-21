-- Create jobs table for job postings
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  requirements text,
  benefits text,
  employment_type text NOT NULL DEFAULT 'full_time',
  seniority text,
  salary_min integer,
  salary_max integer,
  currency text DEFAULT 'EUR',
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

-- Create job_locations table
CREATE TABLE public.job_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  is_remote boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create candidate_match_cache table for storing candidate-job matches
CREATE TABLE public.candidate_match_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid NOT NULL,
  job_id uuid NOT NULL,
  score numeric(3,2) NOT NULL,
  rank integer,
  is_explore boolean DEFAULT false,
  explanation jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, job_id)
);

-- Create match_cache table for storing job-candidate matches (company perspective)
CREATE TABLE public.match_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  score numeric(3,2) NOT NULL,
  rank integer,
  is_explore boolean DEFAULT false,
  explanation jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- Create match_feedback table for storing user feedback on matches
CREATE TABLE public.match_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  company_id uuid NOT NULL,
  feedback_type text NOT NULL, -- 'unlock', 'reject', 'suppress'
  reason_code text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create suppression table for managing candidate suppression
CREATE TABLE public.suppression (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  reason text NOT NULL DEFAULT 'reject_cooldown',
  suppressed_until timestamp with time zone NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- Add missing columns to candidates table
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS vorname text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS nachname text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS bio_short text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS stage text DEFAULT 'available';
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS language_level text DEFAULT 'de';
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS profile_image text;

-- Add missing columns to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS location text;

-- Enable RLS on new tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_match_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression ENABLE ROW LEVEL SECURITY;

-- RLS policies for jobs table
CREATE POLICY "Jobs are viewable by everyone" 
ON public.jobs FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Company members can manage their jobs" 
ON public.jobs FOR ALL USING (has_company_access(company_id))
WITH CHECK (has_company_access(company_id));

-- RLS policies for job_locations table
CREATE POLICY "Job locations follow job visibility" 
ON public.job_locations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.jobs j 
  WHERE j.id = job_locations.job_id 
  AND (j.is_public = true OR has_company_access(j.company_id))
));

CREATE POLICY "Company members can manage job locations" 
ON public.job_locations FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.jobs j 
  WHERE j.id = job_locations.job_id 
  AND has_company_access(j.company_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.jobs j 
  WHERE j.id = job_locations.job_id 
  AND has_company_access(j.company_id)
));

-- RLS policies for candidate_match_cache table
CREATE POLICY "Candidates can view their own matches" 
ON public.candidate_match_cache FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.candidates c 
  WHERE c.id = candidate_match_cache.candidate_id 
  AND c.user_id = auth.uid()
));

-- RLS policies for match_cache table
CREATE POLICY "Company members can view their job matches" 
ON public.match_cache FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.jobs j 
  WHERE j.id = match_cache.job_id 
  AND has_company_access(j.company_id)
));

-- RLS policies for match_feedback table
CREATE POLICY "Company members can manage match feedback" 
ON public.match_feedback FOR ALL 
USING (has_company_access(company_id))
WITH CHECK (has_company_access(company_id) AND auth.uid() = created_by);

-- RLS policies for suppression table
CREATE POLICY "Company members can manage suppression" 
ON public.suppression FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.jobs j 
  WHERE j.id = suppression.job_id 
  AND has_company_access(j.company_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.jobs j 
  WHERE j.id = suppression.job_id 
  AND has_company_access(j.company_id)
) AND auth.uid() = created_by);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_match_cache_updated_at
  BEFORE UPDATE ON public.candidate_match_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_match_cache_updated_at
  BEFORE UPDATE ON public.match_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();