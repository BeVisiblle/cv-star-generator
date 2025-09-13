-- Unified Posts System Migration
-- This migration creates a clean, unified posts table with all features

-- Drop existing post-related tables to start fresh
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS post_shares CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS shares CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- Create unified posts table
CREATE TABLE posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Content
    content TEXT NOT NULL,
    image_url TEXT,
    media_urls TEXT[], -- Array of media URLs for multiple images/videos
    
    -- Author information
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    author_type TEXT NOT NULL CHECK (author_type IN ('user', 'company')),
    author_id UUID NOT NULL, -- References either user_id or company_id
    
    -- Post status and visibility
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'connections', 'private')),
    
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    
    -- Engagement counters (updated via triggers)
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    shares_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT posts_author_check CHECK (
        (author_type = 'user' AND author_id = user_id AND company_id IS NULL) OR
        (author_type = 'company' AND author_id = company_id AND user_id IS NULL)
    )
);

-- Create indexes for performance
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_author_type ON posts(author_type);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_company_id ON posts(company_id);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Create likes table
CREATE TABLE post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(post_id, user_id)
);

-- Create comments table
CREATE TABLE post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE, -- For nested comments
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create shares table
CREATE TABLE post_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(post_id, user_id)
);

-- Create indexes for related tables
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX idx_post_comments_parent_id ON post_comments(parent_id);
CREATE INDEX idx_post_shares_post_id ON post_shares(post_id);
CREATE INDEX idx_post_shares_user_id ON post_shares(user_id);

-- Function to update post counters
CREATE OR REPLACE FUNCTION update_post_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'post_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
    ELSIF TG_TABLE_NAME = 'post_shares' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE posts SET shares_count = shares_count + 1 WHERE id = NEW.post_id;
            RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE posts SET shares_count = shares_count - 1 WHERE id = OLD.post_id;
            RETURN OLD;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic counter updates
CREATE TRIGGER trigger_update_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER trigger_update_comments_count
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

CREATE TRIGGER trigger_update_shares_count
    AFTER INSERT OR DELETE ON post_shares
    FOR EACH ROW EXECUTE FUNCTION update_post_counters();

-- Function to handle post publishing
CREATE OR REPLACE FUNCTION handle_post_publishing()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changes to 'published' and published_at is null, set it to now
    IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
        NEW.published_at = NOW();
    END IF;
    
    -- If status changes from 'published', keep the published_at timestamp
    IF OLD.status = 'published' AND NEW.status != 'published' THEN
        -- Keep the original published_at timestamp
        NEW.published_at = OLD.published_at;
    END IF;
    
    -- Update the updated_at timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post publishing
CREATE TRIGGER trigger_handle_post_publishing
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION handle_post_publishing();

-- Row Level Security (RLS) Policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_shares ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Users can view published posts" ON posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view their own posts" ON posts
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id)
    );

CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id)
    );

CREATE POLICY "Users can update their own posts" ON posts
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id)
    );

CREATE POLICY "Users can delete their own posts" ON posts
    FOR DELETE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id)
    );

-- Post likes policies
CREATE POLICY "Users can view post likes" ON post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Users can view comments on published posts" ON post_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE id = post_comments.post_id 
            AND status = 'published'
        )
    );

CREATE POLICY "Users can view comments on their own posts" ON post_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM posts 
            WHERE id = post_comments.post_id 
            AND (user_id = auth.uid() OR company_id IN (
                SELECT id FROM companies WHERE user_id = auth.uid()
            ))
        )
    );

CREATE POLICY "Users can create comments" ON post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON post_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Post shares policies
CREATE POLICY "Users can view post shares" ON post_shares
    FOR SELECT USING (true);

CREATE POLICY "Users can share posts" ON post_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unshare their own shares" ON post_shares
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post-media bucket
CREATE POLICY "Users can upload their own post media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'post-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own post media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'post-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own post media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'post-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view post media" ON storage.objects
    FOR SELECT USING (bucket_id = 'post-media');

-- Create some sample posts for testing
INSERT INTO posts (content, user_id, author_type, author_id, status, visibility, published_at) VALUES
('Willkommen in der Community! 🎉', auth.uid(), 'user', auth.uid(), 'published', 'public', NOW() - INTERVAL '2 days'),
('Schöner Tag heute! ☀️', auth.uid(), 'user', auth.uid(), 'published', 'public', NOW() - INTERVAL '1 day'),
('Interessante Neuigkeiten aus der Branche...', auth.uid(), 'user', auth.uid(), 'published', 'public', NOW() - INTERVAL '3 hours');

-- Grant necessary permissions
GRANT ALL ON posts TO authenticated;
GRANT ALL ON post_likes TO authenticated;
GRANT ALL ON post_comments TO authenticated;
GRANT ALL ON post_shares TO authenticated;

-- Create view for feed queries
CREATE VIEW posts_with_authors AS
SELECT 
    p.*,
    COALESCE(pr.full_name, c.name) as author_name,
    COALESCE(pr.avatar_url, c.logo_url) as author_avatar,
    COALESCE(pr.headline, c.description) as author_headline
FROM posts p
LEFT JOIN profiles pr ON p.user_id = pr.id
LEFT JOIN companies c ON p.company_id = c.id
WHERE p.status = 'published';

-- Grant access to the view
GRANT SELECT ON posts_with_authors TO authenticated;

COMMENT ON TABLE posts IS 'Unified posts table with all social media features';
COMMENT ON TABLE post_likes IS 'Post likes/reactions';
COMMENT ON TABLE post_comments IS 'Post comments with nested support';
COMMENT ON TABLE post_shares IS 'Post shares/reposts';
COMMENT ON VIEW posts_with_authors IS 'Posts with author information for feed display';
