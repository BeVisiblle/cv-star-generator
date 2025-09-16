-- Add Missing Columns Migration
-- This migration adds missing columns to existing tables

-- Add missing columns to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS stage candidate_stage DEFAULT 'available',
ADD COLUMN IF NOT EXISTS bio_short TEXT,
ADD COLUMN IF NOT EXISTS bio_long TEXT,
ADD COLUMN IF NOT EXISTS profile_completeness FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS embedding VECTOR(384),
ADD COLUMN IF NOT EXISTS home_point GEOGRAPHY(POINT, 4326),
ADD COLUMN IF NOT EXISTS commute_mode commute_mode DEFAULT 'car',
ADD COLUMN IF NOT EXISTS max_commute_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS relocation_cities TEXT[],
ADD COLUMN IF NOT EXISTS language_at_work TEXT DEFAULT 'de',
ADD COLUMN IF NOT EXISTS availability_date DATE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS size_range TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS culture_values TEXT[],
ADD COLUMN IF NOT EXISTS benefits TEXT[],
ADD COLUMN IF NOT EXISTS language_at_work TEXT DEFAULT 'de',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS track job_track,
ADD COLUMN IF NOT EXISTS contract_type job_contract_type,
ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS language_at_work TEXT DEFAULT 'de',
ADD COLUMN IF NOT EXISTS min_experience_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS benefits TEXT[],
ADD COLUMN IF NOT EXISTS shifts_required JSONB,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS quality_score FLOAT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create missing tables that might not exist
CREATE TABLE IF NOT EXISTS company_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    point GEOGRAPHY(POINT, 4326),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    location_point GEOGRAPHY(POINT, 4326),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_aliases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_skills (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    PRIMARY KEY (candidate_id, skill_id)
);

CREATE TABLE IF NOT EXISTS candidate_certs (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    cert_id UUID REFERENCES certs(id) ON DELETE CASCADE,
    obtained_date DATE,
    expiry_date DATE,
    PRIMARY KEY (candidate_id, cert_id)
);

CREATE TABLE IF NOT EXISTS job_skill_requirements (
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    required_level INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE IF NOT EXISTS job_cert_requirements (
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    cert_id UUID REFERENCES certs(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, cert_id)
);

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

CREATE TABLE IF NOT EXISTS match_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    explanation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS match_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL,
    reason_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_grants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    scope access_scope NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id),
    UNIQUE(job_id, candidate_id, scope)
);

CREATE TABLE IF NOT EXISTS company_candidate_suppression (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    reason TEXT,
    suppressed_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (candidate_id, job_id)
);

CREATE TABLE IF NOT EXISTS company_follows (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (candidate_id, company_id)
);

CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

CREATE TABLE IF NOT EXISTS job_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    track job_track,
    contract_type job_contract_type,
    is_remote BOOLEAN DEFAULT FALSE,
    salary_min INTEGER,
    salary_max INTEGER,
    language_at_work TEXT DEFAULT 'de',
    min_experience_months INTEGER DEFAULT 0,
    benefits TEXT[],
    shifts_required JSONB,
    requirements JSONB,
    locations JSONB,
    current_step TEXT DEFAULT 'basics',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Enable RLS on all tables
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
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_drafts ENABLE ROW LEVEL SECURITY;

-- Create helper functions for RLS
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

-- Create basic RLS policies
DROP POLICY IF EXISTS "Users can view their own candidate profile" ON candidates;
CREATE POLICY "Users can view their own candidate profile" ON candidates
    FOR ALL USING (user_id = current_user_id());

DROP POLICY IF EXISTS "Users can view active jobs" ON jobs;
CREATE POLICY "Users can view active jobs" ON jobs
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view their applications" ON applications;
CREATE POLICY "Users can view their applications" ON applications
    FOR ALL USING (candidate_id = current_user_id());

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
