-- =============================================
-- HIRING PLATFORM DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop existing tables if needed (for fresh setup)
-- DROP TABLE IF EXISTS applications CASCADE;
-- DROP TABLE IF EXISTS jobs CASCADE;

-- =============================================
-- JOBS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  salary_min INTEGER CHECK (salary_min >= 0),
  salary_max INTEGER CHECK (salary_max >= salary_min),
  currency TEXT DEFAULT 'USD',
  salary_display TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
  company TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- =============================================
-- APPLICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  gender TEXT,
  linkedin TEXT,
  domicile TEXT,
  profile_picture TEXT, -- Base64 encoded image or URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- =============================================
-- JOB_CONFIGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS job_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(job_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_configs_job_id ON job_configs(job_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON jobs;
DROP POLICY IF EXISTS "Enable insert for all users" ON jobs;
DROP POLICY IF EXISTS "Enable update for all users" ON jobs;
DROP POLICY IF EXISTS "Enable delete for all users" ON jobs;
DROP POLICY IF EXISTS "Enable read access for all applications" ON applications;
DROP POLICY IF EXISTS "Enable insert for all applications" ON applications;
DROP POLICY IF EXISTS "Enable read access for all job_configs" ON job_configs;
DROP POLICY IF EXISTS "Enable insert for all job_configs" ON job_configs;

-- Jobs policies (public access for demo - adjust for production!)
CREATE POLICY "Enable read access for all users" 
  ON jobs FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for all users" 
  ON jobs FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
  ON jobs FOR UPDATE 
  USING (true);

CREATE POLICY "Enable delete for all users" 
  ON jobs FOR DELETE 
  USING (true);

-- Applications policies (public access for demo - adjust for production!)
CREATE POLICY "Enable read access for all applications" 
  ON applications FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for all applications" 
  ON applications FOR INSERT 
  WITH CHECK (true);

-- Job configs policies (public access for demo - adjust for production!)
CREATE POLICY "Enable read access for all job_configs" 
  ON job_configs FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for all job_configs" 
  ON job_configs FOR INSERT 
  WITH CHECK (true);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger for jobs table
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for job_configs table
DROP TRIGGER IF EXISTS update_job_configs_updated_at ON job_configs;
CREATE TRIGGER update_job_configs_updated_at 
  BEFORE UPDATE ON job_configs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE DATA (Optional)
-- =============================================

-- Insert sample jobs
INSERT INTO jobs (slug, title, description, department, salary_min, salary_max, currency, salary_display, status, company, location)
VALUES 
  (
    'senior-full-stack-developer',
    'Senior Full Stack Developer',
    'We are looking for an experienced Full Stack Developer to join our engineering team. You will be responsible for building scalable web applications using modern technologies like React, Node.js, and PostgreSQL. The ideal candidate has 5+ years of experience and a passion for clean code and best practices.',
    'Engineering',
    100000,
    150000,
    'USD',
    'USD $100,000 - $150,000',
    'active',
    'Tech Innovators Inc.',
    'San Francisco, CA'
  ),
  (
    'product-designer',
    'Product Designer',
    'Join our design team to create beautiful and intuitive user experiences. You will work closely with product managers and engineers to design features that delight our users. Strong portfolio and 3+ years of experience required.',
    'Design',
    80000,
    120000,
    'USD',
    'USD $80,000 - $120,000',
    'active',
    'Creative Solutions Ltd.',
    'Remote'
  ),
  (
    'marketing-manager',
    'Marketing Manager',
    'Lead our marketing efforts to drive growth and brand awareness. You will develop and execute marketing strategies across multiple channels including digital, content, and events. 5+ years of marketing experience required.',
    'Marketing',
    90000,
    130000,
    'USD',
    'USD $90,000 - $130,000',
    'active',
    'Growth Partners Co.',
    'New York, NY'
  ),
  (
    'data-scientist',
    'Data Scientist',
    'Analyze large datasets to extract insights and build predictive models. Work with our data engineering team to create data pipelines and visualization dashboards. PhD or Master''s degree in related field preferred.',
    'Data Science',
    110000,
    160000,
    'USD',
    'USD $110,000 - $160,000',
    'draft',
    'Data Insights Corp.',
    'Boston, MA'
  )
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check tables exist
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check jobs
-- SELECT id, title, status, created_at FROM jobs;

-- Check applications count per job
-- SELECT j.title, COUNT(a.id) as application_count
-- FROM jobs j
-- LEFT JOIN applications a ON j.id = a.job_id
-- GROUP BY j.id, j.title;

-- =============================================
-- PRODUCTION SECURITY NOTES
-- =============================================
-- 
-- ⚠️ IMPORTANT: The policies above allow PUBLIC access for demo purposes.
-- For production, you should:
-- 
-- 1. Implement Supabase Authentication
-- 2. Add user roles (admin, applicant)
-- 3. Update RLS policies to check user roles:
--    - Admins can CRUD jobs
--    - Applicants can only read active jobs
--    - Applicants can only insert their own applications
-- 
-- Example production policy:
-- CREATE POLICY "Applicants can read active jobs"
--   ON jobs FOR SELECT
--   USING (status = 'active' OR auth.uid() IN (
--     SELECT id FROM user_roles WHERE role = 'admin'
--   ));
-- 
-- =============================================

-- Schema creation complete! 
-- You can now run: npm run dev
