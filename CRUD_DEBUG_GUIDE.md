# 🔧 CRUD Operations Debug Guide

## Issues Identified

### Issue 1: Job Creation Failing
**Error**: "Failed to create job" alert shown when trying to create a new job

### Issue 2: Candidates Not Displaying
**Problem**: Candidates exist in Supabase database but don't show in the frontend candidate list

---

## 🔍 Debugging Steps Added

### 1. Job Creation Debugging (CreateJobModal.tsx)

Added comprehensive logging:
- ✅ Log job data before insert
- ✅ Log Supabase insert error with full message
- ✅ Log successful job creation
- ✅ Log job config creation
- ✅ Log config creation errors

**Check Browser Console For:**
```
🚀 Creating job with data: {...}
✅ Job created successfully: {...}
📝 Creating job config: {...}
✅ Job config created successfully!
```

**OR Error Messages:**
```
❌ Error creating job: [error details]
❌ No job returned after insert
❌ Error creating job config: [error details]
```

### 2. Candidate Fetching Debugging (candidatesStore.ts)

Added comprehensive logging:
- ✅ Log job ID being fetched
- ✅ Log Supabase query results
- ✅ Log any errors from query
- ✅ Log each candidate being processed
- ✅ Log final rows array

**Check Browser Console For:**
```
🔍 Fetching candidates for job: [job-id]
📊 Query result: { data: [...], error: null }
📝 Processing candidate: {...}
✅ Final rows: [...]
```

### 3. Candidate Page Params Fix (candidate/page.tsx)

Fixed Next.js 16 params handling:
- ✅ Added Promise handling for params
- ✅ Added logging for job ID on mount

---

## 🩺 Common Issues & Solutions

### Job Creation Issues

#### Issue: Unique Constraint Violation
**Symptom**: Error mentions "duplicate key" or "unique constraint"
**Solution**: The slug already exists. Use a different slug.

#### Issue: Missing Required Fields
**Symptom**: Error mentions "not null constraint" or "required field"
**Solution**: Check database schema - ensure all required fields in jobs table match the insert statement.

#### Issue: Invalid Data Type
**Symptom**: Error mentions "invalid input syntax" or "type mismatch"
**Solution**: Ensure salary values are numbers, status is one of: 'active', 'inactive', 'draft'

#### Issue: RLS (Row Level Security) Policy
**Symptom**: Error mentions "policy" or "permission denied"
**Solution**: Check Supabase RLS policies on jobs and job_configs tables. For development, you may need to:
```sql
-- Temporarily disable RLS (NOT for production!)
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_configs DISABLE ROW LEVEL SECURITY;
```

---

### Candidate Display Issues

#### Issue: Empty candidate_attributes Array
**Symptom**: Candidates array shows but attributes are empty `[]`
**Cause**: Supabase relationship query not returning nested data
**Solution**: 
1. Check if `candidate_attributes` table has a proper foreign key to `candidates`
2. Verify column name is exactly `candidate_id` (not `candidateId` or `candidates_id`)
3. Check Supabase relationship is defined properly

**Fix in Supabase Dashboard:**
```sql
-- Ensure foreign key exists
ALTER TABLE candidate_attributes 
ADD CONSTRAINT candidate_attributes_candidate_id_fkey 
FOREIGN KEY (candidate_id) 
REFERENCES candidates(id) 
ON DELETE CASCADE;
```

#### Issue: No Data Returned
**Symptom**: Query returns empty array even though data exists in database
**Cause**: RLS policy blocking reads or wrong job_id
**Solution**:
1. Check job_id is correct UUID format
2. Check RLS policies allow SELECT on candidates table:
```sql
-- Allow reading all candidates (for development)
CREATE POLICY "Enable read access for all users" ON candidates
FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON candidate_attributes
FOR SELECT USING (true);
```

#### Issue: Wrong Query Syntax
**Symptom**: Supabase error about invalid select syntax
**Cause**: Incorrect relationship syntax
**Current Query:**
```typescript
.select('id, candidate_attributes (key,label,value,"order")')
```

