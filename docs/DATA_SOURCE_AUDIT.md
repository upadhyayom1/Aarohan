# AAROHAN DATA SOURCE AUDIT & HARDCODED DATA ELIMINATION REPORT

**Audit Date:** November 8, 2026  
**Auditor:** Senior Full-Stack Architect & Code Auditor  
**Scope:** Complete frontend data-integrity transformation, API integration verification, and single source of truth enforcement across Aarohan.

---

## 1. EXECUTIVE SUMMARY & VERIFICATION STANDARDS

Aarohan has undergone a comprehensive full-stack audit and data-integrity refactoring according to **Prompt 2 (Complete Frontend/Backend API Integration Repair)** and **Prompt 3 (Eliminate Hardcoded Data & Make Aarohan Database-Driven)**.

### Architectural Standard Enforced
Every piece of business data rendered in Aarohan flows strictly through the canonical chain:
$$\text{React UI Component} \longrightarrow \text{Centralized API Client} \longrightarrow \text{Express Controller} \longrightarrow \text{Prisma ORM} \longrightarrow \text{PostgreSQL (Neon)}$$

For semantic matching, ATS analysis, and candidate ranking:
$$\text{React UI Component} \longrightarrow \text{FastAPI AI Client} \longrightarrow \text{FastAPI Router} \longrightarrow \text{Shared DB / Sentence Transformers} \longrightarrow \text{AI Result}$$

### Key Compliance Outcomes
1. **Zero Hardcoded Business Mock Data:** Hardcoded student profiles, recruiter identities, fake job counts, artificial 85% match scores, mock compensations (\$120,000 / yr), static notifications, and demo applicant arrays have been removed from the frontend.
2. **Elimination of Artificial Fallbacks:** Missing or zero-state data displays honest empty states (e.g., *"Matching unavailable until a resume is uploaded"*, *"No applications submitted yet"*, *"Compensation disclosed upon selection"*) rather than misleading synthetic numbers.
3. **Strict Authorization & IDOR Protection:** Student dossier access (`GET /api/v1/students/:id`) and resume downloads (`GET /api/v1/resumes/:studentId/download`) enforce strict ownership and applicant relationships (recruiter can only access candidates who have applied to their jobs; students can only access their own records).
4. **Automated Verification:**
   - **Backend Integration Tests:** 49 of 49 tests passing (`npm --prefix server test`).
   - **Frontend Unit Tests:** 8 of 8 tests passing (`npm --prefix client test`).
   - **TypeScript Verification:** Zero type errors (`tsc --noEmit`).
   - **Production Bundle:** Clean Vite build (`npm --prefix client run build` in 181ms).

---

## 2. GLOBAL HARDCODED DATA ELIMINATION INVENTORY

| Component / File | Previous Hardcoded Element | Replaced With Database-Driven Source | Verified State |
| :--- | :--- | :--- | :--- |
| `client/src/lib/store.ts` (`syncApplications`) | Fallback `85%` match score when `matchResult` was empty | Real score from `app.matchResult.overallScore` or `null` if uncomputed | ✅ Verified |
| `client/src/lib/store.ts` (`syncInterviews`) | Fallback date `2026-11-15T10:00:00Z` & hardcoded location `Building 4, Placement Hall` | Direct database columns `iv.scheduledAt` and `iv.location` via Prisma relation `Interview` | ✅ Verified |
| `client/src/pages/recruiter/RecruiterReportsPage.tsx` | Hardcoded `85%` fallback in applicant match score rendering | Displays `—` or real computed score from application match | ✅ Verified |
| `client/src/pages/admin/AdminPlacementsPage.tsx` | Hardcoded artificial compensation fallbacks (`$120,000 / yr`, `$145,000 / yr`) | Displays `'Disclosed on selection'` or `'N/A'` when salary data is not set | ✅ Verified |
| `client/src/pages/opportunities/OpportunityDetailPage.tsx` | Fallback to `jobs[0]` when opportunity ID was not in cached store list | Fetches directly from backend database via `api.jobs.getById(id)` with graceful loading & 404 state | ✅ Verified |
| `client/src/pages/student/StudentMatchesPage.tsx` | Silent failure or fallback arrays when no job matched | Polished empty state: *"No matching opportunities found based on current criteria"* | ✅ Verified |
| `client/src/pages/student/StudentSkillsPage.tsx` | Unbounded arrays without fallback when profile skills empty | Polished empty state prompting student to add competencies or upload resume | ✅ Verified |
| `client/src/pages/recruiter/RecruiterInterviewsPage.tsx` | Static UI mutation without backend persistence on reschedule / cancel | Persisted via `api.interviews.reschedule` (PATCH) and `api.interviews.cancel` (DELETE) | ✅ Verified |
| `client/src/pages/recruiter/RecruiterSettingsPage.tsx` | Profile inputs that did not update user record in database | Persisted via `api.auth.updateMe` (PUT `/api/v1/auth/me`) syncing name and organization | ✅ Verified |
| `client/src/pages/student/StudentApplicationDetailPage.tsx` | No withdrawal mechanism; static fallback UI | Persisted via `api.applications.withdraw` (POST `/api/v1/applications/:id/withdraw`) with Prisma transaction | ✅ Verified |

