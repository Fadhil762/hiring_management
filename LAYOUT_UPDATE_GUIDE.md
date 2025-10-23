# 🎨 Layout & Database Update Guide

## Summary of Changes

This update brings the application layout and database schema in line with the design requirements shown in the screenshots.

---

## 📋 Changes Made

### 1. Application Form Layout (apply/[slug]/page.tsx)

**Before**: Single column/two-column grid with all fields mixed together

**After**: Organized into 3 clear sections:
- 📋 **Personal Information**: full_name, email, phone_number, date_of_birth, gender, domicile
- 💼 **Professional Information**: linkedin_link, portfolio_link, resume_link
- ✨ **Additional Information**: expected_salary, available_start_date, cover_letter

**Benefits**:
- ✅ Better user experience with logical grouping
- ✅ Easier to scan and fill out
- ✅ Matches design requirements exactly
- ✅ Responsive layout (stacks on mobile, 2 columns on desktop)

### 2. Create Job Modal - Updated Fields (CreateJobModal.tsx)

**New Fields Added**:
- `portfolio_link` - For applicants to share their portfolio
- `resume_link` - For resume/CV URL
- `expected_salary` - Applicant's salary expectations
- `available_start_date` - When applicant can start
- `cover_letter` - Text area for cover letter

**Field Organization**:
All 12 fields are now properly organized and can be configured as:
- ✅ Mandatory (required)
- ~ Optional (not required)
- × Off (hidden from form)

### 3. Database Schema (supabase_schema.sql)

**New Features**:
- ✅ Added `status` field to candidates table (new, reviewing, shortlisted, rejected, hired)
- ✅ Added `updated_at` timestamps with automatic triggers
- ✅ Added comprehensive indexes for performance
- ✅ Added UNIQUE constraint on candidate_attributes (candidate_id, key)
- ✅ Configured RLS (Row Level Security) policies for all tables
- ✅ Added sample data for testing

**Schema Improvements**:
- All foreign keys have `ON DELETE CASCADE`
- Proper check constraints for status fields
- UUID primary keys with `gen_random_uuid()`
- Timezone-aware timestamps

---

## 🚀 How to Apply Changes

### Step 1: Update Database

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Schema Script**
   - Copy the contents of `supabase_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify Tables Created**
   - Go to "Table Editor"
   - You should see: jobs, job_configs, candidates, candidate_attributes

### Step 2: Test the Application

1. **Restart Dev Server**
   ```bash
   npm run dev
   ```

2. **Test Job Creation**
   - Go to http://localhost:3000/admin/jobs
   - Click "Create New Job"
   - Fill in the form
   - Configure which fields should be mandatory/optional/off
   - Click "Create Job"
   - Check browser console (F12) for any errors

3. **Test Application Form**
   - Go to home page
   - Click on a job
   - Click "Apply Now"
   - Notice the new organized sections:
     * Personal Information section
     * Professional Information section (if enabled)
     * Additional Information section (if enabled)

4. **Test Candidate Management**
   - Apply to a job
   - Go to Admin → Jobs
   - Click "Manage Candidates"
   - Verify the candidate appears in the table

---

## 🎯 New Field Descriptions

| Field Name | Type | Section | Description |
|------------|------|---------|-------------|
| full_name | text | Personal | Applicant's full name |
| email | email | Personal | Contact email address |
| phone_number | tel | Personal | Phone number |
| date_of_birth | date | Personal | Date of birth |
| gender | text | Personal | Gender identity |
| domicile | text | Personal | Current city/location |
| linkedin_link | url | Professional | LinkedIn profile URL |
| portfolio_link | url | Professional | Portfolio website URL |
| resume_link | url | Professional | Resume/CV URL (Google Drive, Dropbox, etc.) |
| expected_salary | number | Additional | Expected annual salary |
| available_start_date | date | Additional | Earliest start date |
| cover_letter | textarea | Additional | Cover letter/motivation |

---

## 📊 Form Layout Example

```
┌─────────────────────────────────────┐
│  1️⃣  Profile Photo                  │
│  [Webcam capture section]           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  2️⃣  Application Information        │
│                                      │
│  📋 Personal Information             │
│  ┌─────────────┬─────────────┐      │
│  │ Full Name * │ Email *     │      │
│  ├─────────────┼─────────────┤      │
│  │ Phone *     │ DOB         │      │
│  ├─────────────┼─────────────┤      │
│  │ Gender      │ Domicile    │      │
│  └─────────────┴─────────────┘      │
│                                      │
│  💼 Professional Information         │
│  ┌─────────────┬─────────────┐      │
│  │ LinkedIn    │ Portfolio   │      │
│  ├─────────────┴─────────────┤      │
│  │ Resume Link               │      │
│  └───────────────────────────┘      │
│                                      │
│  ✨ Additional Information           │
│  ┌─────────────┬─────────────┐      │
│  │ Expected $  │ Start Date  │      │
│  ├─────────────┴─────────────┤      │
│  │ Cover Letter (textarea)   │      │
│  │                           │      │
│  └───────────────────────────┘      │
│                                      │
│  [Submit] [Reset]                    │
└─────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Issue: "Failed to create job"

**Solution**: Check browser console for detailed error:
- Open F12 → Console tab
- Look for `❌ Error creating job:` message
- Common issues:
  - Duplicate slug (change slug to unique value)
  - RLS policy blocking (run SQL script to fix)
  - Missing environment variables (check .env file)

### Issue: Candidates not showing

**Solution**: 
1. Check browser console for `🔍 Fetching candidates` logs
2. Verify RLS policies are set (run SQL script)
3. Check that `candidate_attributes` has proper foreign key:
   ```sql
   SELECT * FROM candidate_attributes LIMIT 5;
   ```

### Issue: New fields not appearing

**Solution**:
1. Make sure you saved CreateJobModal.tsx changes
2. Restart dev server: `npm run dev`
3. Create a new job (old jobs won't have new fields in config)
4. Configure new fields as Mandatory/Optional/Off

---

## ✅ Testing Checklist

### Database Setup
- [ ] Ran `supabase_schema.sql` in Supabase SQL Editor
- [ ] Verified tables exist (jobs, job_configs, candidates, candidate_attributes)
- [ ] Verified RLS policies are enabled
- [ ] Verified sample job was created

### Frontend Updates
- [ ] Application form shows 3 sections (Personal, Professional, Additional)
- [ ] Fields are properly grouped in each section
- [ ] Responsive layout works (test on mobile size)
- [ ] Form validation works correctly

### Job Creation
- [ ] Can create new job with title and slug
- [ ] Can configure 12 fields (Mandatory/Optional/Off)
- [ ] New fields appear: portfolio_link, resume_link, expected_salary, etc.
- [ ] Job appears in admin dashboard after creation

### Application Flow
- [ ] Can navigate to job detail page
- [ ] Can click "Apply Now"
- [ ] Form shows only enabled fields
- [ ] Can capture photo with webcam
- [ ] Can submit application successfully
- [ ] Success message appears after submission

### Candidate Management
- [ ] Can navigate to candidate management page
- [ ] Applied candidates appear in table
- [ ] All candidate attributes display correctly
- [ ] Can sort/filter/reorder table columns

---

## 📝 Configuration Example

When creating a job, you can now configure fields like this:

**For a Basic Job** (minimal requirements):
- ✅ Mandatory: full_name, email, phone_number
- ~ Optional: linkedin_link
- × Off: Everything else

**For a Senior Role** (detailed requirements):
- ✅ Mandatory: full_name, email, phone_number, linkedin_link, portfolio_link, resume_link
- ~ Optional: date_of_birth, gender, domicile, expected_salary, available_start_date
- × Off: cover_letter

**For an Entry Level Role**:
- ✅ Mandatory: full_name, email, phone_number, cover_letter
- ~ Optional: linkedin_link, portfolio_link, date_of_birth, expected_salary, available_start_date
- × Off: resume_link (since entry level may not have extensive experience)

---

## 🎨 Design Compliance

The new layout matches the design requirements by:
- ✅ Organizing form into logical sections with headers
- ✅ Using a 2-column grid on desktop
- ✅ Proper spacing and visual hierarchy
- ✅ Clear section dividers with icons
- ✅ Responsive design for mobile devices
- ✅ Consistent styling with the rest of the app
- ✅ Professional appearance matching mockups

---

## 🔄 Migration Notes

**If you have existing data**:
1. The SQL script uses `CREATE TABLE IF NOT EXISTS` - won't delete existing data
2. New fields will be added to job_configs for new jobs only
3. Old applications will still work (they just won't have new fields)
4. You can manually update old job configs in Supabase if needed

**For a clean start**:
1. Uncomment the DROP TABLE lines at the top of `supabase_schema.sql`
2. Run the script to recreate all tables
3. All data will be reset (use only in development!)

---

**Last Updated**: Layout & Schema Update
**Status**: ✅ Ready to Deploy
**Next Steps**: Run SQL script → Test application → Verify all features work
