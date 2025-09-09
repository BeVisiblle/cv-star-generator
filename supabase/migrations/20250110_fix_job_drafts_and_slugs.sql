-- Fix job drafts loading/publishing errors and add slug support
-- This migration fixes ambiguous company joins and adds slug support for public job URLs

-- Add slug column to job_posts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_posts' 
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE job_posts ADD COLUMN slug text;
    END IF;
END $$;

-- Create index on slug for performance
CREATE INDEX IF NOT EXISTS idx_job_posts_slug ON job_posts(slug);

-- Create function to generate job slug
CREATE OR REPLACE FUNCTION generate_job_slug(job_title text, company_id uuid)
RETURNS text AS $$
DECLARE
    base_slug text;
    final_slug text;
    counter integer := 0;
BEGIN
    -- Convert title to slug format
    base_slug := lower(trim(regexp_replace(job_title, '[^a-zA-Z0-9\s]', '', 'g')));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := substring(base_slug from 1 for 50); -- Limit length
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (
        SELECT 1 FROM job_posts 
        WHERE slug = final_slug 
        AND id != COALESCE((SELECT id FROM job_posts WHERE company_id = $2 AND title = $1 LIMIT 1), '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing job posts to have slugs
UPDATE job_posts 
SET slug = generate_job_slug(title, company_id)
WHERE slug IS NULL OR slug = '';

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_job_slug()
RETURNS trigger AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_job_slug(NEW.title, NEW.company_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_job_slug ON job_posts;
CREATE TRIGGER trigger_set_job_slug
    BEFORE INSERT OR UPDATE ON job_posts
    FOR EACH ROW
    EXECUTE FUNCTION set_job_slug();

-- Fix any ambiguous company joins by ensuring proper foreign key references
-- This ensures that the companies join in JobCompanyView works correctly
DO $$
BEGIN
    -- Ensure the foreign key constraint exists and is properly named
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'job_posts_company_id_fkey'
        AND table_name = 'job_posts'
    ) THEN
        ALTER TABLE job_posts 
        ADD CONSTRAINT job_posts_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add RLS policies for job_posts if they don't exist
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

-- Policy for companies to manage their own job posts
DROP POLICY IF EXISTS "Companies can manage their own job posts" ON job_posts;
CREATE POLICY "Companies can manage their own job posts" ON job_posts
    FOR ALL USING (
        company_id IN (
            SELECT company_id FROM company_users 
            WHERE user_id = auth.uid()
        )
    );

-- Policy for public read access to published job posts
DROP POLICY IF EXISTS "Public can read published job posts" ON job_posts;
CREATE POLICY "Public can read published job posts" ON job_posts
    FOR SELECT USING (is_public = true AND is_active = true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_posts_company_id ON job_posts(company_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON job_posts(is_active, is_public);
CREATE INDEX IF NOT EXISTS idx_job_posts_created_at ON job_posts(created_at DESC);

-- Grant necessary permissions
GRANT SELECT ON job_posts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON job_posts TO authenticated;
GRANT SELECT ON job_posts TO anon;
