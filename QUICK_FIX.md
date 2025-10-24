# 🚀 Quick Fix Guide - Do This Now!

## ⚠️ Your Database Needs Updating

The errors you saw are because your database is missing columns that the app expects.

---

## 🔴 The Errors You Saw:
1. ❌ "column jobs.slug does not exist"
2. ❌ "Could not find the 'currency' column"

## 🟢 The Fix:
Update your database schema in Supabase.

---

## 📋 STEP-BY-STEP (5 minutes)

### Step 1: Open Supabase
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Click **"SQL Editor"** in left sidebar

### Step 2: Choose Your Path

#### **If you have NO data** (or can delete it):
```sql
-- Copy this to SQL Editor and run:
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS job_configs CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
```

Then open `supabase_schema.sql` file in VS Code, copy ALL of it, paste in SQL Editor, and run.

#### **If you have data to keep**:
```sql
-- Copy this to SQL Editor and run:

-- Add missing columns
ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS salary_display TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Make columns nullable
ALTER TABLE jobs 
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN department DROP NOT NULL,
  ALTER COLUMN salary_min DROP NOT NULL,
  ALTER COLUMN salary_max DROP NOT NULL,
  ALTER COLUMN company DROP NOT NULL,
  ALTER COLUMN location DROP NOT NULL;

-- Generate slugs for existing jobs
UPDATE jobs 
SET slug = LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug unique
ALTER TABLE jobs ADD CONSTRAINT jobs_slug_unique UNIQUE (slug);
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

-- Enable RLS
ALTER TABLE job_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all job_configs" 
  ON job_configs FOR SELECT USING (true);

CREATE POLICY "Enable insert for all job_configs" 
  ON job_configs FOR INSERT WITH CHECK (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_job_configs_job_id ON job_configs(job_id);

-- Add trigger
CREATE TRIGGER update_job_configs_updated_at 
  BEFORE UPDATE ON job_configs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Generate salary displays
UPDATE jobs 
SET salary_display = CONCAT(
  COALESCE(currency, 'USD'), ' ', salary_min, ' - ', salary_max
)
WHERE salary_min IS NOT NULL AND salary_max IS NOT NULL;
```

### Step 3: Verify
Run this to check:
```sql
SELECT slug, title, currency, salary_display 
FROM jobs 
LIMIT 5;
```

You should see data with slugs like "senior-developer".

### Step 4: Create Storage Bucket (if not exists)
1. Go to **Storage** in left sidebar
2. Click **"New bucket"**
3. Name: `candidate-photos`
4. Make it **Public**
5. Save

### Step 5: Test Your App
```bash
npm run dev
```

1. Go to `http://localhost:3000`
2. Try creating a job in admin panel
3. Should work now! ✅

---

## ✅ That's It!

After updating the database:
- ✅ Job creation will work
- ✅ Job pages will load
- ✅ Applications will work
- ✅ No more errors

---

## 🐛 Still Having Issues?

### Error: "slug already exists"
```sql
-- Run this:
UPDATE jobs SET slug = slug || '-' || id::text;
```

### Error: "candidate-photos bucket not found"
- Go to Supabase Storage
- Create bucket named `candidate-photos`
- Make it public

### Error: "jobs table doesn't exist"
- You chose wrong path
- Use the "fresh setup" path above
- Drop all tables and run full `supabase_schema.sql`

---

## 📖 Full Details

If you want to understand everything that changed:
- Read `ERRORS_FIXED_SUMMARY.md` - Complete explanation
- Read `DATABASE_MIGRATION_GUIDE.md` - Detailed migration guide

---

**Time to fix**: ~5 minutes
**Difficulty**: Easy (copy & paste SQL)
**Result**: All errors gone! 🎉
