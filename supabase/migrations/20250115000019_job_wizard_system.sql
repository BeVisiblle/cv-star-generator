-- Job Wizard System Migration

-- Job quality calculation function
CREATE OR REPLACE FUNCTION compute_job_quality(p_job_id UUID)
RETURNS FLOAT AS $$
DECLARE
    quality_score FLOAT := 0.0;
    job_record RECORD;
    location_count INTEGER;
    skill_count INTEGER;
    benefit_count INTEGER;
BEGIN
    -- Get job details
    SELECT * INTO job_record FROM jobs WHERE id = p_job_id;
    
    IF NOT FOUND THEN
        RETURN 0.0;
    END IF;
    
    -- Base score for required fields
    IF job_record.title IS NOT NULL AND LENGTH(TRIM(job_record.title)) > 0 THEN
        quality_score := quality_score + 0.2;
    END IF;
    
    IF job_record.description IS NOT NULL AND LENGTH(TRIM(job_record.description)) > 50 THEN
        quality_score := quality_score + 0.3;
    END IF;
    
    -- Location completeness
    SELECT COUNT(*) INTO location_count FROM job_locations WHERE job_id = p_job_id;
    IF location_count > 0 OR job_record.is_remote = true THEN
        quality_score := quality_score + 0.2;
    END IF;
    
    -- Skills completeness
    SELECT COUNT(*) INTO skill_count FROM job_skill_requirements WHERE job_id = p_job_id;
    IF skill_count > 0 THEN
        quality_score := quality_score + 0.15;
    END IF;
    
    -- Benefits completeness
    SELECT array_length(job_record.benefits, 1) INTO benefit_count;
    IF benefit_count > 0 THEN
        quality_score := quality_score + 0.1;
    END IF;
    
    -- Salary information bonus
    IF job_record.salary_min IS NOT NULL OR job_record.salary_max IS NOT NULL THEN
        quality_score := quality_score + 0.05;
    END IF;
    
    RETURN LEAST(quality_score, 1.0);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update job quality
CREATE OR REPLACE FUNCTION trg_set_job_quality()
RETURNS TRIGGER AS $$
BEGIN
    NEW.quality_score := compute_job_quality(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_job_quality
    BEFORE INSERT OR UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_job_quality();

-- RPC function to sync job requirements
CREATE OR REPLACE FUNCTION sync_job_requirements(
    p_job_id UUID,
    p_requirements JSONB
)
RETURNS JSON AS $$
DECLARE
    req JSONB;
    skill_name TEXT;
    skill_id UUID;
    required_level INTEGER;
    is_required BOOLEAN;
BEGIN
    -- Clear existing requirements
    DELETE FROM job_skill_requirements WHERE job_id = p_job_id;
    DELETE FROM job_cert_requirements WHERE job_id = p_job_id;
    
    -- Process skill requirements
    FOR req IN SELECT * FROM jsonb_array_elements(p_requirements->'skills')
    LOOP
        skill_name := req->>'name';
        required_level := COALESCE((req->>'level')::INTEGER, 1);
        is_required := COALESCE((req->>'required')::BOOLEAN, true);
        
        -- Find or create skill
        SELECT id INTO skill_id FROM skills WHERE name = skill_name;
        IF skill_id IS NULL THEN
            INSERT INTO skills (name, category) VALUES (skill_name, 'Custom') RETURNING id INTO skill_id;
        END IF;
        
        -- Add requirement
        INSERT INTO job_skill_requirements (job_id, skill_id, required_level, is_required)
        VALUES (p_job_id, skill_id, required_level, is_required);
    END LOOP;
    
    RETURN json_build_object('success', true, 'message', 'Requirements synced successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to sync job locations
CREATE OR REPLACE FUNCTION sync_job_locations(
    p_job_id UUID,
    p_locations JSONB
)
RETURNS JSON AS $$
DECLARE
    loc JSONB;
    lat FLOAT;
    lng FLOAT;
    address TEXT;
BEGIN
    -- Clear existing locations
    DELETE FROM job_locations WHERE job_id = p_job_id;
    
    -- Process locations
    FOR loc IN SELECT * FROM jsonb_array_elements(p_locations)
    LOOP
        lat := (loc->>'lat')::FLOAT;
        lng := (loc->>'lng')::FLOAT;
        address := loc->>'address';
        
        -- Add location if coordinates are valid
        IF lat IS NOT NULL AND lng IS NOT NULL THEN
            INSERT INTO job_locations (job_id, location_point, address)
            VALUES (p_job_id, ST_GeogFromText('POINT(' || lng || ' ' || lat || ')'), address);
        END IF;
    END LOOP;
    
    RETURN json_build_object('success', true, 'message', 'Locations synced successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create job drafts table for wizard
CREATE TABLE job_drafts (
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

-- Enable RLS
ALTER TABLE job_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job drafts
CREATE POLICY "Users can manage their own job drafts" ON job_drafts
    FOR ALL USING (user_id = current_user_id());

-- Apply updated_at trigger to job_drafts
CREATE TRIGGER set_updated_at_job_drafts
    BEFORE UPDATE ON job_drafts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
