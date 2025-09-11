# 🚀 Quick Migration Setup Guide

## ⚡ Fast Track: Apply Database Migrations

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Apply Bookmarking & Moderation Migration

Copy this entire SQL script and paste it into the SQL Editor, then click **Run**:

```sql
-- Bookmarking, Sharing, and Post Moderation Features
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

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

CREATE TABLE IF NOT EXISTS hidden_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS snoozed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL,
  snooze_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Indexes
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

-- RLS Policies
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE snoozed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own hidden posts" ON hidden_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own hidden posts" ON hidden_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own hidden posts" ON hidden_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own snoozed posts" ON snoozed_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own snoozed posts" ON snoozed_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own snoozed posts" ON snoozed_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own snoozed posts" ON snoozed_posts FOR DELETE USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION cleanup_expired_snoozed_posts()
RETURNS void AS $$
BEGIN
  DELETE FROM snoozed_posts WHERE snooze_until < NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_bookmarks(user_uuid UUID)
RETURNS TABLE (post_id UUID, bookmarked_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  RETURN QUERY
  SELECT b.post_id, b.created_at
  FROM bookmarks b
  WHERE b.user_id = user_uuid
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_hidden_posts(user_uuid UUID)
RETURNS TABLE (post_id UUID, hidden_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  RETURN QUERY
  SELECT h.post_id, h.created_at
  FROM hidden_posts h
  WHERE h.user_id = user_uuid
  ORDER BY h.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_snoozed_posts(user_uuid UUID)
RETURNS TABLE (post_id UUID, snooze_until TIMESTAMP WITH TIME ZONE, snoozed_at TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
  RETURN QUERY
  SELECT s.post_id, s.snooze_until, s.created_at
  FROM snoozed_posts s
  WHERE s.user_id = user_uuid
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Apply Media Storage Setup

Copy this SQL script and paste it into the SQL Editor, then click **Run**:

```sql
-- Media Storage Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('attachments', 'attachments', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage
CREATE POLICY "Allow public read access for images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Allow authenticated uploads for images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated updates for images" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated deletes for images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow public read access for attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Allow authenticated uploads for attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated updates for attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated deletes for attachments" ON storage.objects FOR DELETE USING (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);
```

### Step 4: Verify Success

After applying both migrations, run this command to verify:

```bash
node test-bookmarking-sharing-moderation.js
```

You should see:
- ✅ All 4 tables created
- ✅ Storage buckets accessible
- ✅ Functions working

## 🎯 Expected Results

After successful migration:
- **4 new tables**: bookmarks, reports, hidden_posts, snoozed_posts
- **2 storage buckets**: images, attachments
- **4 database functions**: User data management
- **Complete RLS**: Secure data access

## ⏱️ Time Required: ~5 minutes

1. **Step 1**: 1 minute (open Supabase)
2. **Step 2**: 2 minutes (copy/paste/run first script)
3. **Step 3**: 1 minute (copy/paste/run second script)
4. **Step 4**: 1 minute (verify with test)

**Total: 5 minutes to complete database setup!** 🚀
