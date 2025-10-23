# Hiring Management Web App

A modern, full-stack hiring management system built for Rakamin's Frontend Engineer case study. This application enables recruiters to manage job vacancies and applicants to submit applications with an innovative gesture-based photo capture feature.

## 🎯 Features

### Admin (Recruiter) Features
- **Job Management Dashboard**
  - View all job postings with sorting and filtering
  - Search by title or department
  - Filter by status (Active/Inactive/Draft)
  - Sort by newest, oldest, or alphabetically

- **Create Job Modal**
  - Configure job details (title, department, salary range, description)
  - Set application field requirements with 3-state system:
    - **Mandatory**: Field is required
    - **Optional**: Field is optional
    - **Off**: Field is hidden from form
  - Automatic slug generation
  - Status management (Draft/Active/Inactive)

- **Candidate Management**
  - Interactive table with drag-and-drop column reordering
  - Resizable columns
  - Column sorting
  - Pagination (10 per page)
  - View all applicant details

### Applicant Features
- **Job Listing**
  - Browse active job postings
  - View job cards with title, department, and salary

- **Job Detail Page**
  - Detailed job description
  - Department and salary information
  - Apply button for active jobs

- **Dynamic Application Form**
  - Form fields adapt to job configuration
  - Smart input type detection (email, phone, date, URL, textarea)
  - Real-time validation with error highlighting
  - Success/error feedback messages

- **Gesture-Based Photo Capture** 🎨
  - Webcam integration for profile photos
  - **Hand gesture detection** using MediaPipe
  - Show 1→2→3 fingers in sequence to auto-capture
  - Manual capture option
  - Preview and retake functionality

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL)
- **Table Library**: @tanstack/react-table
- **Drag & Drop**: @dnd-kit
- **Gesture Detection**: MediaPipe Hands
- **Webcam**: react-webcam

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Modern browser with webcam support

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd hiring_management
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a \`.env.local\` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. Database Setup

Create the following tables in your Supabase project:

**jobs** table:
\`\`\`sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  status TEXT DEFAULT 'draft',
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  salary_display TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**job_configs** table:
\`\`\`sql
CREATE TABLE job_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**candidates** table:
\`\`\`sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**candidate_attributes** table:
\`\`\`sql
CREATE TABLE candidate_attributes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT,
  value TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

\`\`\`
hiring_management/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Job listing (applicant view)
│   │   ├── jobs/[slug]/       # Job detail page
│   │   ├── apply/[slug]/      # Application form
│   │   └── admin/
│   │       └── jobs/          # Admin job management
│   ├── components/            # Reusable components
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   ├── CreateJobModal.tsx
│   │   └── CandidatesTable.tsx
│   ├── store/                 # Zustand state management
│   │   ├── jobsStore.ts
│   │   └── candidatesStore.ts
│   ├── hooks/                 # Custom React hooks
│   │   └── useGestureDetection.ts
│   └── lib/                   # Utilities and types
│       ├── types.ts
│       ├── form.ts
│       └── supabaseClient.ts
├── public/                    # Static assets
└── package.json
\`\`\`

## 🎮 Usage Guide

### For Recruiters (Admin)

1. **Navigate to** \`/admin/jobs\`
2. **Create a new job**:
   - Click "+ Create Job"
   - Fill in job details
   - Configure which fields are mandatory/optional/hidden
   - Set status (Draft/Active/Inactive)
3. **Manage candidates**:
   - Click "Manage Job" on any job card
   - View, sort, and filter applicants
   - Resize/reorder columns as needed

### For Applicants

1. **Browse jobs** at \`/\`
2. **View job details** by clicking a job card
3. **Apply for a job**:
   - Click "Apply Now"
   - Take profile photo:
     - Manual: Click "Capture Photo"
     - Gesture: Enable "Gesture Auto-Capture", show 1→2→3 fingers
   - Fill in required information
   - Submit application

## 🧪 Testing

\`\`\`bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
\`\`\`

## 🎨 Gesture Detection

The application uses **MediaPipe Hands** for real-time hand gesture detection:

1. Enable "Gesture Auto-Capture" checkbox
2. Show your hand to the webcam
3. Display fingers in sequence: 1 → 2 → 3
4. Photo captures automatically after showing 3 fingers
5. Wait 3 seconds between captures to prevent duplicates

**Requirements**:
- Webcam enabled and permissions granted
- Good lighting conditions
- Hand visible to camera

## 🔒 Security Notes

- Supabase keys should be kept secure
- Row Level Security (RLS) should be enabled in production
- Environment variables should never be committed
- Use secure authentication for admin routes in production

## 📝 License

This project was created as a case study for Rakamin's Frontend Engineer position.

## 🙏 Acknowledgments

- Design provided by Rakamin
- Built with Next.js and React
- Gesture detection powered by MediaPipe
- Backend by Supabase

---

**Built with ❤️ for Rakamin**
\`\`\`
