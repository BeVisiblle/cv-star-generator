-- Job Edit and Publishing System
-- This migration adds support for job editing, versioning, and publishing workflows

-- Create job edit history table for tracking changes
CREATE TABLE IF NOT EXISTS public.job_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  
  -- Edit details
  edited_by UUID NOT NULL REFERENCES auth.users(id),
  edit_type TEXT NOT NULL CHECK (edit_type IN ('create', 'update', 'publish', 'unpublish', 'delete')),
  edit_reason TEXT,
  
  -- Change tracking
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  previous_values JSONB DEFAULT '{}'::jsonb,
  new_values JSONB DEFAULT '{}'::jsonb,
  
  -- Edit metadata
  edited_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create job publishing queue for scheduled publishing
CREATE TABLE IF NOT EXISTS public.job_publishing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  
  -- Publishing details
  scheduled_for TIMESTAMPTZ NOT NULL,
  publish_type TEXT NOT NULL CHECK (publish_type IN ('immediate', 'scheduled', 'recurring')),
  recurring_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  
  -- Publishing metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Publishing options
  notify_followers BOOLEAN DEFAULT true,
  social_media_share BOOLEAN DEFAULT false,
  email_notification BOOLEAN DEFAULT false
);

-- Create job approval workflow table
CREATE TABLE IF NOT EXISTS public.job_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  
  -- Approval details
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  approval_status TEXT NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  approval_notes TEXT,
  
  -- Approval metadata
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Workflow
  approval_level INTEGER DEFAULT 1,
  required_approvals INTEGER DEFAULT 1,
  current_approvals INTEGER DEFAULT 0
);

