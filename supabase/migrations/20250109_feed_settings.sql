-- Create user_feed_settings table
CREATE TABLE IF NOT EXISTS public.user_feed_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  show_jobs BOOLEAN DEFAULT true,
  show_polls BOOLEAN DEFAULT true,
  show_events BOOLEAN DEFAULT true,
  show_text_posts BOOLEAN DEFAULT true,
  show_job_shares BOOLEAN DEFAULT true,
  show_company_posts BOOLEAN DEFAULT true,
  show_user_posts BOOLEAN DEFAULT true,
  sort_by TEXT DEFAULT 'newest' CHECK (sort_by IN ('newest', 'popular', 'trending')),
  filter_by TEXT DEFAULT 'all' CHECK (filter_by IN ('all', 'following', 'connections', 'companies')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_feed_settings_updated_at
  BEFORE UPDATE ON public.user_feed_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.user_feed_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own feed settings" ON public.user_feed_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feed settings" ON public.user_feed_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feed settings" ON public.user_feed_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feed settings" ON public.user_feed_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create enhanced get_feed function with settings support
CREATE OR REPLACE FUNCTION get_feed_enhanced(
  viewer_id UUID,
  show_jobs BOOLEAN DEFAULT true,
  show_polls BOOLEAN DEFAULT true,
  show_events BOOLEAN DEFAULT true,
  show_text_posts BOOLEAN DEFAULT true,
  show_job_shares BOOLEAN DEFAULT true,
  show_company_posts BOOLEAN DEFAULT true,
  show_user_posts BOOLEAN DEFAULT true,
  sort_by TEXT DEFAULT 'newest',
  filter_by TEXT DEFAULT 'all',
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  post_type TEXT,
  status TEXT,
  visibility TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER,
  comments_count INTEGER,
  reactions JSONB,
  reaction_counts JSONB,
  author_id UUID,
  author_type TEXT
) AS $$
DECLARE
  query_text TEXT;
BEGIN
  -- Build dynamic query based on settings
  query_text := '
    SELECT 
      p.id,
      p.content,
      p.post_type,
      p.status,
      p.visibility,
      p.published_at,
      p.likes_count,
      p.comments_count,
      p.reactions,
      p.reaction_counts,
      p.author_id,
      p.author_type
    FROM posts p
    WHERE p.status = ''published''
      AND p.visibility IN (''CommunityAndCompanies'', ''Public'')
  ';

  -- Add content type filters
  IF NOT show_jobs THEN
    query_text := query_text || ' AND p.post_type != ''job''';
  END IF;
  
  IF NOT show_polls THEN
    query_text := query_text || ' AND p.post_type != ''poll''';
  END IF;
  
  IF NOT show_events THEN
    query_text := query_text || ' AND p.post_type != ''event''';
  END IF;
  
  IF NOT show_text_posts THEN
    query_text := query_text || ' AND p.post_type != ''text''';
  END IF;
  
  IF NOT show_job_shares THEN
    query_text := query_text || ' AND p.post_type != ''job_share''';
  END IF;

  -- Add author type filters
  IF NOT show_company_posts AND show_user_posts THEN
    query_text := query_text || ' AND p.author_type = ''user''';
  ELSIF NOT show_user_posts AND show_company_posts THEN
    query_text := query_text || ' AND p.author_type = ''company''';
  ELSIF NOT show_company_posts AND NOT show_user_posts THEN
    query_text := query_text || ' AND FALSE'; -- No posts if both are disabled
  END IF;

  -- Add sorting
  CASE sort_by
    WHEN 'popular' THEN
      query_text := query_text || ' ORDER BY p.likes_count DESC, p.published_at DESC';
    WHEN 'trending' THEN
      query_text := query_text || ' ORDER BY p.comments_count DESC, p.published_at DESC';
    ELSE -- 'newest'
      query_text := query_text || ' ORDER BY p.published_at DESC';
  END CASE;

  -- Add limit
  query_text := query_text || ' LIMIT ' || limit_count;

  -- Execute the query
  RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_feed_enhanced TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_feed_settings 
ON public.posts (status, visibility, post_type, author_type, published_at DESC);

-- Create index for user feed settings
CREATE INDEX IF NOT EXISTS idx_user_feed_settings_user_id 
ON public.user_feed_settings (user_id);

