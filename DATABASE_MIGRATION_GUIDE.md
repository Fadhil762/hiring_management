# 🔧 Database Schema Updates - REQUIRED

## ⚠️ IMPORTANT: Run This in Supabase SQL Editor

Your database schema was outdated and missing critical columns. The schema has been updated to fix the errors you encountered.

---

## 🚨 Errors Fixed

### 1. **"column jobs.slug does not exist"** ✅
- **Cause**: Jobs table didn't have a `slug` column for URLs
- **Fix**: Added `slug TEXT UNIQUE NOT NULL` column

### 2. **"Could not find the 'currency' column"** ✅
- **Cause**: Jobs table didn't have `currency` and `salary_display` columns
- **Fix**: Added `currency TEXT DEFAULT 'USD'` and `salary_display TEXT` columns

### 3. **Missing job_configs table** ✅
- **Cause**: Application form configuration had nowhere to store
- **Fix**: Added `job_configs` table with JSONB config

---

## 📋 What Changed in Schema

### Jobs Table - New Structure:
```sql
- id (UUID) ← existing
- slug (TEXT, UNIQUE, NOT NULL) ← NEW
- title (TEXT) ← existing
- description (TEXT) ← changed to nullable
- department (TEXT) ← changed to nullable
- salary_min (INTEGER) ← changed to nullable
- salary_max (INTEGER) ← changed to nullable
- currency (TEXT, DEFAULT 'USD') ← NEW
- salary_display (TEXT) ← NEW
- status (TEXT) ← existing
- company (TEXT) ← changed to nullable
- location (TEXT) ← changed to nullable
- created_at (TIMESTAMP) ← existing
- updated_at (TIMESTAMP) ← existing
```

### New Table - job_configs:
```sql
- id (UUID, primary key)
- job_id (UUID, foreign key to jobs)
- config (JSONB) - stores application form configuration
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🔄 How to Update Your Database

### **Option 1: Fresh Setup (RECOMMENDED if you have no data)**

1. Go to Supabase Dashboard → SQL Editor
2. **Drop existing tables** (if you have no important data):
   ```sql
   DROP TABLE IF EXISTS applications CASCADE;
   DROP TABLE IF EXISTS jobs CASCADE;
   ```
3. Copy the **entire** `supabase_schema.sql` file
4. Paste and run in SQL Editor
5. Done! ✅

### **Option 2: Migrate Existing Data (if you have data to keep)**

1. Go to Supabase Dashboard → SQL Editor
2. Run this migration script:

```sql
-- Add new columns to jobs table
ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS salary_display TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Make existing columns nullable
ALTER TABLE jobs 
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN department DROP NOT NULL,
  ALTER COLUMN salary_min DROP NOT NULL,
  ALTER COLUMN salary_max DROP NOT NULL,
  ALTER COLUMN company DROP NOT NULL,
  ALTER COLUMN location DROP NOT NULL;

-- Generate slugs for existing jobs (if any)
UPDATE jobs 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Add unique constraint on slug
ALTER TABLE jobs ADD CONSTRAINT jobs_slug_unique UNIQUE (slug);

-- Make slug NOT NULL after populating
ALTER TABLE jobs ALTER COLUMN slug SET NOT NULL;

-- Create job_configs table
CREATE TABLE IF NOT EXISTS job_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(job_id)
);

-- Enable RLS on job_configs
ALTER TABLE job_configs ENABLE ROW LEVEL SECURITY;

-- Add policies for job_configs
CREATE POLICY "Enable read access for all job_configs" 
  ON job_configs FOR SELECT USING (true);

CREATE POLICY "Enable insert for all job_configs" 
  ON job_configs FOR INSERT WITH CHECK (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_job_configs_job_id ON job_configs(job_id);

-- Add trigger for job_configs
CREATE TRIGGER update_job_configs_updated_at 
  BEFORE UPDATE ON job_configs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Generate salary_display for existing jobs
UPDATE jobs 
SET salary_display = CONCAT(
  COALESCE(currency, 'USD'), 
  ' ', 
  salary_min, 
  ' - ', 
  salary_max
)
WHERE salary_min IS NOT NULL AND salary_max IS NOT NULL;
```

---

## ✅ Verification

After running the migration, verify with these queries:

```sql
-- Check jobs table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'jobs'
ORDER BY ordinal_position;

-- Check job_configs table exists
SELECT * FROM job_configs LIMIT 1;

-- Check sample data
SELECT slug, title, currency, salary_display, status FROM jobs;
```

---

## 🎯 What This Enables

1. **Job URLs**: Jobs now have unique slugs like `/jobs/senior-frontend-developer`
2. **Currency Support**: Salary can be in USD, EUR, GBP, IDR, etc.
3. **Formatted Salary**: `salary_display` stores formatted string like "USD $100,000 - $150,000"
4. **Form Configuration**: Each job can have custom application form requirements
5. **Flexible Fields**: Most fields are now optional for easier job creation

---

## 🚀 Next Steps

1. **Run the migration** (Option 1 or 2 above)
2. **Restart your dev server**: `npm run dev`
3. **Test creating a job** in the admin panel
4. **Test applying to a job** from the frontend

---

## 📝 Sample Job Data

The schema includes 4 sample jobs with different departments:
- `senior-full-stack-developer` (Engineering, Active)
- `product-designer` (Design, Active)
- `marketing-manager` (Marketing, Active)
- `data-scientist` (Data Science, Draft)

All have proper slugs, currency, and salary displays.

---

## 🐛 Troubleshooting

### "Column slug already exists"
- Your database was partially migrated. Use Option 2 migration script.

### "Unique constraint violation"
- You have duplicate slugs. Run:
  ```sql
  UPDATE jobs SET slug = slug || '-' || id::text WHERE slug IN (
    SELECT slug FROM jobs GROUP BY slug HAVING COUNT(*) > 1
  );
  ```

### "Still getting errors"
- Drop all tables and run fresh schema (Option 1)
- Make sure to update your `.env.local` with correct Supabase credentials

---

**Status**: Schema updated and ready for deployment! 🎉
