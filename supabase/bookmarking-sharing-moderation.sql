-- Bookmarking, Sharing, and Post Moderation Features
-- This migration adds tables for bookmarking posts, reporting content, and post moderation

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create hidden_posts table
CREATE TABLE IF NOT EXISTS hidden_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create snoozed_posts table
CREATE TABLE IF NOT EXISTS snoozed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  snooze_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_post_id ON reports(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_hidden_posts_user_id ON hidden_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_posts_post_id ON hidden_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_snoozed_posts_user_id ON snoozed_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_snoozed_posts_post_id ON snoozed_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_snoozed_posts_until ON snoozed_posts(snooze_until);

-- RLS Policies for bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for hidden_posts
ALTER TABLE hidden_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hidden posts" ON hidden_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hidden posts" ON hidden_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hidden posts" ON hidden_posts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for snoozed_posts
ALTER TABLE snoozed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snoozed posts" ON snoozed_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own snoozed posts" ON snoozed_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snoozed posts" ON snoozed_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snoozed posts" ON snoozed_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Function to clean up expired snoozed posts
CREATE OR REPLACE FUNCTION cleanup_expired_snoozed_posts()
RETURNS void AS $$
BEGIN
  DELETE FROM snoozed_posts 
  WHERE snooze_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user's bookmarked posts
CREATE OR REPLACE FUNCTION get_user_bookmarks(user_uuid UUID)
RETURNS TABLE (
  post_id UUID,
  bookmarked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT b.post_id, b.created_at
  FROM bookmarks b
  WHERE b.user_id = user_uuid
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's hidden posts
CREATE OR REPLACE FUNCTION get_user_hidden_posts(user_uuid UUID)
RETURNS TABLE (
  post_id UUID,
  hidden_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT h.post_id, h.created_at
  FROM hidden_posts h
  WHERE h.user_id = user_uuid
  ORDER BY h.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's snoozed posts
CREATE OR REPLACE FUNCTION get_user_snoozed_posts(user_uuid UUID)
RETURNS TABLE (
  post_id UUID,
  snooze_until TIMESTAMP WITH TIME ZONE,
  snoozed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.post_id, s.snooze_until, s.created_at
  FROM snoozed_posts s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