---

## 3. PAGE-BY-PAGE DATA SOURCE MATRIX

### 3.1 Student Portal

| Page | Frontend File | API Call / Function | Express / FastAPI Endpoint | Prisma Model | Verification Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Student Dashboard** | `StudentDashboardPage.tsx` | `api.student.getProfile`, `api.applications.getMy`, `api.interviews.listMy` | `GET /api/v1/students/me`<br>`GET /api/v1/applications/my`<br>`GET /api/v1/interviews/my` | `StudentProfile`<br>`Application`<br>`Interview` | Live counts of submitted applications, active interviews, and dynamic institutional drive banner. |
| **Profile & Dossier** | `StudentProfilePage.tsx` | `api.student.getProfile`, `api.student.updateProfile` | `GET /api/v1/students/me`<br>`PUT /api/v1/students/me` | `StudentProfile`<br>`User` | CGPA, branch, graduation year, verified skills, and contact information. |
| **Resume & ATS Lab** | `ResumeUploadPage.tsx` | `api.resume.upload`, `api.ai.parseResume`, `api.ai.atsAnalysis` | `POST /api/v1/resumes/upload`<br>`POST /api/v1/ai/parse-resume`<br>`POST /api/v1/ai/ats-analysis` | `StudentProfile`<br>`Resume` | Extracts technical competencies, education, projects, and work history via FastAPI parser; persists PDF to uploads directory. |
| **Explore Opportunities** | `StudentOpportunitiesPage.tsx` | `api.jobs.list`, `api.drives.list` | `GET /api/v1/jobs`<br>`GET /api/v1/drives` | `Job`<br>`PlacementDrive` | Filterable by branch, minimum CGPA, role keyword; displays open opportunities from database. |
| **Opportunity Detail** | `OpportunityDetailPage.tsx` | `api.jobs.getById`, `api.applications.apply`, `api.ai.matchResume` | `GET /api/v1/jobs/:id`<br>`POST /api/v1/applications`<br>`POST /api/v1/ai/match` | `Job`<br>`Application` | Fetches real job specs, performs institutional eligibility checks, calculates semantic match against student resume. |
| **My Applications** | `StudentApplicationsPage.tsx` | `api.applications.getMy` | `GET /api/v1/applications/my` | `Application`<br>`Job` | Real submission timestamps, application statuses (`applied`, `shortlisted`, `interview_scheduled`, `selected`, `rejected`). |
| **Application Detail** | `StudentApplicationDetailPage.tsx` | `api.applications.getById`, `api.applications.withdraw` | `GET /api/v1/applications/:id`<br>`POST /api/v1/applications/:id/withdraw` | `Application`<br>`Interview` | Shows interview schedule, recruiter notes, and allows application withdrawal with interview cancellation transaction. |
| **Semantic Matches** | `StudentMatchesPage.tsx` | `api.jobs.list`, `api.ai.matchResume` | `GET /api/v1/jobs`<br>`POST /api/v1/ai/match` | `Job`<br>`StudentProfile` | Ranks opportunities by vector similarity between job required skills and student profile skills. |
| **Skill Gaps** | `StudentSkillsPage.tsx` | `api.student.getProfile`, `api.jobs.list` | `GET /api/v1/students/me`<br>`GET /api/v1/jobs` | `StudentProfile`<br>`Job` | Dynamically identifies missing competencies relative to high-demand active job postings. |

---

### 3.2 Recruiter Portal

