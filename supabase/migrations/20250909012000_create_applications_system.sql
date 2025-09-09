-- Create applications system for job postings

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Application details
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  additional_documents JSONB DEFAULT '[]'::jsonb,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interviewed', 'rejected', 'hired', 'withdrawn')),
  
  -- View tracking
  viewed_by_company BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,
  viewed_by_user_id UUID REFERENCES auth.users(id),
  
  -- Application metadata
  applied_at TIMESTAMPTZ DEFAULT now(),
  status_updated_at TIMESTAMPTZ DEFAULT now(),
  status_updated_by UUID REFERENCES auth.users(id),
  
  -- Notes and feedback
  company_notes TEXT,
  rejection_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure one application per user per job
  UNIQUE(job_post_id, user_id)
);

-- Application views tracking (for analytics)
CREATE TABLE IF NOT EXISTS public.application_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  viewed_by UUID NOT NULL REFERENCES auth.users(id),
  view_type TEXT NOT NULL CHECK (view_type IN ('company_view', 'user_view')),
  viewed_at TIMESTAMPTZ DEFAULT now(),
  
  -- Track unique views per user per application
  UNIQUE(application_id, viewed_by, view_type)
);

-- Job post views tracking (for analytics)
CREATE TABLE IF NOT EXISTS public.job_post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  viewed_by UUID REFERENCES auth.users(id), -- NULL for anonymous views
  viewed_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  
  -- Track unique views per user per job post
  UNIQUE(job_post_id, viewed_by)
);

-- Notifications for applications
CREATE TABLE IF NOT EXISTS public.application_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('application_received', 'status_updated', 'shortlisted', 'rejected', 'hired')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_job_post_id ON public.applications(job_post_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_company_id ON public.applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON public.applications(applied_at);

CREATE INDEX IF NOT EXISTS idx_application_views_application_id ON public.application_views(application_id);
CREATE INDEX IF NOT EXISTS idx_application_views_viewed_by ON public.application_views(viewed_by);

CREATE INDEX IF NOT EXISTS idx_job_post_views_job_post_id ON public.job_post_views(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_post_views_viewed_by ON public.job_post_views(viewed_by);

CREATE INDEX IF NOT EXISTS idx_application_notifications_user_id ON public.application_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_application_notifications_read ON public.application_notifications(read);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "Users can view their own applications" 
ON public.applications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Companies can view applications for their jobs" 
ON public.applications FOR SELECT 
USING (company_id IN (
  SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create applications" 
ON public.applications FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Companies can update applications for their jobs" 
ON public.applications FOR UPDATE 
USING (company_id IN (
  SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

-- RLS Policies for application views
CREATE POLICY "Users can view their own application views" 
ON public.application_views FOR SELECT 
USING (viewed_by = auth.uid());

CREATE POLICY "Companies can view views for their applications" 
ON public.application_views FOR SELECT 
USING (application_id IN (
  SELECT a.id FROM public.applications a
  JOIN public.company_users cu ON cu.company_id = a.company_id
  WHERE cu.user_id = auth.uid()
));

CREATE POLICY "Users can create application views" 
ON public.application_views FOR INSERT 
WITH CHECK (viewed_by = auth.uid());

-- RLS Policies for job post views
CREATE POLICY "Anyone can view job post views" 
ON public.job_post_views FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create job post views" 
ON public.job_post_views FOR INSERT 
WITH CHECK (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.application_notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.application_notifications FOR UPDATE 
USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_updated_at = now();
    NEW.status_updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_applications_updated_at();

-- Function to create notification when application status changes
CREATE OR REPLACE FUNCTION public.create_application_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.application_notifications (
      application_id,
      user_id,
      company_id,
      type,
      title,
      message
    ) VALUES (
      NEW.id,
      NEW.user_id,
      NEW.company_id,
      CASE NEW.status
        WHEN 'shortlisted' THEN 'shortlisted'
        WHEN 'rejected' THEN 'rejected'
        WHEN 'hired' THEN 'hired'
        ELSE 'status_updated'
      END,
      CASE NEW.status
        WHEN 'shortlisted' THEN 'In die engere Auswahl gekommen!'
        WHEN 'rejected' THEN 'Bewerbung leider abgelehnt'
        WHEN 'hired' THEN 'Herzlichen Glückwunsch!'
        ELSE 'Bewerbungsstatus aktualisiert'
      END,
      CASE NEW.status
        WHEN 'shortlisted' THEN 'Ihre Bewerbung wurde in die engere Auswahl genommen. Das Unternehmen wird sich bald bei Ihnen melden.'
        WHEN 'rejected' THEN 'Leider wurde Ihre Bewerbung nicht berücksichtigt. Versuchen Sie es gerne bei anderen Stellenanzeigen.'
        WHEN 'hired' THEN 'Herzlichen Glückwunsch! Sie wurden für diese Position ausgewählt.'
        ELSE 'Der Status Ihrer Bewerbung wurde aktualisiert.'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_application_notification
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_application_notification();
