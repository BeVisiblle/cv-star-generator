-- Add missing columns to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS cover_letter text,
ADD COLUMN IF NOT EXISTS resume_url text,
ADD COLUMN IF NOT EXISTS portfolio_url text;

-- Update applications RLS policies to handle new structure
DROP POLICY IF EXISTS "applications_company_access" ON applications;

CREATE POLICY "applications_company_access" ON applications
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );