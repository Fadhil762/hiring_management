-- ============================================
-- Hiring Management Database Schema Update
-- ============================================
-- Run this script in Supabase SQL Editor
-- Make sure to run each section separately if needed

-- ============================================
-- 1. DROP EXISTING TABLES (Optional - only if you want to start fresh)
-- ============================================
-- WARNING: This will delete all existing data!
-- Uncomment these lines if you want to recreate tables from scratch

-- DROP TABLE IF EXISTS candidate_attributes CASCADE;
-- DROP TABLE IF EXISTS candidates CASCADE;
-- DROP TABLE IF EXISTS job_configs CASCADE;
-- DROP TABLE IF EXISTS jobs CASCADE;

-- ============================================
-- 2. CREATE TABLES
-- ============================================

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  salary_display TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Configs Table
CREATE TABLE IF NOT EXISTS job_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id)
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'shortlisted', 'rejected', 'hired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate Attributes Table
CREATE TABLE IF NOT EXISTS candidate_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT,
  value TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_candidate_attribute UNIQUE (candidate_id, key)
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Job configs index
CREATE INDEX IF NOT EXISTS idx_job_configs_job_id ON job_configs(job_id);

-- Candidates indexes
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);

-- Candidate attributes indexes
CREATE INDEX IF NOT EXISTS idx_candidate_attributes_candidate_id ON candidate_attributes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_attributes_key ON candidate_attributes(key);

-- ============================================
-- 4. CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_configs_updated_at ON job_configs;
CREATE TRIGGER update_job_configs_updated_at
    BEFORE UPDATE ON job_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_attributes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Jobs Table Policies
-- ============================================

-- Allow everyone to read active jobs
DROP POLICY IF EXISTS "Allow public read access to active jobs" ON jobs;
CREATE POLICY "Allow public read access to active jobs"
ON jobs FOR SELECT
USING (status = 'active' OR auth.role() = 'authenticated');

-- Allow everyone to read all jobs (for admin dashboard)
DROP POLICY IF EXISTS "Allow read access to all jobs" ON jobs;
CREATE POLICY "Allow read access to all jobs"
ON jobs FOR SELECT
USING (true);

-- Allow everyone to insert jobs (for demo purposes)
-- In production, you should restrict this to authenticated admin users
DROP POLICY IF EXISTS "Allow insert jobs" ON jobs;
CREATE POLICY "Allow insert jobs"
ON jobs FOR INSERT
WITH CHECK (true);

-- Allow everyone to update jobs (for demo purposes)
DROP POLICY IF EXISTS "Allow update jobs" ON jobs;
CREATE POLICY "Allow update jobs"
ON jobs FOR UPDATE
USING (true);

-- Allow everyone to delete jobs (for demo purposes)
DROP POLICY IF EXISTS "Allow delete jobs" ON jobs;
CREATE POLICY "Allow delete jobs"
ON jobs FOR DELETE
USING (true);

-- ============================================
-- Job Configs Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow read access to job configs" ON job_configs;
CREATE POLICY "Allow read access to job configs"
ON job_configs FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow insert job configs" ON job_configs;
CREATE POLICY "Allow insert job configs"
ON job_configs FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update job configs" ON job_configs;
CREATE POLICY "Allow update job configs"
ON job_configs FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Allow delete job configs" ON job_configs;
CREATE POLICY "Allow delete job configs"
ON job_configs FOR DELETE
USING (true);

-- ============================================
-- Candidates Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow read access to candidates" ON candidates;
CREATE POLICY "Allow read access to candidates"
ON candidates FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow insert candidates" ON candidates;
CREATE POLICY "Allow insert candidates"
ON candidates FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update candidates" ON candidates;
CREATE POLICY "Allow update candidates"
ON candidates FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Allow delete candidates" ON candidates;
CREATE POLICY "Allow delete candidates"
ON candidates FOR DELETE
USING (true);

-- ============================================
-- Candidate Attributes Table Policies
-- ============================================

DROP POLICY IF EXISTS "Allow read access to candidate attributes" ON candidate_attributes;
CREATE POLICY "Allow read access to candidate attributes"
ON candidate_attributes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow insert candidate attributes" ON candidate_attributes;
CREATE POLICY "Allow insert candidate attributes"
ON candidate_attributes FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update candidate attributes" ON candidate_attributes;
CREATE POLICY "Allow update candidate attributes"
ON candidate_attributes FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Allow delete candidate attributes" ON candidate_attributes;
CREATE POLICY "Allow delete candidate attributes"
ON candidate_attributes FOR DELETE
USING (true);

-- ============================================
-- 6. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a sample job
INSERT INTO jobs (slug, title, description, department, status, salary_min, salary_max, currency, salary_display)
VALUES (
  'frontend-developer',
  'Frontend Developer',
  'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building responsive and user-friendly web applications.',
  'Engineering',
  'active',
  50000,
  80000,
  'USD',
  'USD 50,000 - 80,000'
) ON CONFLICT (slug) DO NOTHING;

-- Get the job_id for the sample job
DO $$
DECLARE
  v_job_id UUID;
BEGIN
  SELECT id INTO v_job_id FROM jobs WHERE slug = 'frontend-developer';
  
  -- Insert sample job config
  INSERT INTO job_configs (job_id, config)
  VALUES (
    v_job_id,
    '{
      "application_form": {
        "sections": [
          {
            "title": "Personal Information",
            "fields": [
              {"key": "full_name", "validation": {"required": true}},
              {"key": "email", "validation": {"required": true}},
              {"key": "phone_number", "validation": {"required": true}},
              {"key": "date_of_birth", "validation": {"required": false}},
              {"key": "gender", "validation": {"required": false}},
              {"key": "domicile", "validation": {"required": false}}
            ]
          },
          {
            "title": "Professional Information",
            "fields": [
              {"key": "linkedin_link", "validation": {"required": false}},
              {"key": "portfolio_link", "validation": {"required": false}},
              {"key": "resume_link", "validation": {"required": false}}
            ]
          },
          {
            "title": "Additional Information",
            "fields": [
              {"key": "expected_salary", "validation": {"required": false}},
              {"key": "available_start_date", "validation": {"required": false}},
              {"key": "cover_letter", "validation": {"required": false}}
            ]
          }
        ]
      }
    }'::jsonb
  ) ON CONFLICT (job_id) DO NOTHING;
END $$;

-- ============================================
-- 7. VERIFY SETUP
-- ============================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('jobs', 'job_configs', 'candidates', 'candidate_attributes')
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('jobs', 'job_configs', 'candidates', 'candidate_attributes');

-- Check policies exist
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count records
SELECT 
  'jobs' as table_name, COUNT(*) as record_count FROM jobs
UNION ALL
SELECT 'job_configs', COUNT(*) FROM job_configs
UNION ALL
SELECT 'candidates', COUNT(*) FROM candidates
UNION ALL
SELECT 'candidate_attributes', COUNT(*) FROM candidate_attributes;

-- ============================================
-- NOTES:
-- ============================================
-- 1. The RLS policies above are permissive (allow all operations)
--    This is suitable for development/demo purposes.
--    In production, you should implement proper authentication
--    and restrict operations based on user roles.
--
-- 2. The candidate_attributes table uses a UNIQUE constraint
--    on (candidate_id, key) to prevent duplicate attributes.
--
-- 3. All foreign keys have ON DELETE CASCADE to automatically
--    clean up related records when a parent is deleted.
--
-- 4. Indexes are created to improve query performance on
--    commonly filtered/sorted columns.
--
-- 5. The updated_at triggers automatically update timestamps
--    whenever a record is modified.
--
-- ============================================
