-- Create candidates table for matching system
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  vorname TEXT,
  nachname TEXT,
  email TEXT,
  phone TEXT,
  bio_short TEXT,
  stage TEXT NOT NULL DEFAULT 'new',
  profile_completeness DECIMAL DEFAULT 0.0,
  availability_date DATE,
  home_point GEOGRAPHY(POINT),
  commute_mode TEXT DEFAULT 'public_transport',
  max_commute_minutes INTEGER DEFAULT 60,
  willing_to_relocate BOOLEAN DEFAULT false,
  relocation_cities TEXT[],
  skills JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  embedding VECTOR(1536), -- For AI matching
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table for matching system
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  track TEXT,
  contract_type TEXT NOT NULL DEFAULT 'vollzeit',
  is_remote BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  salary_min INTEGER,
  salary_max INTEGER,
  min_experience_months INTEGER DEFAULT 0,
  benefits TEXT[],
  embedding VECTOR(1536), -- For AI matching
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_locations table for job location data
CREATE TABLE IF NOT EXISTS public.job_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  location_point GEOGRAPHY(POINT),
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Deutschland',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidate_match_cache table for candidate job recommendations
CREATE TABLE IF NOT EXISTS public.candidate_match_cache (
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  score DECIMAL NOT NULL,
  explanation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (candidate_id, job_id)
);

-- Create match_cache table for company candidate recommendations  
CREATE TABLE IF NOT EXISTS public.match_cache (
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  score DECIMAL NOT NULL,
  explanation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (job_id, candidate_id)
);

-- Create match_feedback table for tracking user feedback
CREATE TABLE IF NOT EXISTS public.match_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL, -- 'liked', 'rejected', 'suppressed', 'applied'
  feedback_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppression table for temporarily hiding candidates from jobs
CREATE TABLE IF NOT EXISTS public.suppression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  days INTEGER NOT NULL DEFAULT 30,
  reason TEXT NOT NULL DEFAULT 'reject_cooldown',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_company_id ON public.candidates(company_id);
CREATE INDEX IF NOT EXISTS idx_candidates_availability ON public.candidates(availability_date);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_job_locations_job_id ON public.job_locations(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_match_cache_candidate ON public.candidate_match_cache(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_match_cache_score ON public.candidate_match_cache(candidate_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_match_cache_job ON public.match_cache(job_id);
CREATE INDEX IF NOT EXISTS idx_match_cache_score ON public.match_cache(job_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_match_feedback_job_candidate ON public.match_feedback(job_id, candidate_id);
CREATE INDEX IF NOT EXISTS idx_suppression_job_candidate ON public.suppression(job_id, candidate_id);
CREATE INDEX IF NOT EXISTS idx_suppression_expires ON public.suppression(expires_at);

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_match_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidates
CREATE POLICY "Candidates can view their own profile" ON public.candidates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Candidates can update their own profile" ON public.candidates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Companies can view candidates for matching" ON public.candidates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = candidates.company_id
    )
  );

CREATE POLICY "Companies can insert candidates" ON public.candidates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = candidates.company_id
    )
  );

-- RLS Policies for jobs
CREATE POLICY "Companies can manage their jobs" ON public.jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.company_users cu 
      WHERE cu.user_id = auth.uid() 
      AND cu.company_id = jobs.company_id
    )
  );

CREATE POLICY "Candidates can view active jobs" ON public.jobs
  FOR SELECT USING (is_active = true);

-- RLS Policies for job_locations
CREATE POLICY "Companies can manage job locations" ON public.job_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_users cu ON cu.company_id = j.company_id
      WHERE j.id = job_locations.job_id 
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view job locations" ON public.job_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = job_locations.job_id 
      AND j.is_active = true
    )
  );

-- RLS Policies for candidate_match_cache
CREATE POLICY "Candidates can view their matches" ON public.candidate_match_cache
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.candidates c 
      WHERE c.id = candidate_match_cache.candidate_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for match_cache
CREATE POLICY "Companies can view job matches" ON public.match_cache
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_users cu ON cu.company_id = j.company_id
      WHERE j.id = match_cache.job_id 
      AND cu.user_id = auth.uid()
    )
  );

-- RLS Policies for match_feedback
CREATE POLICY "Companies can manage match feedback" ON public.match_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_users cu ON cu.company_id = j.company_id
      WHERE j.id = match_feedback.job_id 
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can view feedback on their matches" ON public.match_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.candidates c 
      WHERE c.id = match_feedback.candidate_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for suppression
CREATE POLICY "Companies can manage suppression" ON public.suppression
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.company_users cu ON cu.company_id = j.company_id
      WHERE j.id = suppression.job_id 
      AND cu.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_candidates_updated_at ON public.candidates;
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();