# Aarohan: Full Repository Audit, API Contract Discovery & Integration Gap Analysis

**Date:** November 8, 2026  
**Auditor:** Senior Full-Stack Architect & Codebase Auditor  
**Scope:** Complete repository (`client/`, `server/`, `ai/`)  
**Companion Artifact:** [API Contract Matrix](file:///Users/om_upadhyay/OM/workspace/Projects/Aarohan/docs/API_CONTRACT_MATRIX.md)

---

## 1. Executive Summary & Architecture Overview

Aarohan is a campus recruitment and career intelligence platform serving three user personas: **Students**, **Corporate Recruiters**, and **Central Placement Directorate Administrators**.

```
                           ┌───────────────────────────────┐
                           │      React 19 / Vite UI       │
                           │   (Port 3000 / Client SPA)    │
                           └──────────────┬────────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │                                             │
      JSON / Multipart (Port 8000)                  JSON / Bearer (Port 8001)
                   │                                             │
                   ▼                                             ▼
     ┌────────────────────────────┐               ┌─────────────────────────────┐
     │   Express 4 + Prisma ORM   │               │     FastAPI AI Service      │
     │      (Node.js Server)      │               │   (Port 8001 / Python)      │
     └─────────────┬──────────────┘               └──────────────┬──────────────┘
                   │                                             │
                   │ (Read/Write Pooled)                         │ (Read-Only Direct)
                   └──────────────────────┬──────────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │   PostgreSQL on AWS Neon Pool   │
                         │   (Shared Relational Database)  │
                         └─────────────────────────────────┘
```

### Subsystem Roles & Tech Stack
1. **Frontend (`client/`)**: Built with React 19, Vite, Tailwind CSS, Lucide icons, and Motion v12. State is managed by a hybrid reactive class store with `localStorage` caching (`CampusStore` in `client/src/lib/store.ts`).
2. **Backend Server (`server/`)**: Express 4 running on Node.js (default port 8000), using Prisma 6.19 with a pooled PostgreSQL database hosted on Neon AWS. Handles user authentication, candidate profile creation, PDF upload/storage, application tracking, interview scheduling, and institutional governance.
3. **AI Engine (`ai/`)**: FastAPI running on Python 3.13 (default port 8001). Provides semantic resume matching, ATS compatibility audits, skill gap recommendations, resume builder dossiers, and candidate batch ranking using Gemini 2.5 and TF-IDF / sentence-transformer fallback heuristics. Connects directly to the shared PostgreSQL database in read-only mode.

---

## 2. Inventory of API Endpoints by Status Classification

Total Endpoints Audited: **48**

| Classification | Count | Description |
| :--- | :---: | :--- |
| **A. Fully Integrated** | **23** | Both frontend and backend share an identical contract, validated and functional. |
| **B. Contract Mismatch** | **4** | Endpoint exists, but frontend property names or types do not match backend schema. |
| **C. Nonexistent Backend Endpoint** | **4** | Frontend triggers actions (e.g. withdraw, reschedule, cancel) that have no backend route. |
| **D. Backend Implements But Frontend Does Not Use** | **8** | Backend controllers exist, but no UI screen or component initiates calls. |
| **E. Incomplete Implementation** | **2** | Endpoint exists, but edge cases, validation, or business logic are incomplete. |
| **F. Authorization / Security Defect** | **4** | Routes lack required role validation, have IDOR vulnerabilities, or privilege escalation. |
| **G. Inconsistent / Hardcoded Data** | **3** | Endpoint or client store fabricates data (e.g. compensation, salary ranges). |
| **H. Type / Serialization Mismatch** | **2** | Data is dropped or corrupted due to object nesting or casing differences. |

---

## 3. Detailed Architectural & Security Defects

### [SEC-01] Public Registration Privilege Escalation to Administrator
- **File:** `server/src/validators/auth.validator.js:17` and `server/src/controllers/auth.controller.js:28`
- **Severity:** **CRITICAL**
- **Description:** `registerSchema` defines `role: z.enum(['student', 'recruiter', 'admin']).default('student')`. Any unauthenticated public client can send `POST /api/v1/auth/register` with `role: "admin"` to create a central administrator account with unrestricted access.
- **User-Facing Impact:** Total institutional compromise; unauthorized users can inspect all candidate records, modify placement policies, and tamper with recruitment drives.
- **Remediation:** Remove `'admin'` from the public `registerSchema`. Only allow `'student'` and `'recruiter'` registration. Admin accounts must be provisioned exclusively via database seed or internal invitation.

---

### [SEC-02] IDOR Vulnerability: Unauthorized Student Resume Download
- **File:** `server/src/controllers/resume.controller.js:184` (`getStudentResumeFile`)
- **Severity:** **HIGH**
- **Description:** Route `GET /api/v1/students/:student_id/resume` is protected by `authorizeRole('recruiter', 'admin')`, but fails to verify if the requesting recruiter owns any active job application submitted by `:student_id`.
- **User-Facing Impact:** Any recruiter can download any student's curriculum vitae (including personal phone numbers, addresses, and email) by guessing or enumerating UUIDs.
- **Remediation:** Verify that `prisma.application.findFirst({ where: { studentId: req.params.student_id, job: { recruiterId: req.user.id } } })` exists before streaming the PDF.

---

### [SEC-03] IDOR Vulnerability: Unrestricted Student Profile Lookup
- **File:** `server/src/controllers/student.controller.js:104` (`getStudentById`)
- **Severity:** **HIGH**
- **Description:** Route `GET /api/v1/students/:student_id` allows any recruiter to inspect the full academic profile, CGPA, backlogs, and contact information of students who have never applied to their organization.
- **User-Facing Impact:** Violation of FERPA / campus data privacy guidelines.
- **Remediation:** Enforce ownership checks matching the AI service security policy (`ai/app/security.py:96`).

---

### [SEC-04] Student Application Detail Access Locked Out (403 Forbidden)
- **File:** `server/src/routes/application.routes.js:25` and `server/src/controllers/application.controller.js:331`
- **Severity:** **CRITICAL**
- **Description:** Route `GET /api/v1/applications/:application_id` is restricted to `authorizeRole('recruiter', 'admin')`. Furthermore, the controller contains:
  ```js
  if (req.user.role !== 'admin' && application.job.recruiterId !== req.user.id) {
    return res.status(403).json({ code: 'FORBIDDEN', message: 'Not the owner' });
  }
  ```
  When a student navigates to `/student/applications/:applicationId`, `StudentApplicationDetailPage.tsx:33` invokes `api.applications.getById(id)` and immediately crashes with **403 Forbidden**.
- **User-Facing Impact:** Students are completely unable to open or view their own application status detail page.
- **Remediation:** Update the route to allow `student`, `recruiter`, and `admin`. In the controller, permit access if `req.user.id === application.student.userId` OR `req.user.id === application.job.recruiterId` OR `req.user.role === 'admin'`.

---

### [SEC-05] Overly Permissive Wildcard Production CORS Policy
- **File:** `server/src/index.js:28`
- **Severity:** **MEDIUM**
- **Description:** The CORS handler includes `origin.endsWith('.vercel.app') || process.env.NODE_ENV !== 'production'`. In production, any malicious third-party site hosted on Vercel can make credentialed cross-origin requests.
- **Remediation:** Restrict production CORS to explicit domain origins specified in `process.env.CLIENT_URL`.

---

### [SEC-06] Insecure File Upload Extension Validation
- **File:** `server/src/middlewares/upload.middleware.js:22-25`
- **Severity:** **MEDIUM**
- **Description:** File filter checks:
  ```js
  const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
  ```
  Using `||` allows non-PDF files with spoofed MIME headers or arbitrary executables with `.pdf` extensions to be stored in `uploads/`.
- **Remediation:** Require BOTH MIME type `application/pdf` AND extension `.pdf`. Verify the PDF magic bytes (`%PDF-`) before saving.

---

## 4. Contract Mismatches & Broken Integrations

### [CON-01] Interview Deserialization Shape Mismatch
- **File:** `client/src/lib/store.ts:464-470` vs `server/src/controllers/interview.controller.js:3-21`
- **Severity:** **HIGH**
- **Description:** 
  - Backend `formatInterview` returns:
    ```json
    {
      "id": "...",
      "application_id": "...",
      "job": { "id": "...", "title": "...", "company": "..." },
      "student": { "id": "...", "name": "...", "email": "..." }
    }
    ```
  - Frontend `syncInterviews` reads:
    ```ts
    jobId: iv.application?.job_id || iv.jobId,
    jobTitle: iv.application?.job?.title,
    company: iv.application?.job?.company
    ```
  Because `iv.application` is undefined in the backend response, `jobTitle` and `company` evaluate to undefined and are overwritten by artificial fallbacks (`"Technical Assessment"`, `"Partner Enterprise"`).
- **User-Facing Impact:** All live student and recruiter interview cards lose their actual job title and employer name, displaying fake fallback names.
- **Remediation:** Update `syncInterviews` in `store.ts` to read `iv.job?.id`, `iv.job?.title`, `iv.job?.company`, `iv.student?.id`, `iv.student?.name`.

---

### [CON-02] Recruiter Interview Scheduling Ignores Time & Drops on Empty Location
- **File:** `client/src/pages/recruiter/RecruiterApplicantsPage.tsx:197-204`
- **Severity:** **HIGH**
- **Description:** 
  1. Frontend sends: `new Date(`${interviewDate}T10:00:00.000Z`).toISOString()`, completely discarding the user-selected `startTime`.
  2. If the recruiter leaves `locationOrLink` empty, backend `scheduleInterviewSchema` fails with `400 location is required`. The frontend silently swallows the error in a catch block, updates local memory only, and never saves the interview to PostgreSQL.
- **User-Facing Impact:** Interviews appear scheduled in the current session, but vanish completely upon page refresh.
- **Remediation:** Parse the user's `startTime` into the ISO timestamp, make `location` a required input field in the UI with form validation, and display a visible error alert if the backend rejects the request.

---

### [CON-03] Nonexistent Interview Modification Endpoints
- **File:** `client/src/pages/recruiter/RecruiterInterviewsPage.tsx:47, 55`
- **Severity:** **HIGH**
- **Description:** The recruiter interview manager exposes "Reschedule Interview" and "Cancel Interview" buttons. These call `actions.rescheduleInterview` and `actions.cancelInterview`, which only mutate local memory. No `PATCH /interviews/:id` or `DELETE /interviews/:id` route exists on the backend.
- **User-Facing Impact:** Rescheduled dates or cancellations are never communicated to students and are discarded on reload.
- **Remediation:** Implement `PATCH /interviews/:id` and `DELETE /interviews/:id` in `server/src/routes/interview.routes.js` and `server/src/controllers/interview.controller.js`.

---

### [CON-04] Nonexistent Application Withdrawal Endpoint
- **File:** `client/src/pages/student/StudentApplicationDetailPage.tsx:87`
- **Severity:** **MEDIUM**
- **Description:** When a student clicks "Withdraw Application", the UI only mutates in-memory state. No backend endpoint exists, and students are forbidden from calling `PATCH /applications/:id/status`.
- **User-Facing Impact:** Withdrawn applications remain active in recruiter dashboards and candidate rosters.
- **Remediation:** Add `POST /applications/:id/withdraw` in Express backend allowing students to withdraw their own pending applications.

---

### [CON-05] AI Semantic Matching Comparison Student ID Resolution Defect
- **File:** `ai/app/routers/ai.py:207`
- **Severity:** **MEDIUM**
- **Description:** In `ai/app/routers/ai.py`, endpoint `/compare-matching` directly executes `student = _student(repo, body.student_id)` without calling `_resolve_student_id(principal, body.student_id)`. If the frontend passes an empty string or student profile UUID that does not match the database primary key, it raises a `404 STUDENT_NOT_FOUND`.
- **User-Facing Impact:** Clicking "Compare Keyword vs Semantic Matching" on `StudentMatchesPage.tsx` frequently fails with 404.
- **Remediation:** Wrap `body.student_id` with `_resolve_student_id(principal, body.student_id)`.

---

## 5. Hardcoded Data Inventory

The following table catalogs all remaining hardcoded demo records, artificial fallbacks, and fabricated analytics across the codebase:

| Location | Component / File | Hardcoded Element | Explanation |
| :--- | :--- | :--- | :--- |
| `server/src/controllers/admin.application.controller.js:163` | `getAdminPlacements` | `compensation: '$125,000 / yr'` | Hardcoded compensation string returned for every selected placement. |
| `server/src/controllers/admin.application.controller.js:173-174` | `getAdminPlacements` | `highest_package: '$145,000 / yr'`, `average_package: '$118,500 / yr'` | Hardcoded summary metrics in placement ledger. |
| `server/src/controllers/admin.application.controller.js:77` | `getAdminApplications` | `match_score ?? 85` | Artificial fallback score of 85 if application has no match result. |
| `client/src/lib/store.ts:378-386` | `syncJobs` | `location: 'Campus / Multiple Locations'`, `workArrangement: 'Hybrid'`, `employmentType: 'Full-time'`, `salaryRange: 'Competitive'` | Artificial job attributes fabricated because the Prisma `Job` schema lacks these columns. |
| `client/src/lib/store.ts:468-477` | `syncInterviews` | `round: 'Technical Assessment'`, `endTime: '11:00 AM'`, `locationOrLink: 'Building 4, Placement Hall'` | Hardcoded fallback interview metadata when backend attributes fail to deserialize. |
| `client/src/lib/store.ts:590-630` | `CampusStore.uploadResume` | Simulated timer with mock parser | Dead simulated resume upload function from early frontend prototyping. |
| `client/src/pages/opportunities/OpportunityDetailPage.tsx:106` | `handleApply` | `actions.applyToJob(job.id, matchScore)` | Offline demo fallback mutates local state when backend API call fails. |
| `client/src/pages/student/StudentSkillsPage.tsx:17` | `useCampusStore` | `skillResources: []` | No backend database table or endpoint exists for learning resources. |
| `client/src/pages/student/StudentNotificationsPage.tsx:9` | `useCampusStore` | `notifications: []` | Notifications are purely in-memory; no backend notification ledger exists. |

---

## 6. Database Schema Inconsistencies & Omissions

Inspection of `server/prisma/schema.prisma` reveals the following architectural gaps:

1. **Missing `Interview.status` Column:**
   - The `Interview` model has `id`, `applicationId`, `scheduledAt`, `mode`, `location`, `notes`.
   - It lacks a `status` field (`scheduled`, `completed`, `cancelled`, `rescheduled`). The frontend assumes interviews have a lifecycle status.
2. **Missing Job Compensation & Work Type Fields:**
   - The `Job` model only stores `title`, `company`, `description`, `requiredSkills`, `eligibleBranches`, `minCgpa`, `graduationYear`, `maxBacklogs`, `deadline`, `status`, `recruiterId`.
   - The frontend expects `location`, `workArrangement` (`On-site`, `Hybrid`, `Remote`), `employmentType` (`Full-time`, `Internship`), and `salaryRange`. Because these do not exist in the database, they are lost on save and replaced with mock fallbacks.
3. **Missing Notification Table:**
   - There is no table to persist notifications sent to students or recruiters regarding interview schedules, status updates, or deadline reminders.
4. **Application Status Enum Discrepancy:**
   - Prisma enum: `applied`, `shortlisted`, `interview_scheduled`, `selected`, `rejected`, `not_selected`.
   - Frontend TypeScript enum: `'Applied' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Selected' | 'Rejected' | 'Withdrawn'`.
   - TitleCase vs snake_case requires conversion mapping on every request and response.

---

## 7. Routing & UX Defects

1. **Unhandled Recruiter Routes in `App.tsx`:**
   - `client/src/lib/router.tsx` defines parameter extractors for `/recruiter/jobs/:jobId`, `/recruiter/jobs/:jobId/edit`, and `/recruiter/candidates/:applicationId`.
   - In `client/src/App.tsx`, none of these routes have rendering branches. Navigating to them silently falls back to `<RecruiterDashboard />`.
2. **Recruiter Calendar Reuses Student Calendar:**
   - `/recruiter/calendar` renders `<StudentCalendarPage />` directly, which queries student-centric data hooks.
3. **Admin Direct Student Detail Route Unhandled:**
   - `/admin/students/:studentId` is recognized in `router.tsx` but unhandled in `App.tsx`, falling back to `<AdminDashboard />`.
4. **Test Suite Network Failure on `npm --prefix server test`:**
   - Running `npm --prefix server test` fails with Prisma error `P1001: Can't reach database server` because `"test": "NODE_ENV=test node --test tests/**/*.test.js"` in `server/package.json` does not load `--env-file=.env`.

---

## 8. Prioritized Remediation Plan

### Phase 1: Security & Critical Data Integrity (P0)
Fix vulnerabilities and blockers preventing core student and recruiter workflows.

| Issue ID | File Path | Function / Component | Severity | Description & Solution | Dependencies |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **SEC-01** | `server/src/validators/auth.validator.js` | `registerSchema` | **CRITICAL** | Restrict public registration to `'student'` and `'recruiter'` only. Remove `'admin'`. | None |
| **SEC-04** | `server/src/routes/application.routes.js`, `server/src/controllers/application.controller.js` | `getApplicationById` | **CRITICAL** | Allow students to view their own application detail. Add student ownership check. | None |
| **SEC-02** | `server/src/controllers/resume.controller.js` | `getStudentResumeFile` | **HIGH** | Add ownership check: verify recruiter owns an application for this student. | None |
| **SEC-03** | `server/src/controllers/student.controller.js` | `getStudentById` | **HIGH** | Add ownership check: verify recruiter owns an application for this student. | None |
| **CON-01** | `client/src/lib/store.ts` | `syncInterviews` | **HIGH** | Correct interview property mapping to read `iv.job` and `iv.student`. | None |

### Phase 2: Missing Endpoints & Contract Harmonization (P1)
Implement missing backend endpoints so user actions persist to Neon PostgreSQL.

| Issue ID | File Path | Function / Component | Severity | Description & Solution | Dependencies |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **CON-03** | `server/src/routes/interview.routes.js`, `server/src/controllers/interview.controller.js` | `rescheduleInterview`, `cancelInterview` | **HIGH** | Implement `PATCH /interviews/:id` and `DELETE /interviews/:id` with recruiter ownership verification. | None |
| **CON-04** | `server/src/routes/application.routes.js`, `server/src/controllers/application.controller.js` | `withdrawApplication` | **MEDIUM** | Implement `POST /applications/:id/withdraw` for student owners. | None |
| **CON-02** | `client/src/pages/recruiter/RecruiterApplicantsPage.tsx` | `handleConfirmSchedule` | **HIGH** | Parse actual `startTime` into ISO date; validate `location` before sending; show server error if rejected. | None |
| **AI-01** | `ai/app/routers/ai.py` | `compare_matching` | **MEDIUM** | Add `_resolve_student_id` to prevent 404s when comparing matching. | None |
| **SEC-05** | `server/src/index.js` | CORS middleware | **MEDIUM** | Remove `.vercel.app` wildcard in production; enforce explicit origins. | None |
| **SEC-06** | `server/src/middlewares/upload.middleware.js` | `fileFilter` | **MEDIUM** | Enforce both MIME `application/pdf` and extension `.pdf`. Verify `%PDF-` magic header. | None |

### Phase 3: Schema Enrichment & Hardcoded Data Removal (P2)
Eliminate mock fallbacks by adding required columns to the database schema.

| Issue ID | File Path | Function / Component | Severity | Description & Solution | Dependencies |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **SCH-01** | `server/prisma/schema.prisma` | `Job` model | **MEDIUM** | Add `location`, `workArrangement`, `employmentType`, `salaryRange` to `Job`. | DB Migration |
| **SCH-02** | `server/prisma/schema.prisma` | `Interview` model | **MEDIUM** | Add `status` enum (`scheduled`, `completed`, `cancelled`, `rescheduled`) to `Interview`. | DB Migration |
| **DAT-01** | `server/src/controllers/admin.application.controller.js` | `getAdminPlacements` | **LOW** | Compute real compensation from job offers or mark as verified stipends instead of hardcoded strings. | SCH-01 |
| **ROU-01** | `client/src/App.tsx` | `AppRouter` | **MEDIUM** | Wire missing recruiter job view/edit routes and admin candidate detail route. | None |
| **TEST-01** | `server/package.json` | `scripts.test` | **LOW** | Add `--env-file=.env` to test runner so integration tests can connect to database. | None |

---

## 9. List of Exact Files Requiring Modification

### Backend (`server/`)
1. `server/src/validators/auth.validator.js` — Block admin role in public registration.
2. `server/src/controllers/auth.controller.js` — Reject unauthorized admin registration attempts.
3. `server/src/routes/application.routes.js` — Grant student role access to `GET /applications/:id`; add withdraw route.
4. `server/src/controllers/application.controller.js` — Permit student self-access in `getApplicationById`; implement `withdrawApplication`.
5. `server/src/routes/interview.routes.js` — Add `PATCH /interviews/:id` and `DELETE /interviews/:id`.
6. `server/src/controllers/interview.controller.js` — Implement interview update and cancellation handlers with ownership verification.
7. `server/src/controllers/resume.controller.js` — Enforce applicant ownership check in `getStudentResumeFile`.
8. `server/src/controllers/student.controller.js` — Enforce applicant ownership check in `getStudentById`.
9. `server/src/controllers/admin.application.controller.js` — Replace hardcoded compensation strings.
10. `server/src/middlewares/upload.middleware.js` — Enforce strict dual-check PDF validation.
11. `server/src/index.js` — Fix production CORS wildcard.
12. `server/package.json` — Add `--env-file=.env` to test script.

### AI Service (`ai/`)
13. `ai/app/routers/ai.py` — Add `_resolve_student_id` to `/compare-matching`.

### Frontend (`client/`)
14. `client/src/lib/store.ts` — Fix `syncInterviews` property mapping; clean up dead mock upload simulation.
15. `client/src/lib/api.ts` — Add `withdrawApplication`, `rescheduleInterview`, `cancelInterview` client methods.
16. `client/src/pages/recruiter/RecruiterApplicantsPage.tsx` — Fix interview scheduling ISO timestamp and location validation.
17. `client/src/pages/opportunities/OpportunityDetailPage.tsx` — Remove offline demo fallback that hides backend errors.
18. `client/src/App.tsx` — Handle missing recruiter and admin detail routes.

