-- Matching System Foundation Migration - FIXED VERSION
-- This migration creates the complete database schema for the 6 Prompts
-- Uses IF NOT EXISTS to avoid conflicts with existing tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create enums (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE commute_mode AS ENUM ('car', 'public', 'bike', 'walk');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE access_scope AS ENUM ('profile_view', 'contact_view', 'application_view');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE candidate_stage AS ENUM ('available', 'interviewing', 'offered', 'hired', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_track AS ENUM ('ausbildung', 'praktikum', 'werkstudent', 'vollzeit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_contract_type AS ENUM ('vollzeit', 'teilzeit', 'minijob', 'ausbildung');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    logo_url TEXT,
    website TEXT,
    industry TEXT,
    size_range TEXT,
    description TEXT,
    culture_values TEXT[],
    benefits TEXT[],
    language_at_work TEXT DEFAULT 'de',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company locations
CREATE TABLE IF NOT EXISTS company_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    point GEOGRAPHY(POINT, 4326),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    track job_track NOT NULL,
    contract_type job_contract_type NOT NULL,
    is_remote BOOLEAN DEFAULT FALSE,
    salary_min INTEGER,
    salary_max INTEGER,
    language_at_work TEXT DEFAULT 'de',
    min_experience_months INTEGER DEFAULT 0,
    benefits TEXT[],
    shifts_required JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    quality_score FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job locations
CREATE TABLE IF NOT EXISTS job_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    location_point GEOGRAPHY(POINT, 4326),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill aliases
CREATE TABLE IF NOT EXISTS skill_aliases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vorname TEXT,
    nachname TEXT,
    email TEXT,
    telefon TEXT,
    geburtsdatum DATE,
    home_point GEOGRAPHY(POINT, 4326),
    commute_mode commute_mode DEFAULT 'car',
    max_commute_minutes INTEGER DEFAULT 30,
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    relocation_cities TEXT[],
    language_at_work TEXT DEFAULT 'de',
    availability_date DATE,
    stage candidate_stage DEFAULT 'available',
    bio_short TEXT,
    bio_long TEXT,
    profile_completeness FLOAT DEFAULT 0,
    embedding VECTOR(384),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate skills
CREATE TABLE IF NOT EXISTS candidate_skills (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    PRIMARY KEY (candidate_id, skill_id)
);

-- Candidate certifications
CREATE TABLE IF NOT EXISTS candidate_certs (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    cert_id UUID REFERENCES certs(id) ON DELETE CASCADE,
    obtained_date DATE,
    expiry_date DATE,
    PRIMARY KEY (candidate_id, cert_id)
);

-- Job skill requirements
CREATE TABLE IF NOT EXISTS job_skill_requirements (
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    required_level INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, skill_id)
);

-- Job cert requirements
CREATE TABLE IF NOT EXISTS job_cert_requirements (
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    cert_id UUID REFERENCES certs(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, cert_id)
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'applied',
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    decision_due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

-- Match cache for performance
CREATE TABLE IF NOT EXISTS match_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    explanation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);

-- Match feedback
CREATE TABLE IF NOT EXISTS match_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL,
    reason_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access grants
CREATE TABLE IF NOT EXISTS access_grants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    scope access_scope NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(job_id, candidate_id, scope)
);

-- Company candidate suppression
CREATE TABLE IF NOT EXISTS company_candidate_suppression (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    reason TEXT,
    suppressed_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, candidate_id)
);

-- Saved jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (candidate_id, job_id)
);

-- Company follows
CREATE TABLE IF NOT EXISTS company_follows (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (candidate_id, company_id)
);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_track ON jobs(track);
CREATE INDEX IF NOT EXISTS idx_jobs_contract_type ON jobs(contract_type);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON candidates(stage);
CREATE INDEX IF NOT EXISTS idx_candidates_embedding ON candidates USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE INDEX IF NOT EXISTS idx_match_cache_job_id ON match_cache(job_id);
CREATE INDEX IF NOT EXISTS idx_match_cache_candidate_id ON match_cache(candidate_id);
CREATE INDEX IF NOT EXISTS idx_match_cache_score ON match_cache(score);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS set_updated_at_companies ON companies;
CREATE TRIGGER set_updated_at_companies
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_jobs ON jobs;
CREATE TRIGGER set_updated_at_jobs
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_candidates ON candidates;
CREATE TRIGGER set_updated_at_candidates
    BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_candidate_suppression ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_follows ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_company_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT company_id 
        FROM company_users 
        WHERE user_id = current_user_id()
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies (basic - will be expanded)
DROP POLICY IF EXISTS "Users can view their own candidate profile" ON candidates;
CREATE POLICY "Users can view their own candidate profile" ON candidates
    FOR ALL USING (user_id = current_user_id());

DROP POLICY IF EXISTS "Companies can view their own jobs" ON jobs;
CREATE POLICY "Companies can view their own jobs" ON jobs
    FOR ALL USING (company_id = current_company_id());

DROP POLICY IF EXISTS "Users can view active jobs" ON jobs;
CREATE POLICY "Users can view active jobs" ON jobs
    FOR SELECT USING (is_active = true);

-- Insert sample data (only if not exists)
INSERT INTO companies (name, slug, industry, size_range, description) 
SELECT 'TechCorp GmbH', 'techcorp', 'Technology', '50-200', 'Innovative technology company'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE slug = 'techcorp');

INSERT INTO skills (name, category) 
SELECT 'JavaScript', 'Programming'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'JavaScript');

INSERT INTO skills (name, category) 
SELECT 'Python', 'Programming'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Python');

INSERT INTO skills (name, category) 
SELECT 'React', 'Frontend'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'React');

INSERT INTO skills (name, category) 
SELECT 'Node.js', 'Backend'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Node.js');

INSERT INTO skills (name, category) 
SELECT 'Teamwork', 'Soft Skills'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Teamwork');

INSERT INTO skills (name, category) 
SELECT 'Communication', 'Soft Skills'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Communication');

INSERT INTO certs (name, category) 
SELECT 'Führerschein Klasse B', 'Transport'
WHERE NOT EXISTS (SELECT 1 FROM certs WHERE name = 'Führerschein Klasse B');

INSERT INTO certs (name, category) 
SELECT 'Erste Hilfe', 'Safety'
WHERE NOT EXISTS (SELECT 1 FROM certs WHERE name = 'Erste Hilfe');

INSERT INTO certs (name, category) 
SELECT 'ISO 9001', 'Quality'
WHERE NOT EXISTS (SELECT 1 FROM certs WHERE name = 'ISO 9001');

INSERT INTO certs (name, category) 
SELECT 'AWS Certified', 'Cloud'
WHERE NOT EXISTS (SELECT 1 FROM certs WHERE name = 'AWS Certified');

-- Create views for easier querying
CREATE OR REPLACE VIEW v_jobs_with_company AS
SELECT 
    j.*,
    c.name as company_name,
    c.logo_url as company_logo,
    c.industry as company_industry
FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE j.is_active = true;

CREATE OR REPLACE VIEW v_candidate_public AS
SELECT 
    id,
    vorname,
    nachname,
    stage,
    bio_short,
    availability_date,
    profile_completeness
FROM candidates;

-- Create RPC functions
CREATE OR REPLACE FUNCTION apply_to_job(p_candidate UUID, p_job UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    INSERT INTO applications (candidate_id, job_id, status, decision_due_at)
    VALUES (p_candidate, p_job, 'applied', NOW() + INTERVAL '7 days')
    ON CONFLICT (candidate_id, job_id) DO NOTHING;
    
    RETURN json_build_object('success', true, 'message', 'Application submitted');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
