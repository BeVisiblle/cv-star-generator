-- Complete Community Features Migration
-- Erweitert die bestehenden Tabellen um alle fehlenden Features

-- 1. Erweitere profiles Tabelle um fehlende Felder
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('person','company')) DEFAULT 'person',
ADD COLUMN IF NOT EXISTS headline text,
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;

-- 2. Erstelle connections Tabelle
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending','accepted','rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(requester, addressee)
);

-- 3. Erstelle follows Tabelle
CREATE TABLE IF NOT EXISTS public.follows (
  follower uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  target uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (follower, target)
);

-- 4. Erweitere posts Tabelle
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('text','poll','event','job_share')) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS body text,
ADD COLUMN IF NOT EXISTS meta jsonb,
ADD COLUMN IF NOT EXISTS visibility text CHECK (visibility IN ('public','connections','followers')) DEFAULT 'public';

-- 5. Erstelle reactions Tabelle (erweitert)
CREATE TABLE IF NOT EXISTS public.reactions (
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text CHECK (kind IN ('like','love','laugh','wow','sad','angry')) DEFAULT 'like',
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (post_id, profile_id, kind)
);

-- 6. Erweitere comments Tabelle
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- 7. Erstelle comment_reactions Tabelle
CREATE TABLE IF NOT EXISTS public.comment_reactions (
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text CHECK (kind IN ('like','love','laugh','wow','sad','angry')) DEFAULT 'like',
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (comment_id, profile_id, kind)
);

-- 8. Erstelle polls Tabelle
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  question text NOT NULL,
  multiple boolean DEFAULT false,
  ends_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- 9. Erstelle poll_options Tabelle
CREATE TABLE IF NOT EXISTS public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
  label text NOT NULL,
  idx int NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- 10. Erstelle poll_votes Tabelle
CREATE TABLE IF NOT EXISTS public.poll_votes (
  poll_id uuid REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id uuid REFERENCES public.poll_options(id) ON DELETE CASCADE,
  voter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (poll_id, option_id, voter_id)
);

-- 11. Erstelle events Tabelle
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  cover_url text,
  capacity int,
  created_at timestamptz DEFAULT NOW()
);

-- 12. Erstelle event_rsvps Tabelle
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text CHECK (status IN ('going','interested','declined')) DEFAULT 'going',
  updated_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (event_id, profile_id)
);

-- 13. Erstelle attachments Tabelle für Medien
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  size_bytes int,
  width int,
  height int,
  created_at timestamptz DEFAULT NOW()
);

-- 14. Erstelle attachment_links Tabelle
CREATE TABLE IF NOT EXISTS public.attachment_links (
  attachment_id uuid REFERENCES public.attachments(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (attachment_id),
  CHECK ((post_id IS NOT NULL) <> (comment_id IS NOT NULL))
);

-- 15. Erstelle saved_posts Tabelle
CREATE TABLE IF NOT EXISTS public.saved_posts (
  profile_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (profile_id, post_id)
);

-- 16. Erstelle post_reports Tabelle
CREATE TABLE IF NOT EXISTS public.post_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reason text,
  status text CHECK (status IN ('open','reviewing','resolved','rejected')) DEFAULT 'open',
  created_at timestamptz DEFAULT NOW()
);

-- 17. Erstelle post_mutes Tabelle
CREATE TABLE IF NOT EXISTS public.post_mutes (
  profile_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  until timestamptz,
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (profile_id, post_id)
);

-- 18. Erstelle hashtags Tabelle
CREATE TABLE IF NOT EXISTS public.hashtags (
  tag text PRIMARY KEY,
  created_at timestamptz DEFAULT NOW()
);

-- 19. Erstelle post_hashtags Tabelle
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  tag text REFERENCES public.hashtags(tag) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (post_id, tag)
);

-- 20. Erstelle groups Tabelle
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_url text,
  members_count int DEFAULT 0,
  created_at timestamptz DEFAULT NOW()
);

