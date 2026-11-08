# Aarohan API Contract Matrix

This matrix documents every frontend API caller across the Aarohan platform, its corresponding backend/AI route, controller, authentication requirement, request/response contracts, and audit status.

## Status Classifications
- **A. Fully integrated:** Frontend caller, request contract, backend route, controller database operation, and response contract match.
- **B. Contract mismatch:** Endpoint exists, but frontend property names or types do not match backend schema.
- **C. Nonexistent backend endpoint:** Frontend references or expects backend functionality that has no corresponding route.
- **D. Unconsumed backend endpoint:** Backend implements the endpoint, but no frontend page or component calls it.
- **E. Incomplete implementation:** Route exists, but business logic or edge case handling is incomplete.
- **F. Authorization / Security defect:** Endpoint lacks required role validation, has IDOR vulnerabilities, or privilege escalation.
- **G. Hardcoded / Artificial data:** Endpoint or frontend caller returns or relies on fabricated mock data.
- **H. Type / Serialization mismatch:** Endpoint fails or discards data due to property casing or missing nested objects.

---

## 1. Authentication & Session

| Frontend Caller | HTTP Method | Endpoint | Backend Route | Controller / Handler | Authentication | Request Contract | Response Contract | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api.auth.register` (`RegisterPage.tsx:44`) | `POST` | `/api/v1/auth/register` | `server/src/routes/auth.routes.js:9` | `auth.controller.js:5` (`register`) | Public (None) | `{ name: string, email: string, password: string, role?: "student" \| "recruiter" \| "admin" }` | `{ id: string, name: string, email: string, role: string, token: string }` | **F** | **Security Defect:** Public registration allows passing `role: "admin"`, escalating privileges to central placement administrator without authorization. |
| `api.auth.login` (`LoginPage.tsx:25`) | `POST` | `/api/v1/auth/login` | `server/src/routes/auth.routes.js:10` | `auth.controller.js:61` (`login`) | Public (None) | `{ email: string, password: string }` | `{ id: string, name: string, email: string, role: string, token: string }` | **A** | Supports login by email, domain suffix fallback, or case-insensitive name. |
| `api.auth.getMe` (`store.ts:265`, `RecruiterSettingsPage.tsx:20`) | `GET` | `/api/v1/auth/me` | `server/src/routes/auth.routes.js:11` | `auth.controller.js:121` (`getMe`) | `Bearer <JWT>` (Any role) | None | `{ id: string, name: string, email: string, role: string }` | **A** | Restores authenticated session on page refresh or mount. |
| *None* (`RecruiterSettingsPage.tsx:43`) | *None* | `/api/v1/auth/me` (Update) | *Nonexistent* | *None* | `Bearer <JWT>` | `{ name?: string, email?: string, organization?: string }` | Updated user object | **C** | Recruiter profile updates only persist to local storage; backend has no `PUT /auth/me` or `PUT /users/me`. |

---

## 2. Student Profile & Dossier

| Frontend Caller | HTTP Method | Endpoint | Backend Route | Controller / Handler | Authentication | Request Contract | Response Contract | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api.students.getMyProfile` (`store.ts:492`) | `GET` | `/api/v1/students/me` | `server/src/routes/student.routes.js:16` | `student.controller.js:20` (`getMyProfile`) | `Bearer <JWT>` (Role: `student`) | None | `{ id, user_id, name, email, branch, cgpa, graduation_year, backlogs, skills, projects, resume_uploaded, resume_url, resume_analysis, profile_complete }` | **A** | Returns 404 if student profile has not yet been initialized. |
| `api.students.updateMyProfile` (`StudentProfilePage.tsx:112`) | `PUT` | `/api/v1/students/me` | `server/src/routes/student.routes.js:17` | `student.controller.js:46` (`updateMyProfile`) | `Bearer <JWT>` (Role: `student`) | `{ name: string, branch: Branch, cgpa: number, graduation_year: number, backlogs: number, skills: string[], projects: object[] }` | Formatted student profile object | **A** | Synchronizes profile and updates `User.name` in Prisma transaction. |
| `api.students.getById` (`api.ts:307`) | `GET` | `/api/v1/students/:student_id` | `server/src/routes/student.routes.js:26` | `student.controller.js:104` (`getStudentById`) | `Bearer <JWT>` (Roles: `recruiter`, `admin`) | None | Formatted student profile object | **D, F** | **Unused & IDOR:** Not called by frontend pages; does not verify if the recruiter owns an application for this student. |

