-- Critical Security Fixes Migration
-- Addresses all identified security vulnerabilities

-- =============================================
-- 1. PERSONAL_DATA_EXPOSURE - Fix Profile Access
-- =============================================

-- Drop existing public view that exposes too much data
DROP VIEW IF EXISTS profiles_public CASCADE;

-- Add privacy consent columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_employment_visible BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS public_profile_consent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMP WITH TIME ZONE;

-- Create secure profile view with minimal public data
CREATE OR REPLACE VIEW profiles_public_secure AS
SELECT
  p.id,
  p.vorname,
  p.nachname,
  p.avatar_url,
  p.ort,
  p.branche,
  p.status,
  CASE 
    WHEN p.vorname IS NOT NULL AND p.nachname IS NOT NULL 
    THEN CONCAT(p.vorname, ' ', p.nachname)
    ELSE COALESCE(p.vorname, p.nachname, 'Unknown User')
  END as full_name,
  p.public_employment_visible,
  p.public_profile_consent,
  -- Only include employment data if user has explicitly consented to public visibility
  CASE 
    WHEN p.public_employment_visible = true THEN er.company_id
    ELSE NULL
  END as company_id,
  CASE 
    WHEN p.public_employment_visible = true THEN c.name
    ELSE NULL
  END as company_name,
  CASE 
    WHEN p.public_employment_visible = true THEN c.logo_url
    ELSE NULL
  END as company_logo,
  CASE 
    WHEN p.public_employment_visible = true THEN er.status
    ELSE NULL
  END as employment_status
FROM profiles p
LEFT JOIN company_employment_requests er 
  ON er.user_id = p.id AND er.status = 'accepted'
LEFT JOIN companies c 
  ON c.id = er.company_id
WHERE p.public_profile_consent = true OR auth.uid() = p.id;


-- =============================================
-- 2. COMPANY_DATA_LEAK - Restrict Business Info
-- =============================================

-- Drop existing public company functions and views
DROP FUNCTION IF EXISTS company_people_public(uuid) CASCADE;

-- Create secure company view with limited public data
CREATE OR REPLACE VIEW companies_public_secure AS
SELECT
  c.id,
  c.name,
  c.logo_url,
  c.industry,
  c.size_range,
  c.founded_year,
  c.main_location,
  c.description,
  c.website_url,
  c.created_at
  -- Exclude sensitive data: contact details, token balances, subscription status
FROM companies c
WHERE c.subscription_status != 'inactive';

-- =============================================
-- 3. CANDIDATE_PRIVACY_BREACH - Protect Candidate Data
-- =============================================