-- Create job templates table for reusable job postings
CREATE TABLE IF NOT EXISTS public.job_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Template details
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Template metadata
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create job bulk operations table for batch processing
CREATE TABLE IF NOT EXISTS public.job_bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Operation details
  operation_type TEXT NOT NULL CHECK (operation_type IN ('publish', 'unpublish', 'delete', 'update', 'duplicate')),
  operation_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Job selection
  job_ids UUID[] NOT NULL,
  filter_criteria JSONB DEFAULT '{}'::jsonb,
  
  -- Operation status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  progress INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  processed_jobs INTEGER DEFAULT 0,
  failed_jobs INTEGER DEFAULT 0,
  
  -- Results
  results JSONB DEFAULT '{}'::jsonb,
  error_log JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_edit_history_job_post_id ON public.job_edit_history(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_edit_history_edited_by ON public.job_edit_history(edited_by);
CREATE INDEX IF NOT EXISTS idx_job_edit_history_edited_at ON public.job_edit_history(edited_at);
CREATE INDEX IF NOT EXISTS idx_job_edit_history_edit_type ON public.job_edit_history(edit_type);

CREATE INDEX IF NOT EXISTS idx_job_publishing_queue_job_post_id ON public.job_publishing_queue(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_publishing_queue_scheduled_for ON public.job_publishing_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_job_publishing_queue_status ON public.job_publishing_queue(status);
CREATE INDEX IF NOT EXISTS idx_job_publishing_queue_created_by ON public.job_publishing_queue(created_by);

CREATE INDEX IF NOT EXISTS idx_job_approvals_job_post_id ON public.job_approvals(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_approvals_approver_id ON public.job_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_job_approvals_status ON public.job_approvals(approval_status);
CREATE INDEX IF NOT EXISTS idx_job_approvals_requested_at ON public.job_approvals(requested_at);

CREATE INDEX IF NOT EXISTS idx_job_templates_company_id ON public.job_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_job_templates_is_public ON public.job_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_job_templates_created_by ON public.job_templates(created_by);

CREATE INDEX IF NOT EXISTS idx_job_bulk_operations_company_id ON public.job_bulk_operations(company_id);
CREATE INDEX IF NOT EXISTS idx_job_bulk_operations_status ON public.job_bulk_operations(status);
CREATE INDEX IF NOT EXISTS idx_job_bulk_operations_created_by ON public.job_bulk_operations(created_by);

-- Enable RLS
ALTER TABLE public.job_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_publishing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bulk_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job edit history
CREATE POLICY "Companies can view edit history for their jobs" 
ON public.job_edit_history FOR SELECT 
USING (job_post_id IN (
  SELECT id FROM public.job_posts 
  WHERE company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Users can create edit history" 
ON public.job_edit_history FOR INSERT 
WITH CHECK (edited_by = auth.uid());

-- RLS Policies for job publishing queue
CREATE POLICY "Companies can manage their publishing queue" 
ON public.job_publishing_queue FOR ALL 
USING (company_id IN (
  SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

-- RLS Policies for job approvals
CREATE POLICY "Users can view their own approvals" 
ON public.job_approvals FOR SELECT 
USING (approver_id = auth.uid());

CREATE POLICY "Companies can view approvals for their jobs" 
ON public.job_approvals FOR SELECT 
USING (job_post_id IN (
  SELECT id FROM public.job_posts 
  WHERE company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
  )
));

-- RLS Policies for job templates
CREATE POLICY "Companies can manage their templates" 
ON public.job_templates FOR ALL 
USING (company_id IN (
  SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

CREATE POLICY "Public can view public templates" 
ON public.job_templates FOR SELECT 
USING (is_public = true);

-- RLS Policies for job bulk operations
CREATE POLICY "Companies can manage their bulk operations" 
ON public.job_bulk_operations FOR ALL 
USING (company_id IN (
  SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

-- Create function to log job edit
CREATE OR REPLACE FUNCTION public.log_job_edit(
  p_job_id UUID,
  p_edit_type TEXT,
  p_changes JSONB,
  p_previous_values JSONB DEFAULT '{}'::jsonb,
  p_new_values JSONB DEFAULT '{}'::jsonb,
  p_edit_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.job_edit_history (
    job_post_id,
    edited_by,
    edit_type,
    edit_reason,
    changes,
    previous_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    p_job_id,
    auth.uid(),
    p_edit_type,
    p_edit_reason,
    p_changes,
    p_previous_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to publish job
CREATE OR REPLACE FUNCTION public.publish_job(
  p_job_id UUID,
  p_publish_type TEXT DEFAULT 'immediate',
  p_scheduled_for TIMESTAMPTZ DEFAULT NULL,
  p_notify_followers BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
DECLARE
  job_record RECORD;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM public.job_posts WHERE id = p_job_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;
  
  -- Log the edit
  PERFORM public.log_job_edit(
    p_job_id,
    'publish',
    '{"is_public": true, "is_active": true, "is_draft": false}'::jsonb,
    '{"is_public": false, "is_active": false, "is_draft": true}'::jsonb,
    '{"is_public": true, "is_active": true, "is_draft": false}'::jsonb,
    'Job published'
  );
  
  -- Update job status
  UPDATE public.job_posts 
  SET 
    is_public = true,
    is_active = true,
    is_draft = false,
    published_at = COALESCE(p_scheduled_for, now()),
    updated_at = now()
  WHERE id = p_job_id;
  
  -- Add to publishing queue if scheduled
  IF p_publish_type = 'scheduled' AND p_scheduled_for IS NOT NULL THEN
    INSERT INTO public.job_publishing_queue (
      job_post_id,
      scheduled_for,
      publish_type,
      notify_followers,
      created_by
    ) VALUES (
      p_job_id,
      p_scheduled_for,
      'scheduled',
      p_notify_followers,
      auth.uid()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to unpublish job
CREATE OR REPLACE FUNCTION public.unpublish_job(p_job_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Log the edit
  PERFORM public.log_job_edit(
    p_job_id,
    'unpublish',
    '{"is_public": false, "is_active": false}'::jsonb,
    '{"is_public": true, "is_active": true}'::jsonb,
    '{"is_public": false, "is_active": false}'::jsonb,
    'Job unpublished'
  );
  
  -- Update job status
  UPDATE public.job_posts 
  SET 
    is_public = false,
    is_active = false,
    updated_at = now()
  WHERE id = p_job_id;
  
  -- Remove from publishing queue
  DELETE FROM public.job_publishing_queue 
  WHERE job_post_id = p_job_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Create function to duplicate job
CREATE OR REPLACE FUNCTION public.duplicate_job(
  p_job_id UUID,
  p_new_title TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_job_id UUID;
  job_record RECORD;
BEGIN
  -- Get original job data
  SELECT * INTO job_record FROM public.job_posts WHERE id = p_job_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;
  
  -- Create new job with same data but as draft
  INSERT INTO public.job_posts (
    company_id,
    title,
    job_type,
    team_department,
    role_family,
    description,
    description_md,
    work_mode,
    city,
    country,
    address_street,
    address_number,
    postal_code,
    state,
    employment_type,
    hours_per_week_min,
    hours_per_week_max,
    salary_min,
    salary_max,
    salary_currency,
    salary_interval,
    tasks_description,
    requirements_description,
    benefits_description,
    skills,
    languages,
    is_draft,
    is_public,
    is_active,
    created_by
  ) VALUES (
    job_record.company_id,
    COALESCE(p_new_title, job_record.title || ' (Kopie)'),
    job_record.job_type,
    job_record.team_department,
    job_record.role_family,
    job_record.description,
    job_record.description_md,
    job_record.work_mode,
    job_record.city,
    job_record.country,
    job_record.address_street,
    job_record.address_number,
    job_record.postal_code,
    job_record.state,
    job_record.employment_type,
    job_record.hours_per_week_min,
    job_record.hours_per_week_max,
    job_record.salary_min,
    job_record.salary_max,
    job_record.salary_currency,
    job_record.salary_interval,
    job_record.tasks_description,
    job_record.requirements_description,
    job_record.benefits_description,
    job_record.skills,
    job_record.languages,
    true, -- is_draft
    false, -- is_public
    false, -- is_active
    auth.uid()
  ) RETURNING id INTO new_job_id;
  
  -- Log the duplication
  PERFORM public.log_job_edit(
    new_job_id,
    'create',
    '{"source": "duplicate", "original_job_id": "' || p_job_id || '"}'::jsonb,
    '{}'::jsonb,
    '{"source": "duplicate", "original_job_id": "' || p_job_id || '"}'::jsonb,
    'Job duplicated from ' || p_job_id
  );
  
  RETURN new_job_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get job edit history
CREATE OR REPLACE FUNCTION public.get_job_edit_history(p_job_id UUID)
RETURNS TABLE (
  id UUID,
  edited_by UUID,
  edit_type TEXT,
  edit_reason TEXT,
  changes JSONB,
  edited_at TIMESTAMPTZ,
  editor_name TEXT,
  editor_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jeh.id,
    jeh.edited_by,
    jeh.edit_type,
    jeh.edit_reason,
    jeh.changes,
    jeh.edited_at,
    p.first_name || ' ' || p.last_name as editor_name,
    au.email as editor_email
  FROM public.job_edit_history jeh
  LEFT JOIN public.profiles p ON p.id = jeh.edited_by
  LEFT JOIN auth.users au ON au.id = jeh.edited_by
  WHERE jeh.job_post_id = p_job_id
  ORDER BY jeh.edited_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.log_job_edit TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_job TO authenticated;
GRANT EXECUTE ON FUNCTION public.unpublish_job TO authenticated;
GRANT EXECUTE ON FUNCTION public.duplicate_job TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_edit_history TO authenticated;

-- Create trigger to automatically log job updates
CREATE OR REPLACE FUNCTION public.trigger_log_job_updates()
RETURNS TRIGGER AS $$
DECLARE
  changes JSONB := '{}'::jsonb;
  key TEXT;
BEGIN
  -- Compare old and new values to detect changes
  FOR key IN SELECT unnest(array['title', 'description', 'work_mode', 'city', 'employment_type', 'salary_min', 'salary_max', 'is_public', 'is_active', 'is_draft']) LOOP
    IF OLD IS NULL OR (OLD->key) IS DISTINCT FROM (NEW->key) THEN
      changes := changes || jsonb_build_object(key, jsonb_build_object('old', OLD->key, 'new', NEW->key));
    END IF;
  END LOOP;
  
  -- Only log if there are actual changes
  IF jsonb_object_keys(changes) IS NOT NULL THEN
    PERFORM public.log_job_edit(
      NEW.id,
      'update',
      changes,
      to_jsonb(OLD),
      to_jsonb(NEW),
      'Job updated'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_job_updates
  AFTER UPDATE ON public.job_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_log_job_updates();
