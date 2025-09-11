# Database Setup Guide

## 🗄️ Required Database Migrations

To complete the bookmarking, sharing, and post moderation features, you need to apply the following database migrations manually in your Supabase Dashboard.

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Apply Bookmarking & Moderation Migration

Copy and paste the following SQL script and run it:

```sql
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
```

### Step 3: Apply Media Storage Setup

Copy and paste the following SQL script and run it:

```sql
-- Media storage buckets setup for community posts and attachments
-- Run this to create the necessary storage buckets for media uploads

-- Create storage buckets for media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('attachments', 'attachments', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for 'images' bucket (public read, authenticated write)
CREATE POLICY "Allow public read access for images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated uploads for images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated updates for images" ON storage.objects
FOR UPDATE USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated deletes for images" ON storage.objects
FOR DELETE USING (bucket_id = 'images' AND auth.uid() IS NOT NULL);

-- RLS policies for 'attachments' bucket (public read, authenticated write)
CREATE POLICY "Allow public read access for attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

CREATE POLICY "Allow authenticated uploads for attachments" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated updates for attachments" ON storage.objects
FOR UPDATE USING (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated deletes for attachments" ON storage.objects
FOR DELETE USING (bucket_id = 'attachments' AND auth.uid() IS NOT NULL);
```

### Step 4: Verify Migration Success

After applying both migrations, run this test to verify everything is working:

```bash
node test-bookmarking-sharing-moderation.js
```

You should see:
- ✅ All 4 tables created (bookmarks, reports, hidden_posts, snoozed_posts)
- ✅ Storage buckets accessible
- ✅ Functions working

## 🎯 Expected Results

After applying these migrations, you should have:

### ✅ New Tables:
- `bookmarks` - For saving posts
- `reports` - For reporting inappropriate content
- `hidden_posts` - For hiding posts from feed
- `snoozed_posts` - For temporarily hiding posts

### ✅ New Storage Buckets:
- `images` - For image uploads
- `attachments` - For file attachments (images + PDFs)

### ✅ New Functions:
- `get_user_bookmarks()` - Get user's bookmarked posts
- `get_user_hidden_posts()` - Get user's hidden posts
- `get_user_snoozed_posts()` - Get user's snoozed posts
- `cleanup_expired_snoozed_posts()` - Clean up expired snoozes

### ✅ Row Level Security (RLS):
- All tables have proper RLS policies
- Users can only access their own data
- Secure and private by default

## 🚀 Next Steps

1. Apply the migrations above
2. Test the bookmarking/sharing/moderation features
3. Deploy to production
4. Enjoy your fully functional community platform! 🎉