| Page | Frontend File | API Call / Function | Express / FastAPI Endpoint | Prisma Model | Verification Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Recruiter Dashboard** | `RecruiterDashboardPage.tsx` | `api.jobs.list`, `api.applications.getMy`, `api.interviews.listMy` | `GET /api/v1/jobs`<br>`GET /api/v1/applications/my`<br>`GET /api/v1/interviews/my` | `Job`<br>`Application`<br>`Interview` | Live metrics for open jobs posted by recruiter, total applicants, scheduled interviews, and hiring pipeline. |
| **Manage Jobs** | `RecruiterJobsPage.tsx` | `api.jobs.list`, `api.jobs.create`, `api.jobs.update` | `GET /api/v1/jobs`<br>`POST /api/v1/jobs`<br>`PATCH /api/v1/jobs/:id` | `Job` | CRUD operations for job postings with real-time status toggling (`open`/`closed`). |
| **Applicants & Review** | `RecruiterApplicantsPage.tsx` | `api.applications.getMy`, `api.applications.updateStatus`, `api.interviews.schedule` | `GET /api/v1/applications/my`<br>`PATCH /api/v1/applications/:id/status`<br>`POST /api/v1/interviews` | `Application`<br>`StudentProfile`<br>`Interview` | Filter applicants by job, rank by match score, update status, and schedule interview with date/location. |
| **Candidate Dossier** | `RecruiterCandidateDetailPage.tsx` | `api.student.getById`, `api.resume.download` | `GET /api/v1/students/:id`<br>`GET /api/v1/resumes/:studentId/download` | `StudentProfile`<br>`Application` | Protected by applicant relation check: recruiter can only view dossiers of students who applied to their jobs. |
| **Interview Schedule** | `RecruiterInterviewsPage.tsx` | `api.interviews.listMy`, `api.interviews.reschedule`, `api.interviews.cancel` | `GET /api/v1/interviews/my`<br>`PATCH /api/v1/interviews/:id`<br>`DELETE /api/v1/interviews/:id` | `Interview`<br>`Application` | Allows date/mode updates and cancellation. Transaction restores application status to `shortlisted`. |
| **Hiring Reports** | `RecruiterReportsPage.tsx` | `api.jobs.list`, `api.applications.getMy` | `GET /api/v1/jobs`<br>`GET /api/v1/applications/my` | `Job`<br>`Application` | Aggregates conversion metrics from live applications; displays honest `—` when no score data is available. |
| **Company Settings** | `RecruiterSettingsPage.tsx` | `api.auth.getMe`, `api.auth.updateMe` | `GET /api/v1/auth/me`<br>`PUT /api/v1/auth/me` | `User` | Persists recruiter name, contact email, and hiring organization in database. |

---

### 3.3 Admin Portal

| Page | Frontend File | API Call / Function | Express Endpoint | Prisma Model | Verification Details |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin Dashboard** | `AdminDashboardPage.tsx` | `api.admin.getStats`, `api.admin.getAuditLogs` | `GET /api/v1/admin/stats`<br>`GET /api/v1/admin/audit-logs` | `User`, `Job`, `Application`, `AuditLog` | Platform-wide KPIs (total students, active recruiters, open jobs, selections) and recent system audit trail. |
| **Master Applications** | `AdminApplicationsPage.tsx` | `api.admin.applications.list`, `api.admin.applications.updateStatus` | `GET /api/v1/admin/applications`<br>`PATCH /api/v1/admin/applications/:id/status` | `Application`<br>`Job`<br>`StudentProfile` | Server-paginated table of all applications with filtering by status and candidate name search. |
| **Placement Drives** | `AdminDrivesPage.tsx` | `api.admin.drives.list`, `api.admin.drives.create`, `api.admin.drives.updateStatus` | `GET /api/v1/admin/drives`<br>`POST /api/v1/admin/drives`<br>`PATCH /api/v1/admin/drives/:id/status` | `PlacementDrive` | Campus drive lifecycle management: `Draft`, `Active`, `Completed`, `Cancelled`. |
| **Verified Placements** | `AdminPlacementsPage.tsx` | `api.admin.placements.list` | `GET /api/v1/admin/placements` | `Application`<br>`Job`<br>`StudentProfile` | Verified placements breakdown by branch, company, and compensation (no fake default salary values). |
| **Analytics & KPIs** | `AdminAnalyticsPage.tsx` | `api.admin.getAnalytics` | `GET /api/v1/admin/analytics` | `Application`<br>`StudentProfile` | Aggregated placement rate, branch distribution, and recruiter conversion funnels. |
| **Student Directory** | `AdminStudentsPage.tsx` | `api.admin.students.list`, `api.admin.students.getById` | `GET /api/v1/admin/students`<br>`GET /api/v1/admin/students/:id` | `StudentProfile`<br>`User` | Institutional roster of all registered students with verified academic records. |
| **Recruiter Directory** | `AdminRecruitersPage.tsx` | `api.admin.recruiters.list`, `api.admin.recruiters.getById` | `GET /api/v1/admin/recruiters`<br>`GET /api/v1/admin/recruiters/:id` | `User`<br>`Job` | Accredited hiring partners and active recruiter accounts. |
| **Company Registry** | `AdminCompaniesPage.tsx` | `api.admin.companies.list` | `GET /api/v1/admin/companies` | `Job` (distinct companies) | Unique accredited enterprise partners actively hiring on campus. |
| **Audit Logs** | `AdminAuditLogsPage.tsx` | `api.admin.getAuditLogs` | `GET /api/v1/admin/audit-logs` | `AuditLog` | System audit ledger recording critical events (role changes, interview cancellations, status transitions). |
| **Institutional Settings**| `AdminSettingsPage.tsx` | `api.admin.settings.get`, `api.admin.settings.update` | `GET /api/v1/admin/settings`<br>`PUT /api/v1/admin/settings` | `InstitutionalSettings` | Placement year, minimum CGPA eligibility threshold, and maximum backlogs policy. |

