# Debug Guide: Job Not Found Issue

## Problem
When clicking on a job (e.g., "Frontend Developer"), you see: "This position is incorrect or may have been removed"

## Possible Causes & Solutions

### 1. **Check if the job exists in Supabase**
1. Open your Supabase dashboard: https://hraqcwsshavbxixwdgis.supabase.co
2. Go to Table Editor → `jobs` table
3. Look for the "Frontend Developer" job
4. Check if it has a `slug` field and what the value is

### 2. **Common Slug Issues**

The most common issue is that the job doesn't have a slug, or the slug format doesn't match.

**Expected slug format**: lowercase with hyphens
- "Frontend Developer" → slug should be `frontend-developer`
- "Senior Backend Engineer" → slug should be `senior-backend-engineer`

### 3. **Fix Missing or Incorrect Slugs**

If the job exists but has no slug or wrong slug:

1. In Supabase, update the job:
```sql
UPDATE jobs 
SET slug = 'frontend-developer' 
WHERE title = 'Frontend Developer';
```

2. Or create a new job with the correct slug using the "Create New Job" button in the admin panel

### 4. **Check Browser Console**

I've added logging to help diagnose. Open browser console (F12) and check for:
- "Looking for job with slug: [slug-name]"
- "Found job: [job data]" or "Database error: [error]"

This will tell you exactly what's happening.

### 5. **Verify the Link**

Check the URL when you click a job:
- Should be: `http://localhost:3000/jobs/frontend-developer`
- If you see something else, the link is wrong

### 6. **Quick Test**

Create a test job to verify everything works:

1. Go to Admin → Jobs
2. Click "Create New Job"
3. Fill in:
   - Title: "Test Job"
   - Slug: "test-job"
   - Department: "Engineering"
   - Status: "Active"
4. Click "Create Job"
5. Go to homepage and click on "Test Job"
6. It should open properly

## What I Changed

I've added better error handling to the job detail page (`src/app/jobs/[slug]/page.tsx`):
- Shows the slug being searched for
- Displays database error messages
- Logs to console for debugging

## Next Steps

1. Check the browser console when clicking a job
2. Verify the slug in your Supabase database
3. Report back what you see in the console logs