-- 21. Erstelle group_members Tabelle
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('member','admin')) DEFAULT 'member',
  created_at timestamptz DEFAULT NOW(),
  PRIMARY KEY (group_id, profile_id)
);

-- RLS Policies
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Connections Policies
CREATE POLICY "Users can view their own connections" ON public.connections
  FOR SELECT USING (auth.uid() = requester OR auth.uid() = addressee);

CREATE POLICY "Users can create connection requests" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = requester);

CREATE POLICY "Users can update their own connection requests" ON public.connections
  FOR UPDATE USING (auth.uid() = requester OR auth.uid() = addressee);

-- Follows Policies
CREATE POLICY "Users can view follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON public.follows
  FOR ALL USING (auth.uid() = follower);

-- Reactions Policies
CREATE POLICY "Users can view reactions" ON public.reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reactions" ON public.reactions
  FOR ALL USING (auth.uid() = profile_id);

-- Comment Reactions Policies
CREATE POLICY "Users can view comment reactions" ON public.comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comment reactions" ON public.comment_reactions
  FOR ALL USING (auth.uid() = profile_id);

-- Polls Policies
CREATE POLICY "Users can view polls" ON public.polls
  FOR SELECT USING (true);

CREATE POLICY "Users can create polls" ON public.polls
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT author_id FROM public.posts WHERE id = post_id
  ));

-- Poll Options Policies
CREATE POLICY "Users can view poll options" ON public.poll_options
  FOR SELECT USING (true);

CREATE POLICY "Users can create poll options" ON public.poll_options
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT p.author_id FROM public.posts p 
    JOIN public.polls pl ON p.id = pl.post_id 
    WHERE pl.id = poll_id
  ));

-- Poll Votes Policies
CREATE POLICY "Users can view poll votes" ON public.poll_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own poll votes" ON public.poll_votes
  FOR ALL USING (auth.uid() = voter_id);

-- Events Policies
CREATE POLICY "Users can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT author_id FROM public.posts WHERE id = post_id
  ));

-- Event RSVPs Policies
CREATE POLICY "Users can view event rsvps" ON public.event_rsvps
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own event rsvps" ON public.event_rsvps
  FOR ALL USING (auth.uid() = profile_id);

-- Attachments Policies
CREATE POLICY "Users can view attachments" ON public.attachments
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own attachments" ON public.attachments
  FOR ALL USING (auth.uid() = owner_id);

-- Attachment Links Policies
CREATE POLICY "Users can view attachment links" ON public.attachment_links
  FOR SELECT USING (true);

CREATE POLICY "Users can create attachment links" ON public.attachment_links
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT owner_id FROM public.attachments WHERE id = attachment_id
  ));

-- Saved Posts Policies
CREATE POLICY "Users can view their own saved posts" ON public.saved_posts
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage their own saved posts" ON public.saved_posts
  FOR ALL USING (auth.uid() = profile_id);

-- Post Reports Policies
CREATE POLICY "Users can create post reports" ON public.post_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own post reports" ON public.post_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Post Mutes Policies
CREATE POLICY "Users can manage their own post mutes" ON public.post_mutes
  FOR ALL USING (auth.uid() = profile_id);

-- Hashtags Policies
CREATE POLICY "Users can view hashtags" ON public.hashtags
  FOR SELECT USING (true);

CREATE POLICY "Users can create hashtags" ON public.hashtags
  FOR INSERT WITH CHECK (true);

-- Post Hashtags Policies
CREATE POLICY "Users can view post hashtags" ON public.post_hashtags
  FOR SELECT USING (true);

CREATE POLICY "Users can create post hashtags" ON public.post_hashtags
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT author_id FROM public.posts WHERE id = post_id
  ));

-- Groups Policies
CREATE POLICY "Users can view groups" ON public.groups
  FOR SELECT USING (true);

CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Group Members Policies
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own group memberships" ON public.group_members
  FOR ALL USING (auth.uid() = profile_id);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester);