**Alternative Query (if above fails):**
```typescript
// Option 1: Use foreign table syntax
.select('id, candidate_attributes!candidate_id (key,label,value,"order")')

// Option 2: Manual join with two queries
const { data: candidates } = await supabase
  .from('candidates')
  .select('id')
  .eq('job_id', jobId);

const candidateIds = candidates?.map(c => c.id) || [];
const { data: attributes } = await supabase
  .from('candidate_attributes')
  .select('*')
  .in('candidate_id', candidateIds);
```

---

## 🧪 Testing Checklist

### Job Creation Flow
1. [ ] Open Admin → Jobs page
2. [ ] Click "Create New Job"
3. [ ] Fill in required fields (Title, Slug)
4. [ ] Open browser console (F12)
5. [ ] Click "Create Job"
6. [ ] Check console for logs
7. [ ] Verify job appears in job list
8. [ ] Check Supabase `jobs` table
9. [ ] Check Supabase `job_configs` table

### Candidate Display Flow
1. [ ] Apply to a job from applicant view
2. [ ] Check Supabase `candidates` table - verify record created
3. [ ] Check Supabase `candidate_attributes` table - verify attributes created
4. [ ] Go to Admin → Jobs
5. [ ] Click "Manage Candidates" on the job
6. [ ] Open browser console (F12)
7. [ ] Check console logs for fetch operation
8. [ ] Verify candidates display in table

---

## 🛠️ Quick Fixes

### Fix 1: Reset Database Permissions
```sql
-- Run in Supabase SQL Editor
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_attributes DISABLE ROW LEVEL SECURITY;
```

### Fix 2: Verify Foreign Keys
```sql
-- Check existing foreign keys
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Fix 3: Test Supabase Query Directly
```sql
-- Test in Supabase SQL Editor
SELECT 
  c.id,
  json_agg(
    json_build_object(
      'key', ca.key,
      'label', ca.label,
      'value', ca.value,
      'order', ca."order"
    )
  ) as attributes
FROM candidates c
LEFT JOIN candidate_attributes ca ON ca.candidate_id = c.id
WHERE c.job_id = 'YOUR_JOB_ID_HERE'
GROUP BY c.id;
```

---

## 📊 Expected Console Output

### Successful Job Creation:
```
🚀 Creating job with data: {
  title: "Test Job",
  slug: "test-job",
  description: "Test description",
  department: "Engineering",
  status: "active",
  salaryMin: "50000",
  salaryMax: "80000",
  currency: "USD"
}
✅ Job created successfully: {
  id: "abc-123-...",
  title: "Test Job",
  slug: "test-job",
  ...
}
📝 Creating job config: {
  application_form: {
    sections: [...]
  }
}
✅ Job config created successfully!
```

### Successful Candidate Fetch:
```
🎯 Candidate page mounted with job ID: abc-123-...
🔍 Fetching candidates for job: abc-123-...
📊 Query result: {
  data: [
    {
      id: "candidate-1",
      candidate_attributes: [
        { key: "full_name", label: "full_name", value: "John Doe", order: 1 },
        { key: "email", label: "email", value: "john@example.com", order: 2 },
        ...
      ]
    }
  ],
  error: null
}
📝 Processing candidate: { id: "candidate-1", candidate_attributes: [...] }
✅ Final rows: [
  { id: "candidate-1", attributes: [...] }
]
```

---

## 🚨 Next Steps Based on Console Output

### If you see: "❌ Error creating job: duplicate key..."
→ Change the slug to a unique value

### If you see: "❌ Error creating job: null value in column..."
→ Check which required field is missing in the database schema

### If you see: "❌ Error creating job: permission denied..."
→ Disable RLS on jobs and job_configs tables (see Quick Fixes)

### If candidates query returns empty array but DB has data:
→ Check RLS policies on candidates and candidate_attributes tables

### If candidate_attributes is empty/null in query:
→ Verify foreign key relationship and try alternative query syntax

---

## 📞 Support Commands

### Check Database Schema:
```sql
-- Get jobs table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'jobs';

-- Get candidates table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'candidates';

-- Get candidate_attributes table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'candidate_attributes';
```

### Check RLS Policies:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('jobs', 'job_configs', 'candidates', 'candidate_attributes');
```

---

**Last Updated**: Debug Session - CRUD Operations
**Status**: Debugging enabled with comprehensive logging
**Action Required**: Check browser console and report specific error messages
