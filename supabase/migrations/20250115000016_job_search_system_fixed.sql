-- Job Search System Migration - FIXED VERSION
-- Uses IF NOT EXISTS and OR REPLACE to avoid conflicts

-- Create search views and functions for job search
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
FROM applications a
JOIN jobs j ON a.job_id = j.id
JOIN companies c ON j.company_id = c.id
WHERE a.candidate_id = current_user_id();

-- Search function for open jobs (simplified)
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
        j.track::TEXT,
        j.contract_type::TEXT,
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
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    LEFT JOIN job_locations jl ON j.id = jl.job_id
    WHERE j.is_active = true
    AND (p_query = '' OR j.title ILIKE '%' || p_query || '%' OR j.description ILIKE '%' || p_query || '%')
    AND (p_track IS NULL OR j.track::TEXT = p_track)
    AND (p_contract_type IS NULL OR j.contract_type::TEXT = p_contract_type)
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

-- RLS Policies for job search
DROP POLICY IF EXISTS "Anyone can search open jobs" ON jobs;
CREATE POLICY "Anyone can search open jobs" ON jobs
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can view their applications" ON applications;
CREATE POLICY "Users can view their applications" ON applications
    FOR ALL USING (candidate_id = current_user_id());

-- Saved jobs policies
DROP POLICY IF EXISTS "Users can manage their saved jobs" ON saved_jobs;
CREATE POLICY "Users can manage their saved jobs" ON saved_jobs
    FOR ALL USING (candidate_id = current_user_id());

-- Company follows policies  
DROP POLICY IF EXISTS "Users can manage their company follows" ON company_follows;
CREATE POLICY "Users can manage their company follows" ON company_follows
    FOR ALL USING (candidate_id = current_user_id());

-- Insert sample jobs for testing (only if not exists)
INSERT INTO jobs (company_id, title, description, track, contract_type, is_remote, salary_min, salary_max, benefits) 
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
FROM companies c 
WHERE c.slug = 'techcorp'
AND NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Software Developer Trainee' AND company_id = c.id)
LIMIT 1;

INSERT INTO jobs (company_id, title, description, track, contract_type, is_remote, salary_min, salary_max, benefits)
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
FROM companies c
WHERE c.slug = 'techcorp'
AND NOT EXISTS (SELECT 1 FROM jobs WHERE title = 'Marketing Praktikant' AND company_id = c.id)
LIMIT 1;

-- Create job locations for the sample jobs (only if not exists)
INSERT INTO job_locations (job_id, location_point, address)
SELECT 
    j.id,
    ST_GeogFromText('POINT(13.4050 52.5200)'), -- Berlin coordinates
    'Berlin, Germany'
FROM jobs j
WHERE j.title = 'Software Developer Trainee'
AND NOT EXISTS (SELECT 1 FROM job_locations WHERE job_id = j.id)
LIMIT 1;

INSERT INTO job_locations (job_id, location_point, address)
SELECT 
    j.id,
    ST_GeogFromText('POINT(13.4050 52.5200)'),
    'Berlin, Germany'
FROM jobs j
WHERE j.title = 'Marketing Praktikant'
AND NOT EXISTS (SELECT 1 FROM job_locations WHERE job_id = j.id)
LIMIT 1;
