-- ForYou Matching System Migration - FIXED VERSION
-- Uses IF NOT EXISTS and OR REPLACE to avoid conflicts

-- Candidate match cache for ForYou recommendations
CREATE TABLE IF NOT EXISTS candidate_match_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    explanation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

-- Enable RLS
ALTER TABLE candidate_match_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own match cache" ON candidate_match_cache;
CREATE POLICY "Users can view their own match cache" ON candidate_match_cache
    FOR SELECT USING (candidate_id = current_user_id());

DROP POLICY IF EXISTS "System can manage match cache" ON candidate_match_cache;
CREATE POLICY "System can manage match cache" ON candidate_match_cache
    FOR ALL USING (true); -- Will be restricted in production

-- View for ForYou jobs with match data
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
FROM candidate_match_cache cmc
JOIN jobs j ON cmc.job_id = j.id
JOIN companies c ON j.company_id = c.id
WHERE j.is_active = true;

-- RPC function to prune old matches
CREATE OR REPLACE FUNCTION prune_cmc_for_candidate(p_candidate_id UUID)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Keep only top 100 matches per candidate
    WITH ranked_matches AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC, created_at DESC) as rn
        FROM candidate_match_cache
        WHERE candidate_id = p_candidate_id
    )
    DELETE FROM candidate_match_cache
    WHERE id IN (
        SELECT id FROM ranked_matches WHERE rn > 100
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View that includes job details for easier querying
CREATE OR REPLACE VIEW v_candidate_foryou_with_jobs AS
SELECT 
    cmc.candidate_id,
    cmc.job_id,
    cmc.score,
    cmc.explanation,
    cmc.created_at as match_created_at,
    j.title,
    j.description,
    j.track,
    j.contract_type,
    j.is_remote,
    j.salary_min,
    j.salary_max,
    j.benefits,
    j.created_at as job_created_at,
    c.name as company_name,
    c.logo_url as company_logo,
    c.industry,
    c.size_range,
    CASE 
        WHEN a.id IS NOT NULL THEN 'applied'
        ELSE 'available'
    END as application_status
FROM candidate_match_cache cmc
JOIN jobs j ON cmc.job_id = j.id
JOIN companies c ON j.company_id = c.id
LEFT JOIN applications a ON cmc.candidate_id = a.candidate_id AND cmc.job_id = a.job_id
WHERE j.is_active = true;

-- Insert sample match data for testing (only if not exists)
INSERT INTO candidate_match_cache (candidate_id, job_id, score, explanation)
SELECT 
    (SELECT id FROM candidates LIMIT 1),
    j.id,
    0.85,
    '{"overall": 0.85, "skills_match": 0.9, "location_fit": 0.8, "experience_level": 0.85}'
FROM jobs j
WHERE j.title = 'Software Developer Trainee'
AND NOT EXISTS (
    SELECT 1 FROM candidate_match_cache cmc 
    WHERE cmc.job_id = j.id 
    AND cmc.candidate_id = (SELECT id FROM candidates LIMIT 1)
)
LIMIT 1;

INSERT INTO candidate_match_cache (candidate_id, job_id, score, explanation)
SELECT 
    (SELECT id FROM candidates LIMIT 1),
    j.id,
    0.75,
    '{"overall": 0.75, "skills_match": 0.7, "location_fit": 1.0, "experience_level": 0.8}'
FROM jobs j
WHERE j.title = 'Marketing Praktikant'
AND NOT EXISTS (
    SELECT 1 FROM candidate_match_cache cmc 
    WHERE cmc.job_id = j.id 
    AND cmc.candidate_id = (SELECT id FROM candidates LIMIT 1)
)
LIMIT 1;
