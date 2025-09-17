-- Final Matching System Migration
-- Clean, simple version without conflicts

-- Create candidates table for matching system (without vector embeddings for now)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table for matching system (without vector embeddings for now)
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

-- Create company_users table for RLS
CREATE TABLE IF NOT EXISTS public.company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'applied',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  decision_due_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id, job_id)
);

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (candidate_id, job_id)
);

-- Create company_follows table
CREATE TABLE IF NOT EXISTS public.company_follows (
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (candidate_id, company_id)
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
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for company_users
CREATE POLICY "Users can view their company associations" ON public.company_users
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for applications
CREATE POLICY "Candidates can manage their applications" ON public.applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.candidates c 
      WHERE c.id = applications.candidate_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for saved_jobs
CREATE POLICY "Candidates can manage their saved jobs" ON public.saved_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.candidates c 
      WHERE c.id = saved_jobs.candidate_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS Policies for company_follows
CREATE POLICY "Candidates can manage their company follows" ON public.company_follows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.candidates c 
      WHERE c.id = company_follows.candidate_id 
      AND c.user_id = auth.uid()
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

-- Create views for easier querying
CREATE OR REPLACE VIEW v_jobs_with_company AS
SELECT 
    j.*,
    c.name as company_name,
    c.logo_url as company_logo,
    c.industry as company_industry
FROM public.jobs j
JOIN public.companies c ON j.company_id = c.id
WHERE j.is_active = true;

CREATE OR REPLACE VIEW v_my_applications AS
SELECT 
    a.*,
    j.title as job_title,
    j.track,
    j.contract_type,
    c.name as company_name,
    c.logo_url as company_logo,
    CASE 
        WHEN a.decision_due_at < NOW() THEN 'overdue'
        WHEN a.decision_due_at < NOW() + INTERVAL '3 days' THEN 'urgent'
        ELSE 'normal'
    END as sla_status
FROM public.applications a
JOIN public.jobs j ON a.job_id = j.id
JOIN public.companies c ON j.company_id = c.id
WHERE a.candidate_id IN (
    SELECT id FROM public.candidates WHERE user_id = auth.uid()
);

CREATE OR REPLACE VIEW v_candidate_foryou AS
SELECT 
    cmc.*,
    j.title as job_title,
    j.description as job_description,
    j.track,
    j.contract_type,
    j.is_remote,
    j.salary_min,
    j.salary_max,
    j.benefits,
    c.name as company_name,
    c.logo_url as company_logo,
    c.industry as company_industry
FROM public.candidate_match_cache cmc
JOIN public.jobs j ON cmc.job_id = j.id
JOIN public.companies c ON j.company_id = c.id
WHERE j.is_active = true;

CREATE OR REPLACE VIEW v_job_topmatches AS
SELECT 
    mc.job_id,
    mc.candidate_id,
    mc.score,
    mc.explanation,
    mc.created_at as match_created_at,
    c.vorname,
    c.nachname,
    c.stage,
    c.bio_short,
    c.availability_date,
    c.profile_completeness,
    CASE 
        WHEN a.id IS NOT NULL THEN 'applied'
        WHEN s.id IS NOT NULL THEN 'suppressed'
        WHEN mf.feedback_type = 'rejected' THEN 'rejected'
        ELSE 'available'
    END as status,
    a.applied_at
FROM public.match_cache mc
JOIN public.candidates c ON mc.candidate_id = c.id
LEFT JOIN public.applications a ON mc.candidate_id = a.candidate_id AND mc.job_id = a.job_id
LEFT JOIN public.suppression s ON mc.candidate_id = s.candidate_id AND mc.job_id = s.job_id
LEFT JOIN public.match_feedback mf ON mc.candidate_id = mf.candidate_id AND mc.job_id = mf.job_id
WHERE mc.job_id IN (
    SELECT j.id FROM public.jobs j
    JOIN public.company_users cu ON cu.company_id = j.company_id
    WHERE cu.user_id = auth.uid()
);

-- Create RPC functions
CREATE OR REPLACE FUNCTION open_jobs_search(
    p_query TEXT DEFAULT '',
    p_track TEXT DEFAULT NULL,
    p_contract_type TEXT DEFAULT NULL,
    p_remote BOOLEAN DEFAULT NULL,
    p_radius_km INTEGER DEFAULT 50,
    p_lat FLOAT DEFAULT NULL,
    p_lng FLOAT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    job_id UUID,
    title TEXT,
    company_name TEXT,
    company_logo TEXT,
    track TEXT,
    contract_type TEXT,
    is_remote BOOLEAN,
    salary_min INTEGER,
    salary_max INTEGER,
    created_at TIMESTAMPTZ,
    distance_km FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id as job_id,
        j.title,
        c.name as company_name,
        c.logo_url as company_logo,
        j.track,
        j.contract_type,
        j.is_remote,
        j.salary_min,
        j.salary_max,
        j.created_at,
        CASE 
            WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND jl.location_point IS NOT NULL THEN
                ST_Distance(
                    ST_GeogFromText('POINT(' || p_lng || ' ' || p_lat || ')'),
                    jl.location_point
                ) / 1000.0
            ELSE NULL
        END as distance_km
    FROM public.jobs j
    JOIN public.companies c ON j.company_id = c.id
    LEFT JOIN public.job_locations jl ON j.id = jl.job_id
    WHERE j.is_active = true
    AND (p_query = '' OR j.title ILIKE '%' || p_query || '%' OR j.description ILIKE '%' || p_query || '%')
    AND (p_track IS NULL OR j.track = p_track)
    AND (p_contract_type IS NULL OR j.contract_type = p_contract_type)
    AND (p_remote IS NULL OR j.is_remote = p_remote)
    AND (p_lat IS NULL OR p_lng IS NULL OR jl.location_point IS NULL OR 
         ST_DWithin(
             ST_GeogFromText('POINT(' || p_lng || ' ' || p_lat || ')'),
             jl.location_point,
             p_radius_km * 1000
         ))
    ORDER BY 
        CASE WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN distance_km ELSE 0 END,
        j.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION apply_to_job(p_job_id UUID)
RETURNS JSON AS $$
DECLARE
    candidate_uuid UUID;
BEGIN
    -- Get candidate ID for current user
    SELECT id INTO candidate_uuid 
    FROM public.candidates 
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    IF candidate_uuid IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Candidate profile not found');
    END IF;
    
    -- Insert application
    INSERT INTO public.applications (candidate_id, job_id, status, decision_due_at)
    VALUES (candidate_uuid, p_job_id, 'applied', NOW() + INTERVAL '7 days')
    ON CONFLICT (candidate_id, job_id) DO NOTHING;
    
    RETURN json_build_object('success', true, 'message', 'Application submitted successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data
INSERT INTO public.companies (name, slug, industry, size_range, description) 
SELECT 'TechCorp GmbH', 'techcorp', 'Technology', '50-200', 'Innovative technology company'
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE slug = 'techcorp');

INSERT INTO public.jobs (company_id, title, description, track, contract_type, is_remote, salary_min, salary_max, benefits) 
SELECT 
    c.id,
    'Software Developer Trainee',
    'Learn modern web development with React and Node.js',
    'ausbildung',
    'ausbildung',
    false,
    1200,
    1800,
    ARRAY['Flexible hours', 'Learning budget', 'Mentorship']
FROM public.companies c 
WHERE c.slug = 'techcorp'
AND NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Software Developer Trainee' AND company_id = c.id)
LIMIT 1;

INSERT INTO public.jobs (company_id, title, description, track, contract_type, is_remote, salary_min, salary_max, benefits)
SELECT 
    c.id,
    'Marketing Praktikant',
    'Support our marketing team with digital campaigns',
    'praktikum', 
    'praktikum',
    true,
    800,
    1200,
    ARRAY['Remote work', 'Team events']
FROM public.companies c
WHERE c.slug = 'techcorp'
AND NOT EXISTS (SELECT 1 FROM public.jobs WHERE title = 'Marketing Praktikant' AND company_id = c.id)
LIMIT 1;

-- Create job locations for the sample jobs
INSERT INTO public.job_locations (job_id, location_point, address, city)
SELECT 
    j.id,
    ST_GeogFromText('POINT(13.4050 52.5200)'), -- Berlin coordinates
    'Berlin, Germany',
    'Berlin'
FROM public.jobs j
WHERE j.title = 'Software Developer Trainee'
AND NOT EXISTS (SELECT 1 FROM public.job_locations WHERE job_id = j.id)
LIMIT 1;

INSERT INTO public.job_locations (job_id, location_point, address, city)
SELECT 
    j.id,
    ST_GeogFromText('POINT(13.4050 52.5200)'),
    'Berlin, Germany',
    'Berlin'
FROM public.jobs j
WHERE j.title = 'Marketing Praktikant'
AND NOT EXISTS (SELECT 1 FROM public.job_locations WHERE job_id = j.id)
LIMIT 1;
