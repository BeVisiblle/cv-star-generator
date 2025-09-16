-- Company TopMatches System Migration - FIXED VERSION
-- Uses IF NOT EXISTS and OR REPLACE to avoid conflicts

-- Company users table for RLS
CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, user_id)
);

-- Enable RLS
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company users
DROP POLICY IF EXISTS "Users can view their company associations" ON company_users;
CREATE POLICY "Users can view their company associations" ON company_users
    FOR SELECT USING (user_id = current_user_id());

-- Update RLS policies for companies and jobs
DROP POLICY IF EXISTS "Company users can view their company data" ON companies;
CREATE POLICY "Company users can view their company data" ON companies
    FOR ALL USING (id = current_company_id());

DROP POLICY IF EXISTS "Company users can manage their jobs" ON jobs;
CREATE POLICY "Company users can manage their jobs" ON jobs
    FOR ALL USING (company_id = current_company_id());

DROP POLICY IF EXISTS "Company users can view match cache for their jobs" ON match_cache;
CREATE POLICY "Company users can view match cache for their jobs" ON match_cache
    FOR SELECT USING (job_id IN (
        SELECT id FROM jobs WHERE company_id = current_company_id()
    ));

DROP POLICY IF EXISTS "Company users can manage match feedback for their jobs" ON match_feedback;
CREATE POLICY "Company users can manage match feedback for their jobs" ON match_feedback
    FOR ALL USING (job_id IN (
        SELECT id FROM jobs WHERE company_id = current_company_id()
    ));

DROP POLICY IF EXISTS "Company users can manage access grants for their jobs" ON access_grants;
CREATE POLICY "Company users can manage access grants for their jobs" ON access_grants
    FOR ALL USING (job_id IN (
        SELECT id FROM jobs WHERE company_id = current_company_id()
    ));

DROP POLICY IF EXISTS "Company users can manage candidate suppression" ON company_candidate_suppression;
CREATE POLICY "Company users can manage candidate suppression" ON company_candidate_suppression
    FOR ALL USING (company_id = current_company_id());

-- View for job top matches
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
        WHEN ag.id IS NOT NULL THEN 'unlocked'
        WHEN a.id IS NOT NULL THEN 'applied'
        WHEN ccs.id IS NOT NULL THEN 'suppressed'
        WHEN mf.feedback_type = 'rejected' THEN 'rejected'
        ELSE 'locked'
    END as status,
    a.applied_at,
    ag.granted_at as unlocked_at
FROM match_cache mc
JOIN candidates c ON mc.candidate_id = c.id
LEFT JOIN applications a ON mc.candidate_id = a.candidate_id AND mc.job_id = a.job_id
LEFT JOIN access_grants ag ON mc.candidate_id = ag.candidate_id AND mc.job_id = ag.job_id AND ag.scope = 'profile_view'
LEFT JOIN company_candidate_suppression ccs ON mc.candidate_id = ccs.candidate_id AND ccs.company_id = (
    SELECT company_id FROM jobs WHERE id = mc.job_id
)
LEFT JOIN match_feedback mf ON mc.candidate_id = mf.candidate_id AND mc.job_id = mf.job_id
WHERE mc.job_id IN (
    SELECT id FROM jobs WHERE company_id = current_company_id()
);

-- RPC function to mark application as "freigeschaltet"
CREATE OR REPLACE FUNCTION mark_application_freigeschaltet(
    p_job_id UUID,
    p_candidate_id UUID
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Grant profile view access
    INSERT INTO access_grants (job_id, candidate_id, scope, granted_by)
    VALUES (p_job_id, p_candidate_id, 'profile_view', current_user_id())
    ON CONFLICT (job_id, candidate_id, scope) DO NOTHING;
    
    -- Remove any suppression
    DELETE FROM company_candidate_suppression
    WHERE candidate_id = p_candidate_id 
    AND company_id = (SELECT company_id FROM jobs WHERE id = p_job_id);
    
    RETURN json_build_object('success', true, 'message', 'Candidate unlocked successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to grant profile view access
CREATE OR REPLACE FUNCTION grant_profile_view(
    p_job_id UUID,
    p_candidate_id UUID
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    INSERT INTO access_grants (job_id, candidate_id, scope, granted_by)
    VALUES (p_job_id, p_candidate_id, 'profile_view', current_user_id())
    ON CONFLICT (job_id, candidate_id, scope) DO NOTHING;
    
    RETURN json_build_object('success', true, 'message', 'Profile view granted');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample company user for testing (only if not exists)
INSERT INTO company_users (company_id, user_id, role)
SELECT 
    c.id,
    current_user_id(),
    'admin'
FROM companies c
WHERE c.slug = 'techcorp'
AND current_user_id() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM company_users cu 
    WHERE cu.company_id = c.id 
    AND cu.user_id = current_user_id()
)
LIMIT 1;

-- Insert sample match data for testing (only if not exists)
INSERT INTO match_cache (job_id, candidate_id, score, explanation)
SELECT 
    j.id,
    (SELECT id FROM candidates LIMIT 1),
    0.92,
    '{"overall": 0.92, "skills_match": 0.95, "location_fit": 0.9, "experience_level": 0.9}'
FROM jobs j
WHERE j.title = 'Software Developer Trainee'
AND NOT EXISTS (
    SELECT 1 FROM match_cache mc 
    WHERE mc.job_id = j.id 
    AND mc.candidate_id = (SELECT id FROM candidates LIMIT 1)
)
LIMIT 1;