---

## 3. Resume & ATS Processing

| Frontend Caller | HTTP Method | Endpoint | Backend Route | Controller / Handler | Authentication | Request Contract | Response Contract | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api.resume.upload` (`StudentResumePage.tsx:74`) | `POST` | `/api/v1/students/resume` | `server/src/routes/resume.routes.js:13` | `resume.controller.js:7` (`uploadResume`) | `Bearer <JWT>` (Role: `student`) | `multipart/form-data` (Field: `file`, max 5 MB PDF) | `{ message: string, resume_url: string, analysis: object, profile: object }` | **A** | Extracts text, performs Gemini/heuristic parsing, and upserts `student_profiles` record. |
| `api.resume.downloadMyResume` (`StudentResumePage.tsx:119`) | `GET` | `/api/v1/students/resume/file` | `server/src/routes/resume.routes.js:16` | `resume.controller.js:157` (`getMyResumeFile`) | `Bearer <JWT>` (Role: `student`) | None | `application/pdf` binary stream | **A** | Streams stored PDF file from server `uploads/` directory. |
| `api.resume.downloadCandidateResume` (`RecruiterApplicantsPage.tsx:237`) | `GET` | `/api/v1/students/:student_id/resume` | `server/src/routes/resume.routes.js:19`, `student.routes.js:23` | `resume.controller.js:184` (`getStudentResumeFile`) | `Bearer <JWT>` (Roles: `recruiter`, `admin`) | None | `application/pdf` binary stream | **F** | **IDOR Vulnerability:** Does not verify if the calling recruiter owns an active job application from this student. Any recruiter can download any candidate's resume. |

---

## 4. Campus Vacancies & Job Management

| Frontend Caller | HTTP Method | Endpoint | Backend Route | Controller / Handler | Authentication | Request Contract | Response Contract | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api.jobs.list` (`OpportunitiesPage.tsx:26`, `RecruiterJobsPage.tsx:23, 41, 56`, `store.ts:493, 513`) | `GET` | `/api/v1/jobs` | `server/src/routes/job.routes.js:16` | `job.controller.js:22` (`listJobs`) | `Bearer <JWT>` (Any role) | Query: `?page=1&limit=20&branch=CSE&open_only=true` | `{ total: number, page: number, limit: number, jobs: Job[] }` | **A, G** | Integrated, but frontend store fabricates missing fields (`salaryRange`, `location`, `workArrangement`, `employmentType`) not in backend model. |
| `api.jobs.getById` (`api.ts:339`) | `GET` | `/api/v1/jobs/:job_id` | `server/src/routes/job.routes.js:18` | `job.controller.js:70` (`getJobById`) | `Bearer <JWT>` (Any role) | None | Formatted job object | **D** | Defined in API client, but `OpportunityDetailPage.tsx` reads from in-memory store instead of querying live backend. |
| `api.jobs.create` (`RecruiterNewJobPage.tsx:143`) | `POST` | `/api/v1/jobs` | `server/src/routes/job.routes.js:19` | `job.controller.js:102` (`createJob`) | `Bearer <JWT>` (Roles: `recruiter`, `admin`) | `{ title, company, description, required_skills, eligible_branches, min_cgpa, graduation_year, max_backlogs, deadline }` | Created job object (Status 201) | **A** | Validates schema and maps `recruiterId = req.user.id`. |
| `api.jobs.update` (`api.ts:347`) | `PUT` | `/api/v1/jobs/:job_id` | `server/src/routes/job.routes.js:20` | `job.controller.js:148` (`updateJob`) | `Bearer <JWT>` (Roles: `recruiter`, `admin`) | Same as `createJob` | Updated job object | **D** | Unused in frontend UI (no job edit screen wired up). |
| `api.jobs.updateStatus` (`RecruiterJobsPage.tsx:54`) | `PATCH` | `/api/v1/jobs/:job_id/status` | `server/src/routes/job.routes.js:21` | `job.controller.js:216` (`updateJobStatus`) | `Bearer <JWT>` (Roles: `recruiter`, `admin`) | `{ status: "open" \| "closed" }` | Updated job object | **A** | Checks job ownership before updating. |
| `api.jobs.getApplicants` (`RecruiterApplicantsPage.tsx:68`, `store.ts:539`) | `GET` | `/api/v1/jobs/:job_id/applicants` | `server/src/routes/job.routes.js:17`, `application.routes.js:37` | `application.controller.js:213` (`getJobApplicants`) | `Bearer <JWT>` (Roles: `recruiter`, `admin`) | Query: `?status=applied&eligible_only=true&sort_by=match_score&order=desc` | `{ job_id, total, applicants: Array<{ application_id, student, status, eligible, match_result, applied_at }> }` | **A** | Ownership check enforced: recruiters can only view applicants of jobs they created. |

