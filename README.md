# Hiring Management System

A modern, full-stack recruitment platform designed for organizations to streamline their hiring process. The system provides end-to-end functionality from job posting to candidate application management, featuring an innovative gesture-based photo capture system for applicant profiles.

## Project Overview

This application serves two primary user groups:

**Administrators/Recruiters**: Create and manage job postings, review applications, track candidates through the hiring pipeline, and make data-driven hiring decisions.

**Candidates**: Browse open positions, submit applications with comprehensive profile information, and utilize innovative gesture-controlled photo capture technology.

The platform emphasizes user experience with real-time updates, drag-and-drop candidate management, and a clean, accessible interface built on modern web technologies.

## Technology Stack

### Frontend
- **Next.js 16.0.0** - React framework with App Router and Turbopack
- **React 19.2.0** - UI library with latest concurrent features
- **TypeScript 5.x** - Type-safe development
- **Tailwind CSS 4.x** - Utility-first styling
- **Zustand 5.0.8** - Lightweight state management

### Backend & Infrastructure
- **Supabase** - PostgreSQL database, authentication, and storage
- **Supabase Storage** - Secure file storage for candidate photos

### Key Libraries
- **react-webcam 7.2.0** - Webcam access and video streaming
- **react-hook-form 7.65.0** - Form state management and validation
- **@dnd-kit** - Drag-and-drop functionality for candidate pipelines
- **@tanstack/react-table 8.21.3** - Advanced table management
- **date-fns 4.1.0** - Date formatting and manipulation
- **zod 4.1.12** - Schema validation

## Features

### Core Functionality
- Job posting creation and management with rich details (salary, department, location)
- Application submission with multi-field candidate profiles
- Admin dashboard for managing job listings and reviewing applications
- Candidate tracking with drag-and-drop status management
- Real-time data synchronization via Supabase

### Innovative Features
- **Gesture-Based Photo Capture**: Applicants can take profile photos using a sequential finger counting gesture (1-2-3) detected via computer vision algorithms, eliminating the need for manual button clicks
- **Custom Gesture Detection**: Proprietary pixel analysis algorithm using skin-tone detection and column-based peak counting to recognize hand gestures without external ML libraries
- **Dual Photo Upload Options**: Traditional file upload or innovative webcam capture with gesture control

## Local Development Setup

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Fadhil762/hiring_management.git
cd hiring_management
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Obtain these credentials from your Supabase project dashboard at Settings > API.

4. Set up the database:

Navigate to your Supabase project's SQL Editor and execute the schema file:
```sql
-- Copy and run contents from documentation/supabase_schema.sql
```

This creates the necessary tables: `jobs`, `applications`, and `job_configs`.

5. Configure Supabase Storage:

In your Supabase project dashboard:
- Navigate to Storage section
- Create a new bucket named `candidate-photos`
- Set the bucket to public access
- Configure CORS policies if needed for local development

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm start
```

## Optional Enhancements

The following features can be added to extend functionality:

### Authentication & Authorization
- Role-based access control (Admin, Recruiter, Candidate)
- Supabase Auth integration with email/password and OAuth providers
- Protected routes with middleware
- Row-level security policies for data isolation

### Advanced Candidate Management
- Kanban board view with drag-and-drop between hiring stages
- Candidate rating and tagging system
- Internal notes and collaboration features
- Bulk actions for multiple candidates
- Advanced search and filtering capabilities

### Communication & Workflow
- Email notification system (application confirmations, status updates)
- In-app messaging between recruiters and candidates
- Interview scheduling with calendar integration
- Automated email templates for common scenarios
- SMS notifications for critical updates

### Analytics & Reporting
- Recruitment metrics dashboard (time-to-hire, conversion rates)
- Visual analytics with charts and graphs
- Source tracking for applications
- Export functionality for reports

### Enhanced User Experience
- Dark mode support
- Multi-language internationalization (i18n)
- Progressive Web App (PWA) capabilities
- Mobile-responsive design improvements
- Accessibility enhancements (WCAG 2.1 AA compliance)

## Design & Logic Assumptions

### Database Schema Design
- **UUID Primary Keys**: Used for all entities to ensure global uniqueness and security
- **Soft References**: Applications reference jobs via `job_id` foreign key with cascade deletion
- **Flexible Fields**: Most job fields are nullable to allow draft creation and incremental completion
- **Slug-Based Routing**: Jobs use unique slugs for SEO-friendly URLs instead of exposing database IDs

### Gesture Detection Algorithm
- **Skin-Tone Detection**: Identifies hand regions using RGB color analysis (r > 95, g > 40, b > 20)
- **Column-Based Analysis**: Analyzes vertical pixel columns to detect finger peaks
- **Sequential Pattern Recognition**: Tracks progression through 1-finger, 2-finger, then 3-finger states
- **No External ML**: Intentionally avoids TensorFlow/MediaPipe to reduce bundle size and maintain performance
- **500ms Sampling Interval**: Balances detection responsiveness with computational efficiency

### State Management Strategy
- **Zustand Stores**: Lightweight global state for jobs and applications data
- **React Hook Form**: Local form state with validation for performance
- **Supabase Realtime**: Automatic UI updates when database changes occur
- **Optimistic Updates**: Immediate UI feedback with background synchronization

### Security Considerations
- **Row Level Security (RLS)**: Database-level access control enabled on all tables
- **Public Read Access**: Jobs are publicly readable to allow candidate browsing
- **Environment Variables**: Sensitive credentials stored outside version control
- **Anon Key Usage**: Currently uses Supabase anonymous key (suitable for public operations)

## Known Limitations

### Current Constraints

1. **Authentication Not Implemented**: 
   - Admin routes (`/admin/*`) are currently unprotected
   - No user login or session management
   - All users have full access to administrative functions
   - Mitigation: Implement Supabase Auth before production deployment

2. **Gesture Detection Environment Sensitivity**:
   - Performance varies with lighting conditions (requires moderate to bright lighting)
   - Background complexity may affect detection accuracy
   - Skin-tone thresholds optimized for common ranges but may need adjustment
   - Works best with clear contrast between hand and background

3. **Limited File Format Support**:
   - Photo uploads accept common image formats only (JPEG, PNG, WebP)
   - No document upload for resumes or portfolios
   - Base64 encoding may impact performance with very large images

4. **Browser Compatibility**:
   - Webcam feature requires modern browsers with MediaDevices API support
   - Not tested extensively on Safari or mobile browsers
   - Requires HTTPS in production for camera access

5. **Scalability Considerations**:
   - No pagination implemented for job listings or applications
   - Large datasets may impact performance
   - No caching strategy for frequently accessed data

6. **Missing Core Features**:
   - No email notification system
   - No candidate status workflow automation
   - No interview scheduling functionality
   - Limited search and filtering capabilities

### Technical Debt

- **Error Handling**: Basic error handling without comprehensive user feedback
- **Loading States**: Minimal loading indicators during async operations
- **Type Coverage**: Some components use implicit typing
- **Test Coverage**: No automated tests implemented
- **Accessibility**: Limited ARIA labels and keyboard navigation support

## Project Structure

```
hiring_management/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard routes
│   │   ├── apply/             # Job application pages
│   │   ├── jobs/              # Job listing and details
│   │   └── layout.tsx         # Root layout with navigation
│   ├── components/            # Reusable React components
│   │   ├── Navigation.tsx     # Main navigation bar
│   │   ├── WebcamCapture.tsx  # Gesture-based photo capture
│   │   └── JobCard.tsx        # Job listing card component
│   ├── store/                 # Zustand state management
│   │   ├── jobsStore.ts       # Jobs data and actions
│   │   └── candidatesStore.ts # Applications data
│   ├── lib/                   # Utilities and configurations
│   │   ├── supabase.ts        # Supabase client setup
│   │   └── types.ts           # TypeScript type definitions
│   └── app/globals.css        # Global styles
├── documentation/             # Project documentation
│   └── supabase_schema.sql    # Database schema definition
├── public/                    # Static assets
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```


## License

Proprietary - All rights reserved by Fadhil Ahmad.

## Support

For technical issues or questions, please contact the development team or create an issue in the project repository.

---

**Version**: 0.1.0  
**Last Updated**: October 2025  
**Maintained By**: Fadhil Ahmad