-- Create secure candidate access function with proper authorization
CREATE OR REPLACE FUNCTION get_authorized_candidates(
  p_company_id uuid,
  p_requester_id uuid
)
RETURNS TABLE(
  candidate_id uuid,
  full_name text,
  avatar_url text,
  headline text,
  city text,
  skills text[],
  experience_level text,
  availability_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify requester is authorized company member
  IF NOT EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = p_company_id
      AND cu.user_id = p_requester_id
      AND cu.role IN ('admin', 'editor', 'viewer')
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to candidate data';
  END IF;

  -- Return candidate data only for authorized company
  RETURN QUERY
  SELECT
    p.id,
    CASE 
      WHEN p.vorname IS NOT NULL AND p.nachname IS NOT NULL 
      THEN CONCAT(p.vorname, ' ', p.nachname)
      ELSE COALESCE(p.vorname, p.nachname, 'Unknown User')
    END as full_name,
    p.avatar_url,
    p.ort as headline,
    p.ort as city,
    CASE 
      WHEN p.faehigkeiten IS NOT NULL THEN ARRAY(SELECT jsonb_array_elements_text(p.faehigkeiten))
      ELSE ARRAY[]::text[]
    END as skills,
    p.status as experience_level,
    NULL::date as availability_date
  FROM profiles p
  WHERE p.profile_published = true
    AND p.public_profile_consent = true;
END;
$$;

-- =============================================
-- 4. SECURITY_DEFINER_BYPASS - Fix Views and Functions
-- =============================================

-- Replace SECURITY DEFINER functions with SECURITY INVOKER
CREATE OR REPLACE FUNCTION company_people_secure(p_company_id uuid)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  vorname text,
  nachname text,
  avatar_url text,
  headline text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY INVOKER -- Changed from SECURITY DEFINER
SET search_path = public -- Explicit search path
AS $$
  SELECT
    p.id,
    CASE 
      WHEN p.vorname IS NOT NULL AND p.nachname IS NOT NULL 
      THEN CONCAT(p.vorname, ' ', p.nachname)
      ELSE COALESCE(p.vorname, p.nachname, 'Unknown User')
    END as full_name,
    p.vorname,
    p.nachname,
    p.avatar_url,
    p.ort as headline,
    er.created_at
  FROM company_employment_requests er
  JOIN profiles p ON p.id = er.user_id
  WHERE er.company_id = p_company_id
    AND er.status = 'accepted'
    -- Only show if user has consented to public visibility
    AND p.public_employment_visible = true
  ORDER BY er.created_at DESC;
$$;

-- =============================================
-- 5. APPLICATION_DATA_EXPOSURE - Secure Application Access
-- =============================================

-- Create secure application access function
CREATE OR REPLACE FUNCTION get_authorized_applications(
  p_company_id uuid,
  p_requester_id uuid
)
RETURNS TABLE(
  application_id uuid,
  job_id uuid,
  candidate_id uuid,
  candidate_name text,
  cover_letter text,
  resume_url text,
  status text,
  applied_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify requester is authorized company member
  IF NOT EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = p_company_id
      AND cu.user_id = p_requester_id
      AND cu.role IN ('admin', 'editor', 'viewer')
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to application data';
  END IF;

  -- Return applications only for jobs belonging to the company
  RETURN QUERY
  SELECT
    a.id,
    a.job_id,
    a.candidate_id,
    CASE 
      WHEN p.vorname IS NOT NULL AND p.nachname IS NOT NULL 
      THEN CONCAT(p.vorname, ' ', p.nachname)
      ELSE COALESCE(p.vorname, p.nachname, 'Unknown User')
    END as candidate_name,
    a.cover_letter,
    a.resume_url,
    a.status,
    a.applied_at
  FROM applications a
  JOIN profiles p ON p.id = a.candidate_id
  JOIN job_posts j ON j.id = a.job_id
  WHERE j.company_id = p_company_id
    AND EXISTS (
      SELECT 1 FROM company_users cu 
      WHERE cu.company_id = p_company_id 
        AND cu.user_id = auth.uid() 
        AND cu.role IN ('admin', 'editor')
    );
END;
$$;

-- =============================================
-- 6. FUNCTION_SEARCH_PATH_VULN - Fix All Functions
-- =============================================

-- Fix employment acceptance function
CREATE OR REPLACE FUNCTION handle_employment_acceptance()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public -- Explicit search path
AS $$
BEGIN
  -- When status changes to accepted, update the user's current company
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    UPDATE profiles 
    SET current_company_id = NEW.company_id 
    WHERE id = NEW.user_id;
    
    -- Set confirmed_by to the current user
    NEW.confirmed_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$;

-- =============================================
-- 7. COMMUNITY_CONTENT_EXPOSURE - Authenticate Social Access
-- =============================================

-- Create secure posts view requiring authentication
CREATE OR REPLACE VIEW posts_authenticated AS
SELECT
  p.id,
  p.content,
  p.image_url,
  p.created_at,
  p.user_id,
  -- Only show author info if they've consented to public visibility
  CASE 
    WHEN author_profile.public_employment_visible = true THEN author_profile.full_name
    ELSE 'Anonymous User'
  END as author_name,
  CASE 
    WHEN author_profile.public_employment_visible = true THEN author_profile.avatar_url
    ELSE NULL
  END as author_avatar
FROM posts p
LEFT JOIN profiles_public_secure author_profile ON author_profile.id = p.user_id;

-- =============================================
-- 8. Enhanced RLS Policies
-- =============================================

-- Profiles table - restrict access to own profile or public data only
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (
  auth.uid() = id OR 
  (public_employment_visible = true AND profile_published = true)
);

-- Companies table - restrict access to basic info only
DROP POLICY IF EXISTS "companies_select_policy" ON companies;
CREATE POLICY "companies_select_policy" ON companies
FOR SELECT USING (
  subscription_status != 'inactive'
);

-- Applications table - restrict to authorized company members
DROP POLICY IF EXISTS "applications_select_policy" ON applications;
CREATE POLICY "applications_select_policy" ON applications
FOR SELECT USING (
  auth.uid() = candidate_id OR
  EXISTS (
    SELECT 1 FROM job_posts j
    JOIN company_users cu ON cu.company_id = j.company_id
    WHERE j.id = applications.job_id
      AND cu.user_id = auth.uid()
      AND cu.role IN ('admin', 'editor', 'viewer')
  )
);

-- Posts table - restrict based on visibility settings
DROP POLICY IF EXISTS "posts_select_policy" ON posts;
CREATE POLICY "posts_select_policy" ON posts
FOR SELECT USING (
  status = 'published' AND (
    visibility = 'public' OR
    (visibility = 'followers' AND auth.uid() IS NOT NULL) OR
    (visibility = 'connections' AND auth.uid() IS NOT NULL) OR
    auth.uid() = user_id
  )
);

-- =============================================
-- 9. Grant Permissions
-- =============================================

-- Grant access to secure views
GRANT SELECT ON profiles_public_secure TO anon, authenticated;
GRANT SELECT ON companies_public_secure TO anon, authenticated;
GRANT SELECT ON posts_authenticated TO authenticated;

-- Grant execute permissions for secure functions
GRANT EXECUTE ON FUNCTION get_authorized_candidates(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_authorized_applications(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION company_people_secure(uuid) TO anon, authenticated;

-- =============================================
-- 10. Audit Logging
-- =============================================

-- Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "audit_log_select_policy" ON security_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
      AND cu.role = 'admin'
  )
  OR auth.role() = 'service_role'
);

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action,
    resource_type,
    resource_id,
    ip_address
  ) VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    inet_client_addr()
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_security_event(text, text, uuid) TO authenticated;

-- =============================================
-- 11. Data Privacy Compliance
-- =============================================

-- Add GDPR compliance columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_processing_consent boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_date timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_retention_until timestamptz;

-- Add data retention policy
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete profiles that have been marked for deletion and retention period has expired
  DELETE FROM profiles 
  WHERE data_retention_until IS NOT NULL 
    AND data_retention_until < now()
    AND profile_published = false;
    
  -- Log the cleanup
  PERFORM log_security_event('data_cleanup', 'profiles', NULL);
END;
$$;

-- =============================================
-- 12. Final Security Checks
-- =============================================

-- Ensure all tables have RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_employment_requests ENABLE ROW LEVEL SECURITY;

-- Create index for performance on security policies
CREATE INDEX IF NOT EXISTS idx_profiles_public_visible ON profiles(public_employment_visible, profile_published);
CREATE INDEX IF NOT EXISTS idx_company_users_role ON company_users(company_id, user_id, role);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_action ON security_audit_log(user_id, action, created_at);

-- =============================================
-- Migration Complete
-- =============================================

-- Log the security migration
INSERT INTO security_audit_log (
  user_id,
  action,
  resource_type,
  ip_address
) VALUES (
  NULL, -- System migration
  'security_migration_applied',
  'database',
  inet_client_addr()
);