---

## 5. Candidate Applications

| Frontend Caller | HTTP Method | Endpoint | Backend Route | Controller / Handler | Authentication | Request Contract | Response Contract | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api.applications.apply` (`OpportunityDetailPage.tsx:86`) | `POST` | `/api/v1/applications` | `server/src/routes/application.routes.js:19` | `application.controller.js:3` (`applyForJob`) | `Bearer <JWT>` (Role: `student`) | `{ job_id: string }` | `{ id, job_id, student_id, status, eligible, eligibility_reasons, match_result, applied_at }` | **A** | Evaluates eligibility against minimum CGPA, branch, backlogs, and graduation year before creating application. |
| `api.applications.getMy` (`StudentApplicationsPage.tsx:22, 40`, `store.ts:494`) | `GET` | `/api/v1/applications/my` | `server/src/routes/application.routes.js:22` | `application.controller.js:153` (`getMyApplications`) | `Bearer <JWT>` (Role: `student`) | None | `{ applications: Array<{ id, job, status, match_result, interview, applied_at, updated_at }> }` | **A** | Returns authenticated student's application history. |
| `api.applications.getById` (`StudentApplicationDetailPage.tsx:33`) | `GET` | `/api/v1/applications/:application_id` | `server/src/routes/application.routes.js:25` | `application.controller.js:306` (`getApplicationById`) | `Bearer <JWT>` (Backend: `recruiter`, `admin`) | None | Detailed application record | **F** | **Critical Authorization Defect:** Route restricted to `recruiter` and `admin`. When a student visits `/student/applications/:id`, this call is rejected with **403 Forbidden**. |
| `api.applications.updateStatus` (`RecruiterApplicantsPage.tsx:154, 173, 205`) | `PATCH` | `/api/v1/applications/:application_id/status` | `server/src/routes/application.routes.js:28` | `application.controller.js:384` (`updateApplicationStatus`) | `Bearer <JWT>` (Roles: `recruiter`, `admin`) | `{ status: "shortlisted" \| "rejected" \| "interview_scheduled" \| "selected" \| "not_selected" }` | `{ id: string, status: string, updated_at: string }` | **A** | Prevents invalid transitions (e.g. rejecting an already-selected candidate). |
| *None* (`StudentApplicationDetailPage.tsx:87`) | *None* | `/api/v1/applications/:id/withdraw` | *Nonexistent* | *None* | `Bearer <JWT>` | `{ reason?: string }` | Updated application | **C** | "Withdraw Application" only mutates in-memory store; no backend endpoint exists. |

---

## 6. Technical Interviews

| Frontend Caller | HTTP Method | Endpoint | Backend Route | Controller / Handler | Authentication | Request Contract | Response Contract | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api.interviews.schedule` (`RecruiterApplicantsPage.tsx:198`) | `POST` | `/api/v1/interviews` | `server/src/routes/interview.routes.js:13` | `interview.controller.js:23` (`scheduleInterview`) | `Bearer <JWT>` (Roles: `recruiter`, `admin`) | `{ application_id, scheduled_at, mode: "online" \| "on_campus", location, notes? }` | Formatted interview object (Status 201) | **A, E** | `startTime` is hardcoded to 10:00 AM UTC in frontend; empty `location` causes 400 error that is swallowed silently by frontend. |
| `api.interviews.getMy` (`StudentInterviewsPage.tsx:29, 47`, `store.ts:495, 514`) | `GET` | `/api/v1/interviews/my` | `server/src/routes/interview.routes.js:22` | `interview.controller.js:110` (`listMyInterviews`) | `Bearer <JWT>` (Any role) | Query: `?upcoming=true&past=false` | `{ interviews: Array<{ id, application_id, job: { id, title, company }, student: { id, name, email }, scheduled_at, mode, location, notes, created_at }> }` | **H** | **Property Mismatch:** Frontend `syncInterviews` reads `iv.application?.job?.title` and `iv.student_id`. Backend returns `iv.job` and `iv.student`. Causes job title and company to fall back to hardcoded strings. |
| *None* (`RecruiterInterviewsPage.tsx:47, 55`) | *None* | `/api/v1/interviews/:id` (Reschedule/Cancel) | *Nonexistent* | *None* | `Bearer <JWT>` | `{ scheduled_at?: string, status?: string }` | Updated interview | **C** | Rescheduling and cancellation are only updated in browser memory. |