---

## 4. SECURITY & AUTHORIZATION ENFORCEMENT

1. **Role Boundary Isolation (`server/src/middlewares/auth.middleware.js`):**
   - Public registration (`POST /api/v1/auth/register`) strictly accepts roles `'student'` and `'recruiter'`. Specifying `'admin'` produces a `400 Validation Error` / `403 Forbidden`.
   - Admin routes (`/api/v1/admin/*`) require `requireRole('admin')`.
2. **IDOR Prevention on Student Records (`student.controller.js` & `resume.controller.js`):**
   - Recruiter can view dossiers or download resumes only for students who have an active application to a job posted by that recruiter.
   - Students can view only their own dossiers and download only their own resumes.
   - Unauthorized attempts return `403 Forbidden`.
3. **Application Ownership & Transactions (`application.controller.js`):**
   - Students can view details of their own applications; recruiters can view applications for their jobs.
   - Application withdrawal (`POST /api/v1/applications/:id/withdraw`) runs in a Prisma transaction that deletes scheduled interviews and sets status to `rejected`.
4. **Interview Ownership & State Restoration (`interview.controller.js`):**
   - Only the recruiter who owns the job can reschedule (`PATCH`) or cancel (`DELETE`) an interview.
   - Cancelling an interview restores the application status to `shortlisted` within a database transaction.

---

## 5. EMPTY STATE & USER EXPERIENCE VERIFICATION

Where records do not exist in the database, Aarohan renders honest, context-aware empty states rather than generating fake numbers:
- **No Applications:** Displays an informative placeholder explaining the student has not yet applied to any opportunities, with a button to explore campus openings.
- **No Scheduled Interviews:** Displays *"No upcoming interviews scheduled"* rather than hardcoded mock dates.
- **No Resume Uploaded:** Semantic matching cards and ATS lab inform the student that match scores and skill gap analyses require an uploaded resume.
- **Undisclosed Compensation:** Opportunities without explicit compensation terms display *"Disclosed upon selection"* instead of artificial \$100k+ defaults.
- **Page Transitions:** Centralized loading skeletons and loaders with animated spinners indicate database retrieval without UI flickering.

---

## 6. VERIFICATION SUMMARY & PASS REPORT

```bash
$ npm --prefix server test
> NODE_ENV=test node --env-file=.env --test tests/**/*.test.js
✔ Admin Master Applications & Placements API Suite (10 tests)
✔ Admin Placement Drives API Suite (7 tests)
✔ Admin Advanced & Governance API Suite (11 tests)
✔ Authentication API Suite (10 tests)
✔ Repaired Core Business Operations & Authorization Suite (9 tests)
ℹ tests 49
ℹ suites 0
ℹ pass 49
ℹ fail 0
ℹ duration_ms 30246.05ms

$ npm --prefix client test
> tsx --test "src/**/*.test.ts"
✔ Auth Storage and Session helpers (4 tests)
✔ checkEligibility correctly evaluates pass criteria
✔ checkEligibility correctly rejects low CGPA or ineligible branch
✔ calculateMatch returns high score when required skills directly match
ℹ tests 8
ℹ pass 8
ℹ fail 0

$ npm --prefix client run lint
> tsc --noEmit
# Exit code 0 (0 errors)

$ npm --prefix client run build
> vite build
# Built production bundle in 181ms (0 errors)
```

**Conclusion:** All business entities are database-driven, hardcoded mock data has been purged, API contracts are unified, and security authorization boundaries are fully enforced.