CREATE INDEX IF NOT EXISTS idx_connections_addressee ON public.connections(addressee);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower);
CREATE INDEX IF NOT EXISTS idx_follows_target ON public.follows(target);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_profile_id ON public.reactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_polls_post_id ON public.polls(post_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_voter_id ON public.poll_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_events_post_id ON public.events(post_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_profile_id ON public.event_rsvps(profile_id);
CREATE INDEX IF NOT EXISTS idx_attachments_owner_id ON public.attachments(owner_id);
CREATE INDEX IF NOT EXISTS idx_attachment_links_post_id ON public.attachment_links(post_id);
CREATE INDEX IF NOT EXISTS idx_attachment_links_comment_id ON public.attachment_links(comment_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_profile_id ON public.saved_posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_mutes_profile_id ON public.post_mutes(profile_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON public.post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_tag ON public.post_hashtags(tag);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_profile_id ON public.group_members(profile_id);

-- Views für Feed-Aggregate
CREATE OR REPLACE VIEW public.post_stats AS
SELECT 
  p.id,
  p.author_id,
  p.type,
  p.body,
  p.meta,
  p.visibility,
  p.created_at,
  COUNT(DISTINCT r.profile_id) as likes_count,
  COUNT(DISTINCT c.id) as comments_count,
  COUNT(DISTINCT s.profile_id) as saves_count
FROM public.posts p
LEFT JOIN public.reactions r ON p.id = r.post_id
LEFT JOIN public.comments c ON p.id = c.post_id
LEFT JOIN public.saved_posts s ON p.id = s.post_id
GROUP BY p.id, p.author_id, p.type, p.body, p.meta, p.visibility, p.created_at;

-- RPC Functions
CREATE OR REPLACE FUNCTION public.get_feed_enhanced(
  viewer_id uuid,
  show_jobs boolean DEFAULT true,
  show_polls boolean DEFAULT true,
  show_events boolean DEFAULT true,
  show_text_posts boolean DEFAULT true,
  show_job_shares boolean DEFAULT true,
  show_company_posts boolean DEFAULT true,
  show_user_posts boolean DEFAULT true,
  sort_by text DEFAULT 'newest',
  filter_by text DEFAULT 'all',
  limit_count integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  author_type text,
  author_name text,
  author_headline text,
  author_avatar_url text,
  author_verified boolean,
  type text,
  body text,
  meta jsonb,
  visibility text,
  created_at timestamptz,
  likes_count bigint,
  comments_count bigint,
  saves_count bigint,
  user_liked boolean,
  user_saved boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.author_id,
    pr.type as author_type,
    pr.display_name as author_name,
    pr.headline as author_headline,
    pr.avatar_url as author_avatar_url,
    pr.verified as author_verified,
    ps.type,
    ps.body,
    ps.meta,
    ps.visibility,
    ps.created_at,
    ps.likes_count,
    ps.comments_count,
    ps.saves_count,
    EXISTS(SELECT 1 FROM public.reactions r WHERE r.post_id = ps.id AND r.profile_id = viewer_id) as user_liked,
    EXISTS(SELECT 1 FROM public.saved_posts s WHERE s.post_id = ps.id AND s.profile_id = viewer_id) as user_saved
  FROM public.post_stats ps
  JOIN public.profiles pr ON ps.author_id = pr.id
  WHERE 
    (show_jobs OR ps.type != 'job_share') AND
    (show_polls OR ps.type != 'poll') AND
    (show_events OR ps.type != 'event') AND
    (show_text_posts OR ps.type != 'text') AND
    (show_company_posts OR pr.type != 'company') AND
    (show_user_posts OR pr.type != 'person')
  ORDER BY 
    CASE 
      WHEN sort_by = 'popular' THEN ps.likes_count 
      WHEN sort_by = 'trending' THEN ps.comments_count 
      ELSE ps.created_at 
    END DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_feed_enhanced TO authenticated;
GRANT SELECT ON public.post_stats TO authenticated;