---

## 7. Institutional Governance & Admin

| Frontend Caller | HTTP Method | Endpoint | Backend Route | Controller / Handler | Authentication | Request Contract | Response Contract | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api.admin.getStudents` (`AdminStudentsPage.tsx:28`) | `GET` | `/api/v1/admin/students` | `server/src/routes/admin.routes.js:33` | `admin.governance.controller.js:364` (`getAllStudents`) | `Bearer <JWT>` (Role: `admin`) | None | `{ total: number, students: Array<{ id, name, branch, cgpa, graduation_year, resume_uploaded, applications_count, shortlisted_count }> }` | **A** | Aggregates application outcomes per student across all drives. |
| `api.admin.getRecruiters` (`AdminRecruitersPage.tsx:22`, `AdminDashboard.tsx:47`) | `GET` | `/api/v1/admin/recruiters` | `server/src/routes/admin.routes.js:34` | `admin.governance.controller.js:397` (`getAllRecruiters`) | `Bearer <JWT>` (Role: `admin`) | None | `{ total: number, recruiters: Array<{ id, name, email, company, jobs_posted }> }` | **A** | Lists partner recruiter accounts and job counts. |
| `api.admin.getStats` (`AdminDashboard.tsx:43`) | `GET` | `/api/v1/admin/stats` | `server/src/routes/admin.routes.js:35` | `admin.governance.controller.js:426` (`getAdminStats`) | `Bearer <JWT>` (Role: `admin`) | None | `{ total_students, students_placed, total_jobs, open_jobs, total_applications, shortlisted, interviews_scheduled }` | **A** | Direct calculation from Neon PostgreSQL tables. |
| `api.admin.getDrives` (`AdminDrivesPage.tsx:16`, `AdminDashboard.tsx:51`) | `GET` | `/api/v1/admin/drives` | `server/src/routes/admin.routes.js:38` | `admin.drive.controller.js:28` (`getDrives`) | `Bearer <JWT>` (Role: `admin`) | Query: `?page=1&limit=20&status=Active&search=...` | `{ total: number, page: number, limit: number, drives: PlacementDrive[] }` | **A** | Fully integrated for admins. No non-admin endpoint exists for students. |
| `api.admin.createDrive` (`AdminNewDrivePage.tsx:44`) | `POST` | `/api/v1/admin/drives` | `server/src/routes/admin.routes.js:39` | `admin.drive.controller.js:89` (`createDrive`) | `Bearer <JWT>` (Role: `admin`) | `{ name, companies, job_openings_count, registration_deadline, event_start_date, event_end_date, rounds, eligible_branches, min_cgpa, status, description? }` | Formatted placement drive (Status 201) | **A** | Writes audit log entry upon creation. |
| `api.admin.getApplications` (`AdminApplicationsPage.tsx:17`) | `GET` | `/api/v1/admin/applications` | `server/src/routes/admin.routes.js:40` | `admin.application.controller.js:16` (`getAdminApplications`) | `Bearer <JWT>` (Role: `admin`) | Query: `?page=1&limit=50&status=selected&search=...` | `{ total: number, page: number, limit: number, applications: Array<{ id, job_id, job_title, company, student_name, student_branch, status, match_score }> }` | **A, G** | Falls back to `85` match_score if null. |
| `api.admin.getPlacements` (`AdminPlacementsPage.tsx:16`) | `GET` | `/api/v1/admin/placements` | `server/src/routes/admin.routes.js:41` | `admin.application.controller.js:109` (`getAdminPlacements`) | `Bearer <JWT>` (Role: `admin`) | Query: `?page=1&limit=50&branch=CSE&search=...` | `{ total, summary: { verified_offers, highest_package, average_package, participating_companies }, placements }` | **G** | **Fabricated Data:** Hardcodes compensation packages (`$125,000 / yr`, `$145,000 / yr`, `$118,500 / yr`). |
| `api.admin.getAnalytics` (`AdminAnalyticsPage.tsx:28`) | `GET` | `/api/v1/admin/analytics` | `server/src/routes/admin.routes.js:44` | `admin.governance.controller.js:7` (`getAnalytics`) | `Bearer <JWT>` (Role: `admin`) | None | `{ kpis, department_performance, in_demand_skills, hiring_funnel }` | **A** | Real-time computation from database records. |
| `api.admin.getAuditLogs` (`AdminAuditLogsPage.tsx:17`, `AdminDashboard.tsx:55`) | `GET` | `/api/v1/admin/audit-logs` | `server/src/routes/admin.routes.js:45` | `admin.governance.controller.js:96` (`getAuditLogs`) | `Bearer <JWT>` (Role: `admin`) | Query: `?page=1&limit=50&role=admin&search=...` | `{ total: number, page: number, limit: number, logs: AuditLog[] }` | **A** | Lists audit records from `audit_logs` table. |
| `api.admin.getSettings` (`AdminSettingsPage.tsx:20`) | `GET` | `/api/v1/admin/settings` | `server/src/routes/admin.routes.js:46` | `admin.governance.controller.js:147` (`getSettings`) | `Bearer <JWT>` (Role: `admin`) | None | `{ placement_year, default_min_cgpa, max_backlogs_allowed, updated_at }` | **A** | Reads from `institutional_settings` table. |
| `api.admin.updateSettings` (`AdminSettingsPage.tsx:43`) | `PUT` | `/api/v1/admin/settings` | `server/src/routes/admin.routes.js:47` | `admin.governance.controller.js:172` (`updateSettings`) | `Bearer <JWT>` (Role: `admin`) | `{ placement_year: string, default_min_cgpa: number, max_backlogs_allowed: number }` | Updated settings object | **A** | Upserts settings and writes audit record. |
| *None* (`admin.routes.js:50-55`) | `GET / PUT / PATCH` | `/api/v1/admin/drives/:id`, `/api/v1/admin/companies`, `/api/v1/admin/recruiters/:id`, `/api/v1/admin/students/:id` | `server/src/routes/admin.routes.js:50-55` | `admin.drive.controller.js`, `admin.governance.controller.js` | `Bearer <JWT>` (Role: `admin`) | Route params / bodies | Single entity representations | **D** | Implemented on backend, but not consumed by any frontend pages. |

---

## 8. AI Service (Port 8001 / `/api/v1/ai`)

| Frontend Caller | HTTP Method | Endpoint | AI Router File | Handler Function | Authentication | Request Contract | Response Contract | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `api.ai.analyzeResume` (`api.ts:535`) | `POST` | `/api/v1/ai/analyze-resume` | `ai/app/routers/ai.py:73` | `analyze_resume` | `Bearer <JWT>` (Roles: `student`, `admin`) | `{ student_id: string }` | `ResumeAnalysis` (`skills`, `education`, `experience`, `projects`, `summary`) | **D** | Unused by frontend. Node.js backend handles initial resume parsing directly. |
| `api.ai.matchResume` (`OpportunityDetailPage.tsx:60, 90`, `StudentMatchesPage.tsx:89`) | `POST` | `/api/v1/ai/match-resume` | `ai/app/routers/ai.py:90` | `match_resume` | `Bearer <JWT>` (Roles: `student`, `recruiter`, `admin`) | `{ student_id: string, job_id: string }` | `MatchResult` (`match_score`, `matched_skills`, `missing_skills`, `explanation`, `eligible`, `eligibility_reasons`, `keyword_score`, `semantic_score`) | **A** | Computes hybrid TF-IDF/semantic match score and persists to application if exists. |
| `api.ai.getAtsAnalysis` (`StudentResumePage.tsx:39, 91, 141`, `RecruiterApplicantsPage.tsx:258`) | `POST` | `/api/v1/ai/ats-analysis` | `ai/app/routers/ai.py:113` | `ats_analysis` | `Bearer <JWT>` (Roles: `student`, `recruiter`, `admin`) | `{ student_id: string, job_id?: string \| null }` | `AtsResult` (`ats_score`, `missing_keywords`, `improvement_suggestions`, `formatting_feedback`, `overall_feedback`) | **A** | Evaluates resume against target job description or platform demand keywords. |
| `api.ai.getSkillGaps` (`StudentMatchesPage.tsx:90`) | `POST` | `/api/v1/ai/skill-gaps` | `ai/app/routers/ai.py:135` | `skill_gaps` | `Bearer <JWT>` (Roles: `student`, `admin`) | `{ student_id: string, job_id: string }` | `SkillGapResult` (`missing_skills`, `recommendations: Array<{ skill, why, learn_from, estimated_time }>`, `job_id`, `job_title`, `company`) | **A** | Recommends learning paths and resources for missing job skills. |
| `api.ai.buildResume` (`StudentProfilePage.tsx:153`) | `POST` | `/api/v1/ai/build-resume` | `ai/app/routers/ai.py:153` | `build_resume` | `Bearer <JWT>` (Roles: `student`, `admin`) | `{ student_id: string }` | `BuildResumeResult` (`markdown`, `sections`, `suggestions`) | **A** | Generates institutional Markdown resume dossier from verified student data. |
| `api.ai.matchJobApplicants` (`RecruiterApplicantsPage.tsx:129`) | `POST` | `/api/v1/ai/match-job-applicants` | `ai/app/routers/ai.py:168` | `match_job_applicants` | `Bearer <JWT>` (Roles: `recruiter`, `admin`) | `{ job_id: string }` (Query: `?explain=true`) | `JobApplicantsMatchResult` (`job_id`, `total`, `results: Array<{ application_id, student_id, student_name, status, match_result }>`) | **A** | Batch ranks all candidates for a recruiter's job vacancy. |
| `api.ai.compareMatching` (`StudentMatchesPage.tsx:117`) | `POST` | `/api/v1/ai/compare-matching` | `ai/app/routers/ai.py:198` | `compare_matching` | `Bearer <JWT>` (Roles: `student`, `recruiter`, `admin`) | `{ student_id: string, job_id: string }` | `MatchComparison` (`student_id`, `job_id`, `embedding_backend`, `keyword_matched`, `semantic_matched`, `found_only_by_semantic`, `keyword_score`) | **E, H** | **Resolution Defect:** Does not call `_resolve_student_id`, failing if `student_id` is passed as user ID. |
| `api.ai.getSkillDemand` (`StudentSkillsPage.tsx:28`, `RecruiterReportsPage.tsx:19`) | `GET` | `/api/v1/ai/analytics/skill-demand` | `ai/app/routers/ai.py:215` | `skill_demand` | `Bearer <JWT>` (Any role) | Query: `?limit=15&open_only=true` | `SkillDemandResult` (`open_jobs_only`, `skills: Array<{ skill, jobs_requiring, students_with_skill, gap }>`) | **A** | Analyzes live database skills required across jobs vs possessed by students. |
| *None* (`client/src/lib/api.ts`) | `GET` | `/health`, `/api/v1/health` | `ai/app/routers/health.py:27` | `health` | Public (None) | None | `{ status: "ok", service: string, database: object, gemini: object, auth: object }` | **D** | Health check route, verified working. |

