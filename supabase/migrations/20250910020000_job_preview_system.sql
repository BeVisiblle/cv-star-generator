-- Job Preview and View System
-- This migration adds support for job previews, views, and user interactions

-- Create job previews table for draft previews
CREATE TABLE IF NOT EXISTS public.job_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  preview_token TEXT NOT NULL UNIQUE,
  
  -- Preview settings
  viewer_role TEXT NOT NULL CHECK (viewer_role IN ('user', 'company', 'admin')),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Preview metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Track preview usage
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ
);

-- Create job bookmarks table for user favorites
CREATE TABLE IF NOT EXISTS public.job_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Bookmark metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  
  -- Ensure one bookmark per user per job
  UNIQUE(job_post_id, user_id)
);

-- Create job shares table for tracking shares
CREATE TABLE IF NOT EXISTS public.job_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  
  -- Share details
  share_type TEXT NOT NULL CHECK (share_type IN ('email', 'social', 'link', 'embed')),
  share_platform TEXT, -- 'facebook', 'twitter', 'linkedin', etc.
  recipient_email TEXT,
  share_message TEXT,
  
  -- Share metadata
  shared_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create job interactions table for tracking user actions
CREATE TABLE IF NOT EXISTS public.job_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Interaction details
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'bookmark', 'share', 'apply', 'contact', 'download')),
  interaction_data JSONB DEFAULT '{}'::jsonb,
  
  -- Session tracking
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create job recommendations table for personalized job suggestions
CREATE TABLE IF NOT EXISTS public.job_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_post_id UUID NOT NULL REFERENCES public.job_posts(id) ON DELETE CASCADE,
  
  -- Recommendation details
  recommendation_score DECIMAL(5,2) NOT NULL,
  recommendation_reasons JSONB DEFAULT '[]'::jsonb,
  algorithm_version TEXT DEFAULT 'v1.0',
  
  -- Recommendation metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  
  -- Track recommendation performance
  was_viewed BOOLEAN DEFAULT false,
  was_applied BOOLEAN DEFAULT false,
  was_bookmarked BOOLEAN DEFAULT false,
  
  -- Ensure one recommendation per user per job
  UNIQUE(user_id, job_post_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_previews_job_post_id ON public.job_previews(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_previews_preview_token ON public.job_previews(preview_token);
CREATE INDEX IF NOT EXISTS idx_job_previews_expires_at ON public.job_previews(expires_at);

CREATE INDEX IF NOT EXISTS idx_job_bookmarks_user_id ON public.job_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_job_bookmarks_job_post_id ON public.job_bookmarks(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_bookmarks_created_at ON public.job_bookmarks(created_at);

CREATE INDEX IF NOT EXISTS idx_job_shares_job_post_id ON public.job_shares(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_shares_shared_by ON public.job_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_job_shares_shared_at ON public.job_shares(shared_at);
CREATE INDEX IF NOT EXISTS idx_job_shares_share_type ON public.job_shares(share_type);

CREATE INDEX IF NOT EXISTS idx_job_interactions_job_post_id ON public.job_interactions(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_interactions_user_id ON public.job_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_job_interactions_type ON public.job_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_job_interactions_created_at ON public.job_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_job_recommendations_user_id ON public.job_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_job_post_id ON public.job_recommendations(job_post_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_score ON public.job_recommendations(recommendation_score);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_expires_at ON public.job_recommendations(expires_at);

-- Enable RLS
ALTER TABLE public.job_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job previews
CREATE POLICY "Users can view their own job previews" 
ON public.job_previews FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "Users can create job previews" 
ON public.job_previews FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- RLS Policies for job bookmarks
CREATE POLICY "Users can view their own bookmarks" 
ON public.job_bookmarks FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own bookmarks" 
ON public.job_bookmarks FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for job shares
CREATE POLICY "Anyone can view job shares" 
ON public.job_shares FOR SELECT 
USING (true);

CREATE POLICY "Users can create job shares" 
ON public.job_shares FOR INSERT 
WITH CHECK (shared_by = auth.uid() OR shared_by IS NULL);

-- RLS Policies for job interactions
CREATE POLICY "Users can view their own interactions" 
ON public.job_interactions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Anyone can create interactions" 
ON public.job_interactions FOR INSERT 
WITH CHECK (true);

-- RLS Policies for job recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.job_recommendations FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can create recommendations" 
ON public.job_recommendations FOR INSERT 
WITH CHECK (true);

-- Create function to generate preview token
CREATE OR REPLACE FUNCTION public.generate_preview_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create function to create job preview
CREATE OR REPLACE FUNCTION public.create_job_preview(
  p_job_id UUID,
  p_viewer_role TEXT DEFAULT 'user',
  p_hours_valid INTEGER DEFAULT 24
)
RETURNS TEXT AS $$
DECLARE
  preview_token TEXT;
BEGIN
  -- Generate unique preview token
  preview_token := public.generate_preview_token();
  
  -- Insert preview record
  INSERT INTO public.job_previews (
    job_post_id,
    preview_token,
    viewer_role,
    expires_at,
    created_by
  ) VALUES (
    p_job_id,
    preview_token,
    p_viewer_role,
    now() + (p_hours_valid || ' hours')::INTERVAL,
    auth.uid()
  );
  
  RETURN preview_token;
END;
$$ LANGUAGE plpgsql;

-- Create function to get job preview
CREATE OR REPLACE FUNCTION public.get_job_preview(p_token TEXT)
RETURNS TABLE (
  job_post_id UUID,
  viewer_role TEXT,
  expires_at TIMESTAMPTZ,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jp.job_post_id,
    jp.viewer_role,
    jp.expires_at,
    (jp.expires_at > now()) as is_valid
  FROM public.job_previews jp
  WHERE jp.preview_token = p_token;
END;
$$ LANGUAGE plpgsql;

-- Create function to track job interaction
CREATE OR REPLACE FUNCTION public.track_job_interaction(
  p_job_id UUID,
  p_interaction_type TEXT,
  p_interaction_data JSONB DEFAULT '{}'::jsonb,
  p_session_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.job_interactions (
    job_post_id,
    user_id,
    interaction_type,
    interaction_data,
    session_id,
    ip_address,
    user_agent
  ) VALUES (
    p_job_id,
    auth.uid(),
    p_interaction_type,
    p_interaction_data,
    p_session_id,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to bookmark job
CREATE OR REPLACE FUNCTION public.bookmark_job(
  p_job_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.job_bookmarks (job_post_id, user_id, notes)
  VALUES (p_job_id, auth.uid(), p_notes)
  ON CONFLICT (job_post_id, user_id) 
  DO UPDATE SET 
    notes = EXCLUDED.notes,
    created_at = now();
END;
$$ LANGUAGE plpgsql;

-- Create function to remove job bookmark
CREATE OR REPLACE FUNCTION public.unbookmark_job(p_job_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.job_bookmarks 
  WHERE job_post_id = p_job_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Create function to get user bookmarks
CREATE OR REPLACE FUNCTION public.get_user_bookmarks(p_user_id UUID)
RETURNS TABLE (
  job_post_id UUID,
  job_title TEXT,
  company_name TEXT,
  bookmarked_at TIMESTAMPTZ,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jb.job_post_id,
    jp.title,
    c.name,
    jb.created_at,
    jb.notes
  FROM public.job_bookmarks jb
  JOIN public.job_posts jp ON jp.id = jb.job_post_id
  JOIN public.companies c ON c.id = jp.company_id
  WHERE jb.user_id = p_user_id
  ORDER BY jb.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_job_preview TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_preview TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_job_interaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.bookmark_job TO authenticated;
GRANT EXECUTE ON FUNCTION public.unbookmark_job TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_bookmarks TO authenticated;

-- Create trigger to clean up expired previews
CREATE OR REPLACE FUNCTION public.cleanup_expired_previews()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.job_previews 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean up expired recommendations
CREATE OR REPLACE FUNCTION public.cleanup_expired_recommendations()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.job_recommendations 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;
