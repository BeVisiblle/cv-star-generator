-- Community System Enhancement Migration (Fixed)
-- Creates comprehensive community functionality for companies and users

-- Enums for post system
DO $$ BEGIN
  CREATE TYPE post_visibility AS ENUM ('public', 'followers', 'connections', 'org_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN  
  CREATE TYPE post_kind AS ENUM ('text', 'media', 'job_share', 'poll');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE actor_kind AS ENUM ('user', 'company');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Enhanced community_posts table (extending existing posts)
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_kind post_kind NOT NULL DEFAULT 'text',
  
  -- Polymorphic actor (exactly one must be set)
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  visibility post_visibility NOT NULL DEFAULT 'public',
  body_md text,
  media jsonb DEFAULT '[]'::jsonb,
  
  -- For job shares
  job_id uuid REFERENCES job_posts(id) ON DELETE SET NULL,
  applies_enabled boolean DEFAULT false,
  
  -- Counters
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure exactly one actor is set
  CONSTRAINT exactly_one_actor CHECK (
    (actor_user_id IS NOT NULL AND actor_company_id IS NULL) OR
    (actor_user_id IS NULL AND actor_company_id IS NOT NULL)
  )
);

-- Comments on community posts
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  
  -- Polymorphic author
  author_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  author_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  body_md text NOT NULL,
  parent_comment_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure exactly one author is set
  CONSTRAINT exactly_one_comment_author CHECK (
    (author_user_id IS NOT NULL AND author_company_id IS NULL) OR
    (author_user_id IS NULL AND author_company_id IS NOT NULL)
  )
);

-- Likes on posts (separate approach for composite key)
CREATE TABLE IF NOT EXISTS community_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  
  -- Polymorphic liker
  liker_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  liker_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  created_at timestamptz DEFAULT now(),
  
  -- Ensure exactly one liker is set
  CONSTRAINT exactly_one_liker CHECK (
    (liker_user_id IS NOT NULL AND liker_company_id IS NULL) OR
    (liker_user_id IS NULL AND liker_company_id IS NOT NULL)
  ),
  
  -- Prevent duplicate likes
  UNIQUE(post_id, liker_user_id),
  UNIQUE(post_id, liker_company_id)
);

-- Shares/Reposts
CREATE TABLE IF NOT EXISTS community_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  
  -- Polymorphic sharer
  sharer_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sharer_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  created_at timestamptz DEFAULT now(),
  
  -- Ensure exactly one sharer is set
  CONSTRAINT exactly_one_sharer CHECK (
    (sharer_user_id IS NOT NULL AND sharer_company_id IS NULL) OR
    (sharer_user_id IS NULL AND sharer_company_id IS NOT NULL)
  )
);

-- Mentions in posts
CREATE TABLE IF NOT EXISTS community_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  
  -- Polymorphic mentioned entity
  mentioned_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mentioned_company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  
  start_pos integer,
  end_pos integer,
  
  created_at timestamptz DEFAULT now(),
  
  -- Ensure exactly one mentioned entity is set
  CONSTRAINT exactly_one_mentioned CHECK (
    (mentioned_user_id IS NOT NULL AND mentioned_company_id IS NULL) OR
    (mentioned_user_id IS NULL AND mentioned_company_id IS NOT NULL)
  ),
  
  -- Prevent duplicate mentions
  UNIQUE(post_id, mentioned_user_id),
  UNIQUE(post_id, mentioned_company_id)
);

-- Job share rate limiting
CREATE TABLE IF NOT EXISTS community_job_limits (
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  shares_used integer DEFAULT 0,
  
  PRIMARY KEY (company_id, job_id, week_start)
);

-- User preferences for community feed
CREATE TABLE IF NOT EXISTS community_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What to show
  show_job_shares boolean DEFAULT true,
  show_company_posts boolean DEFAULT true,
  show_user_posts boolean DEFAULT true,
  
  -- Feed scope
  origin_filter text DEFAULT 'all' CHECK (origin_filter IN ('followers', 'recommended', 'all')),
  radius_km integer DEFAULT 50,
  
  -- Muted/blocked entities
  muted_company_ids uuid[] DEFAULT '{}',
  muted_user_ids uuid[] DEFAULT '{}',
  blocked_ids uuid[] DEFAULT '{}',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_job_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_preferences ENABLE ROW LEVEL SECURITY;