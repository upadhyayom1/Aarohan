# Aarohan — Complete API Contract

**Version:** 1.0 (Frozen at Minute 20)  
**Base URL:** `http://localhost:8000/api/v1`  
**Auth:** Bearer token in every protected request header: `Authorization: Bearer <token>`  
**Content-Type:** `application/json` for all requests and responses unless noted.  
**Dates:** ISO 8601 strings (`2026-11-01T10:00:00Z`).  
**Roles:** `student` | `recruiter` | `admin`

> **Frontend rule:** Never invent a field. If it is not in this contract, it does not exist. If you need something that is missing, tell M3.

---

## Table of Contents

1. [Auth](#1-auth)
2. [Student Profile](#2-student-profile)
3. [Resume](#3-resume)
4. [Jobs](#4-jobs)
5. [Applications](#5-applications)
6. [AI Endpoints](#6-ai-endpoints)
7. [Interviews](#7-interviews)
8. [Admin](#8-admin)
9. [Error Responses](#9-error-responses)
10. [Enums and Constant Values](#10-enums-and-constant-values)
11. [Frontend Page → API Mapping](#11-frontend-page--api-mapping)
12. [Mock Responses for Frontend Dev](#12-mock-responses-for-frontend-dev)

---

## 1. Auth

### 1.1 Register

**Used on:** Register page

```
POST /auth/register
Auth: None
```

**Request body:**
```json
{
  "name": "Prateek Sharma",
  "email": "prateek@mnnit.ac.in",
  "password": "StrongPass@123",
  "role": "student"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | min 2 chars |
| `email` | string | yes | must be valid email |
| `password` | string | yes | min 8 chars |
| `role` | string | yes | `"student"` or `"recruiter"` |

**Response 201:**
```json
{
  "id": "usr_01",
  "name": "Prateek Sharma",
  "email": "prateek@mnnit.ac.in",
  "role": "student",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Missing or invalid fields |
| 409 | `EMAIL_ALREADY_EXISTS` | Email taken |

---

### 1.2 Login

**Used on:** Login page

```
POST /auth/login
Auth: None
```

**Request body:**
```json
{
  "email": "prateek@mnnit.ac.in",
  "password": "StrongPass@123"
}
```

**Response 200:**
```json
{
  "id": "usr_01",
  "name": "Prateek Sharma",
  "email": "prateek@mnnit.ac.in",
  "role": "student",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 400 | `VALIDATION_ERROR` | Missing fields |

> **Frontend:** Store `token` and `role` in localStorage. Attach token to every subsequent request. On `role === "student"` redirect to `/student/dashboard`. On `role === "recruiter"` redirect to `/recruiter/dashboard`. On `role === "admin"` redirect to `/admin/dashboard`.

---

### 1.3 Get Current User

**Used on:** App load (to rehydrate session), all nav headers

```
GET /auth/me
Auth: Required (any role)
```

**Response 200:**
```json
{
  "id": "usr_01",
  "name": "Prateek Sharma",
  "email": "prateek@mnnit.ac.in",
  "role": "student"
}
```

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 401 | `UNAUTHORIZED` | Token missing or expired |

---

## 2. Student Profile

### 2.1 Get My Profile

**Used on:** Student dashboard, student profile page, recruiter's candidate detail view (via application)

```
GET /students/me
Auth: Required (role: student)
```

**Response 200:**
```json
{
  "id": "stu_01",
  "user_id": "usr_01",
  "name": "Prateek Sharma",
  "email": "prateek@mnnit.ac.in",
  "branch": "CSE",
  "cgpa": 8.5,
  "graduation_year": 2027,
  "backlogs": 0,
  "skills": ["Python", "FastAPI", "SQL", "React"],
  "projects": [
    {
      "title": "CogniVault",
      "description": "FastAPI chatbot with RAG and session memory",
      "tech_stack": ["Python", "FastAPI", "LangChain"]
    }
  ],
  "resume_uploaded": true,
  "resume_url": "/students/resume/file",
  "profile_complete": true
}
```

| Field | Type | Notes |
|---|---|---|
| `branch` | string | One of the branch enum values |
| `cgpa` | float | 0.0 to 10.0 |
| `graduation_year` | int | 4-digit year |
| `backlogs` | int | 0 or more |
| `skills` | string[] | Free text tags |
| `projects` | object[] | See structure above |
| `resume_uploaded` | boolean | Whether a resume file exists |
| `resume_url` | string or null | URL to download the resume PDF |
| `profile_complete` | boolean | True if all mandatory fields filled |

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 401 | `UNAUTHORIZED` | Not logged in |
| 403 | `FORBIDDEN` | Not a student |
| 404 | `PROFILE_NOT_FOUND` | Profile not yet created |

---

### 2.2 Create or Update My Profile

**Used on:** Student profile setup/edit page

```
PUT /students/me
Auth: Required (role: student)
```

**Request body:**
```json
{
  "name": "Prateek Sharma",
  "branch": "CSE",
  "cgpa": 8.5,
  "graduation_year": 2027,
  "backlogs": 0,
  "skills": ["Python", "FastAPI", "SQL", "React"],
  "projects": [
    {
      "title": "CogniVault",
      "description": "FastAPI chatbot with RAG and session memory",
      "tech_stack": ["Python", "FastAPI", "LangChain"]
    }
  ]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | |
| `branch` | string | yes | must be a valid branch enum |
| `cgpa` | float | yes | 0.0–10.0 |
| `graduation_year` | int | yes | 4-digit year |
| `backlogs` | int | yes | 0 or more |
| `skills` | string[] | yes | at least one |
| `projects` | object[] | no | can be empty array |

**Response 200:** Same shape as `GET /students/me`.

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid field values |
| 401 | `UNAUTHORIZED` | |
| 403 | `FORBIDDEN` | Not a student |

---

### 2.3 Get Student Profile by ID (Recruiter use)

**Used on:** Recruiter's candidate detail page

```
GET /students/{student_id}
Auth: Required (role: recruiter or admin)
```

**Response 200:** Same shape as `GET /students/me`.

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 403 | `FORBIDDEN` | Not a recruiter or admin |
| 404 | `STUDENT_NOT_FOUND` | |

---

## 3. Resume

### 3.1 Upload Resume

**Used on:** Student resume upload page / profile page

```
POST /students/resume
Auth: Required (role: student)
Content-Type: multipart/form-data
```

**Request body (form-data):**
```
file: <PDF binary>
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | file | yes | PDF only, max 5 MB |

**Response 200:**
```json
{
  "message": "Resume uploaded and analyzed successfully",
  "resume_url": "/students/resume/file",
  "analysis": {
    "skills": ["Python", "FastAPI", "SQL", "React"],
    "education": [
      {
        "degree": "B.Tech",
        "branch": "Computer Science and Engineering",
        "institution": "MNNIT Allahabad",
        "graduation_year": 2027,
        "cgpa": 8.5
      }
    ],
    "experience": [
      {
        "company": "XYZ Corp",
        "role": "Backend Intern",
        "duration": "May 2026 – Jul 2026",
        "description": "Built FastAPI services"
      }
    ],
    "projects": [
      {
        "title": "CogniVault",
        "description": "FastAPI chatbot with RAG",
        "tech_stack": ["Python", "FastAPI", "LangChain"]
      }
    ],
    "summary": "Backend-focused engineer with strong Python skills"
  }
}
```

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 400 | `INVALID_FILE_TYPE` | Not a PDF |
| 400 | `FILE_TOO_LARGE` | Over 5 MB |
| 401 | `UNAUTHORIZED` | |
| 403 | `FORBIDDEN` | Not a student |

> **Frontend:** On success, update the profile to show `resume_uploaded: true`. Display the analysis results under the upload zone.

---

### 3.2 Get Resume File

**Used on:** Resume preview link for students and recruiters

```
GET /students/resume/file
Auth: Required (student gets own resume; recruiter gets via application)
```

**Response 200:** PDF binary with headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="resume.pdf"
```

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 404 | `RESUME_NOT_FOUND` | No resume uploaded yet |

---

### 3.3 Get Resume by Student ID (Recruiter use)

**Used on:** Recruiter's candidate detail page

```
GET /students/{student_id}/resume
Auth: Required (role: recruiter or admin)
```

**Response 200:** PDF binary (same headers as above).

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 403 | `FORBIDDEN` | |
| 404 | `RESUME_NOT_FOUND` | |

---

## 4. Jobs

### 4.1 List Jobs

**Used on:** Student job list page, recruiter job list page

```
GET /jobs
Auth: Required (any role)
```

**Query parameters:**
| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | 1 | Pagination |
| `limit` | int | 20 | Max 50 |
| `branch` | string | — | Filter by eligible branch |
| `open_only` | boolean | true | Show only open jobs |

**Response 200:**
```json
{
  "total": 42,
  "page": 1,
  "limit": 20,
  "jobs": [
    {
      "id": "job_01",
      "title": "Backend Engineer Intern",
      "company": "TechCorp",
      "description": "Build scalable backend services...",
      "required_skills": ["Python", "FastAPI", "SQL"],
      "eligible_branches": ["CSE", "IT"],
      "min_cgpa": 7.0,
      "graduation_year": 2027,
      "max_backlogs": 0,
      "deadline": "2026-11-15T23:59:00Z",
      "status": "open",
      "recruiter_id": "usr_02",
      "recruiter_name": "Ananya Verma",
      "applicant_count": 12,
      "created_at": "2026-10-30T10:00:00Z"
    }
  ]
}
```

> **Frontend note for student side:** When role is `student`, optionally include `"is_eligible": true/false` per job based on the student's profile. Discuss with M3 whether this is computed server-side or client-side.

---

### 4.2 Get Job Detail

**Used on:** Student job detail page, recruiter job detail page

```
GET /jobs/{job_id}
Auth: Required (any role)
```

**Response 200:**
```json
{
  "id": "job_01",
  "title": "Backend Engineer Intern",
  "company": "TechCorp",
  "description": "Build scalable backend services using Python and FastAPI. The role involves designing APIs, integrating databases, and writing clean modular code.",
  "required_skills": ["Python", "FastAPI", "SQL"],
  "eligible_branches": ["CSE", "IT"],
  "min_cgpa": 7.0,
  "graduation_year": 2027,
  "max_backlogs": 0,
  "deadline": "2026-11-15T23:59:00Z",
  "status": "open",
  "recruiter_id": "usr_02",
  "recruiter_name": "Ananya Verma",
  "applicant_count": 12,
  "created_at": "2026-10-30T10:00:00Z",
  "updated_at": "2026-10-31T08:00:00Z"
}
```

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 404 | `JOB_NOT_FOUND` | |

---

### 4.3 Create Job

**Used on:** Recruiter create job form

```
POST /jobs
Auth: Required (role: recruiter)
```

**Request body:**
```json
{
  "title": "Backend Engineer Intern",
  "company": "TechCorp",
  "description": "Build scalable backend services using Python and FastAPI.",
  "required_skills": ["Python", "FastAPI", "SQL"],
  "eligible_branches": ["CSE", "IT"],
  "min_cgpa": 7.0,
  "graduation_year": 2027,
  "max_backlogs": 0,
  "deadline": "2026-11-15T23:59:00Z"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | |
| `company` | string | yes | |
| `description` | string | yes | |
| `required_skills` | string[] | yes | at least one |
| `eligible_branches` | string[] | yes | at least one branch enum value |
| `min_cgpa` | float | yes | 0.0–10.0 |
| `graduation_year` | int | yes | |
| `max_backlogs` | int | yes | 0 or more |
| `deadline` | string (ISO 8601) | yes | must be in the future |

**Response 201:** Full job object (same shape as `GET /jobs/{job_id}`).

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid fields |
| 403 | `FORBIDDEN` | Not a recruiter |

---

### 4.4 Update Job

**Used on:** Recruiter edit job form

```
PUT /jobs/{job_id}
Auth: Required (role: recruiter, must own the job)
```

**Request body:** Same as `POST /jobs`. All fields required.

**Response 200:** Updated job object.

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 403 | `FORBIDDEN` | Not the owner |
| 404 | `JOB_NOT_FOUND` | |

---

### 4.5 Close or Reopen Job

**Used on:** Recruiter job detail page (toggle)

```
PATCH /jobs/{job_id}/status
Auth: Required (role: recruiter, must own the job)
```

**Request body:**
```json
{
  "status": "closed"
}
```

| Field | Type | Values |
|---|---|---|
| `status` | string | `"open"` or `"closed"` |

**Response 200:** Updated job object.

---

## 5. Applications

### 5.1 Apply for a Job

**Used on:** Student job detail page — Apply button

```
POST /applications
Auth: Required (role: student)
```

**Request body:**
```json
{
  "job_id": "job_01"
}
```

**Response 201:**
```json
{
  "id": "app_01",
  "job_id": "job_01",
  "student_id": "stu_01",
  "status": "applied",
  "eligible": true,
  "eligibility_reasons": [],
  "match_result": {
    "match_score": 85,
    "matched_skills": ["Python", "FastAPI", "SQL"],
    "missing_skills": ["Docker", "AWS"],
    "explanation": "Strong backend skills; no cloud experience yet.",
    "eligible": true,
    "eligibility_reasons": []
  },
  "applied_at": "2026-10-31T12:00:00Z"
}
```

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 400 | `ALREADY_APPLIED` | Duplicate application |
| 400 | `JOB_CLOSED` | Deadline passed or job closed |
| 403 | `FORBIDDEN` | Not a student |
| 404 | `JOB_NOT_FOUND` | |
| 422 | `NOT_ELIGIBLE` | Student fails mandatory eligibility; body includes `eligibility_reasons` |

> **Frontend:** On `422 NOT_ELIGIBLE`, show the reasons inline and disable the Apply button. Do not show an error toast — show a clear inline ineligibility message.

**Ineligibility error body:**
```json
{
  "code": "NOT_ELIGIBLE",
  "message": "You do not meet the eligibility criteria for this job.",
  "eligibility_reasons": [
    "Your CGPA (6.8) is below the required minimum (7.0)",
    "Your branch (ECE) is not eligible for this role"
  ]
}
```

---

### 5.2 Get My Applications (Student)

**Used on:** Student application tracker page

```
GET /applications/my
Auth: Required (role: student)
```

**Response 200:**
```json
{
  "applications": [
    {
      "id": "app_01",
      "job": {
        "id": "job_01",
        "title": "Backend Engineer Intern",
        "company": "TechCorp",
        "deadline": "2026-11-15T23:59:00Z"
      },
      "status": "shortlisted",
      "match_result": {
        "match_score": 85,
        "matched_skills": ["Python", "FastAPI", "SQL"],
        "missing_skills": ["Docker", "AWS"],
        "explanation": "Strong backend skills; no cloud experience yet.",
        "eligible": true,
        "eligibility_reasons": []
      },
      "interview": null,
      "applied_at": "2026-10-31T12:00:00Z",
      "updated_at": "2026-10-31T14:00:00Z"
    }
  ]
}
```

> `interview` is `null` if not yet scheduled, otherwise the interview object (see section 7).

---

### 5.3 Get Applicants for a Job (Recruiter)

**Used on:** Recruiter applicants list page

```
GET /jobs/{job_id}/applicants
Auth: Required (role: recruiter, must own the job)
```

**Query parameters:**
| Param | Type | Default | Notes |
|---|---|---|---|
| `status` | string | — | Filter by application status |
| `eligible_only` | boolean | false | |
| `sort_by` | string | `match_score` | `match_score`, `cgpa`, `applied_at` |
| `order` | string | `desc` | `asc` or `desc` |

**Response 200:**
```json
{
  "job_id": "job_01",
  "total": 12,
  "applicants": [
    {
      "application_id": "app_01",
      "student": {
        "id": "stu_01",
        "name": "Prateek Sharma",
        "email": "prateek@mnnit.ac.in",
        "branch": "CSE",
        "cgpa": 8.5,
        "graduation_year": 2027,
        "backlogs": 0,
        "skills": ["Python", "FastAPI", "SQL", "React"],
        "resume_url": "/students/stu_01/resume"
      },
      "status": "applied",
      "eligible": true,
      "match_result": {
        "match_score": 85,
        "matched_skills": ["Python", "FastAPI", "SQL"],
        "missing_skills": ["Docker", "AWS"],
        "explanation": "Strong backend skills; no cloud experience yet.",
        "eligible": true,
        "eligibility_reasons": []
      },
      "applied_at": "2026-10-31T12:00:00Z"
    }
  ]
}
```

---

### 5.4 Get Single Application Detail (Recruiter)

**Used on:** Recruiter candidate detail page

```
GET /applications/{application_id}
Auth: Required (role: recruiter, must own the job the application belongs to)
```

**Response 200:**
```json
{
  "id": "app_01",
  "job": {
    "id": "job_01",
    "title": "Backend Engineer Intern",
    "company": "TechCorp"
  },
  "student": {
    "id": "stu_01",
    "name": "Prateek Sharma",
    "email": "prateek@mnnit.ac.in",
    "branch": "CSE",
    "cgpa": 8.5,
    "graduation_year": 2027,
    "backlogs": 0,
    "skills": ["Python", "FastAPI", "SQL", "React"],
    "projects": [
      {
        "title": "CogniVault",
        "description": "FastAPI chatbot with RAG",
        "tech_stack": ["Python", "FastAPI", "LangChain"]
      }
    ],
    "resume_url": "/students/stu_01/resume"
  },
  "status": "applied",
  "eligible": true,
  "match_result": {
    "match_score": 85,
    "matched_skills": ["Python", "FastAPI", "SQL"],
    "missing_skills": ["Docker", "AWS"],
    "explanation": "Strong backend skills; no cloud experience yet.",
    "eligible": true,
    "eligibility_reasons": []
  },
  "ats_result": null,
  "interview": null,
  "applied_at": "2026-10-31T12:00:00Z",
  "updated_at": "2026-10-31T14:00:00Z"
}
```

> `ats_result` is `null` until the recruiter triggers ATS analysis. `interview` is `null` until scheduled.

---

### 5.5 Update Application Status (Recruiter)

**Used on:** Recruiter shortlist, reject, and status update actions

```
PATCH /applications/{application_id}/status
Auth: Required (role: recruiter, must own the job)
```

**Request body:**
```json
{
  "status": "shortlisted"
}
```

| Field | Type | Values |
|---|---|---|
| `status` | string | `"shortlisted"`, `"rejected"`, `"interview_scheduled"`, `"selected"`, `"not_selected"` |

**Response 200:**
```json
{
  "id": "app_01",
  "status": "shortlisted",
  "updated_at": "2026-10-31T15:00:00Z"
}
```

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 400 | `INVALID_STATUS_TRANSITION` | e.g. rejecting an already-selected candidate |
| 403 | `FORBIDDEN` | |
| 404 | `APPLICATION_NOT_FOUND` | |

---

## 6. AI Endpoints

### 6.1 Analyze Resume

**Used on:** Auto-triggered after `POST /students/resume`. Can also be called manually.

```
POST /ai/analyze-resume
Auth: Required (role: student)
```

**Request body:**
```json
{
  "student_id": "stu_01"
}
```

> Backend uses the already-uploaded PDF path. Frontend does not send the file here.

**Response 200:**
```json
{
  "skills": ["Python", "FastAPI", "SQL", "React"],
  "education": [
    {
      "degree": "B.Tech",
      "branch": "Computer Science and Engineering",
      "institution": "MNNIT Allahabad",
      "graduation_year": 2027,
      "cgpa": 8.5
    }
  ],
  "experience": [
    {
      "company": "XYZ Corp",
      "role": "Backend Intern",
      "duration": "May 2026 – Jul 2026",
      "description": "Built FastAPI services"
    }
  ],
  "projects": [
    {
      "title": "CogniVault",
      "description": "FastAPI chatbot with RAG",
      "tech_stack": ["Python", "FastAPI", "LangChain"]
    }
  ],
  "summary": "Backend-focused engineer with strong Python skills"
}
```

---

### 6.2 Match Resume to Job

**Used on:** Student job detail page (view match score), recruiter applicants list (per applicant), recruiter candidate detail page

```
POST /ai/match-resume
Auth: Required (student or recruiter)
```

**Request body:**
```json
{
  "student_id": "stu_01",
  "job_id": "job_01"
}
```

**Response 200:**
```json
{
  "match_score": 85,
  "matched_skills": ["Python", "FastAPI", "SQL"],
  "missing_skills": ["Docker", "AWS"],
  "explanation": "The candidate has strong backend development skills in Python and FastAPI, matching 3 of 5 required skills. Cloud and containerization experience is missing.",
  "eligible": true,
  "eligibility_reasons": []
}
```

**If ineligible (still returns 200, not an error):**
```json
{
  "match_score": 88,
  "matched_skills": ["Python", "FastAPI", "SQL"],
  "missing_skills": ["Docker"],
  "explanation": "Skills align well, but the candidate does not meet the CGPA requirement.",
  "eligible": false,
  "eligibility_reasons": [
    "CGPA 6.8 is below the required minimum of 7.0"
  ]
}
```

> **Frontend:** `eligible: false` blocks the Apply button and shows the reasons. High `match_score` with `eligible: false` should still show the score but with an ineligibility banner above it.

---

### 6.3 ATS Analysis

**Used on:** Student resume page (Should Have), recruiter candidate detail page (Should Have)

```
POST /ai/ats-analysis
Auth: Required (student or recruiter)
```

**Request body:**
```json
{
  "student_id": "stu_01",
  "job_id": "job_01"
}
```

> `job_id` is optional. If omitted, the backend does a general ATS analysis without comparing to a specific job.

**Response 200:**
```json
{
  "ats_score": 72,
  "missing_keywords": ["Docker", "Kubernetes", "CI/CD", "AWS"],
  "improvement_suggestions": [
    "Add a dedicated Skills section at the top of your resume",
    "Quantify your project impact with numbers where possible",
    "Include keywords from the job description: Docker, AWS"
  ],
  "formatting_feedback": [
    "Resume is ATS-friendly (no tables or images)",
    "Font and layout are clean"
  ],
  "overall_feedback": "Your resume is fairly ATS-compatible. Adding missing technical keywords and quantifying achievements will significantly improve your score."
}
```

---

### 6.4 Skill Gap Recommendations

**Used on:** Student job detail page — "What to learn" section (Should Have)

```
POST /ai/skill-gaps
Auth: Required (student)
```

**Request body:**
```json
{
  "student_id": "stu_01",
  "job_id": "job_01"
}
```

**Response 200:**
```json
{
  "missing_skills": ["Docker", "AWS"],
  "recommendations": [
    {
      "skill": "Docker",
      "why": "Required for containerizing backend services",
      "learn_from": "Docker's official getting-started guide",
      "estimated_time": "1–2 weeks"
    },
    {
      "skill": "AWS",
      "why": "Cloud deployment is listed as a core requirement",
      "learn_from": "AWS Cloud Practitioner Essentials (free)",
      "estimated_time": "2–4 weeks"
    }
  ]
}
```

---

### 6.5 Build Resume (Secondary priority)

**Used on:** Student resume page — "Improve my resume" feature

```
POST /ai/build-resume
Auth: Required (role: student)
```

**Request body:**
```json
{
  "student_id": "stu_01"
}
```

**Response 200:**
```json
{
  "improved_resume": {
    "summary": "Backend engineer with 1 year internship experience...",
    "skills": ["Python", "FastAPI", "SQL", "React", "Git"],
    "experience": [...],
    "projects": [...],
    "suggestions": [
      "Add a professional summary",
      "Reorder skills to match industry convention"
    ]
  }
}
```

> **Frontend:** If this endpoint is not ready, hide the button and do not show an error.

---

## 7. Interviews

### 7.1 Schedule Interview (Recruiter)

**Used on:** Recruiter candidate detail page — "Schedule Interview" form

```
POST /interviews
Auth: Required (role: recruiter)
```

**Request body:**
```json
{
  "application_id": "app_01",
  "scheduled_at": "2026-11-10T10:00:00Z",
  "mode": "online",
  "location": "https://meet.google.com/xyz-abc-def",
  "notes": "Please be available 5 minutes early"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `application_id` | string | yes | |
| `scheduled_at` | string (ISO 8601) | yes | must be in the future |
| `mode` | string | yes | `"online"` or `"on_campus"` |
| `location` | string | yes | URL for online, address for on-campus |
| `notes` | string | no | |

**Response 201:**
```json
{
  "id": "int_01",
  "application_id": "app_01",
  "job": {
    "id": "job_01",
    "title": "Backend Engineer Intern",
    "company": "TechCorp"
  },
  "student": {
    "id": "stu_01",
    "name": "Prateek Sharma",
    "email": "prateek@mnnit.ac.in"
  },
  "scheduled_at": "2026-11-10T10:00:00Z",
  "mode": "online",
  "location": "https://meet.google.com/xyz-abc-def",
  "notes": "Please be available 5 minutes early",
  "created_at": "2026-10-31T15:00:00Z"
}
```

> Scheduling an interview automatically sets the application status to `"interview_scheduled"`. M3 does this server-side; the frontend does not need to call `PATCH /applications/{id}/status` separately.

**Errors:**
| Status | Code | Meaning |
|---|---|---|
| 400 | `PAST_DATE` | scheduled_at is in the past |
| 400 | `INTERVIEW_ALREADY_SCHEDULED` | Interview exists for this application |
| 403 | `FORBIDDEN` | Not the recruiter who owns the job |
| 404 | `APPLICATION_NOT_FOUND` | |

---

### 7.2 List My Interviews

**Used on:** Student interview page, recruiter interviews page

```
GET /interviews/my
Auth: Required (student or recruiter)
```

**Query parameters:**
| Param | Type | Default | Notes |
|---|---|---|---|
| `upcoming` | boolean | — | If `true`, only future interviews |
| `past` | boolean | — | If `true`, only past interviews |

**Response 200:**
```json
{
  "interviews": [
    {
      "id": "int_01",
      "application_id": "app_01",
      "job": {
        "id": "job_01",
        "title": "Backend Engineer Intern",
        "company": "TechCorp"
      },
      "student": {
        "id": "stu_01",
        "name": "Prateek Sharma",
        "email": "prateek@mnnit.ac.in"
      },
      "scheduled_at": "2026-11-10T10:00:00Z",
      "mode": "online",
      "location": "https://meet.google.com/xyz-abc-def",
      "notes": "Please be available 5 minutes early",
      "created_at": "2026-10-31T15:00:00Z"
    }
  ]
}
```

---

## 8. Admin

> Only if time permits. Admin routes require `role: admin`.

### 8.1 Get All Students

```
GET /admin/students
Auth: Required (role: admin)
```

**Response 200:**
```json
{
  "total": 120,
  "students": [
    {
      "id": "stu_01",
      "name": "Prateek Sharma",
      "branch": "CSE",
      "cgpa": 8.5,
      "graduation_year": 2027,
      "resume_uploaded": true,
      "applications_count": 3,
      "shortlisted_count": 1
    }
  ]
}
```

---

### 8.2 Get All Recruiters

```
GET /admin/recruiters
Auth: Required (role: admin)
```

**Response 200:**
```json
{
  "total": 8,
  "recruiters": [
    {
      "id": "usr_02",
      "name": "Ananya Verma",
      "email": "ananya@techcorp.com",
      "company": "TechCorp",
      "jobs_posted": 3
    }
  ]
}
```

---

### 8.3 Get Placement Statistics

```
GET /admin/stats
Auth: Required (role: admin)
```

**Response 200:**
```json
{
  "total_students": 120,
  "students_placed": 45,
  "total_jobs": 18,
  "open_jobs": 7,
  "total_applications": 340,
  "shortlisted": 78,
  "interviews_scheduled": 55
}
```

---

## 9. Error Responses

**All errors follow this shape:**

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable description",
  "details": {}
}
```

`details` may contain field-level validation errors:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "cgpa": "Must be between 0.0 and 10.0",
    "deadline": "Must be a future date"
  }
}
```

**Common HTTP status codes:**
| Status | Meaning | When |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error, business rule violation |
| 401 | Unauthorized | Missing or expired token |
| 403 | Forbidden | Valid token but wrong role or not owner |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate (e.g. email, application) |
| 422 | Unprocessable | Eligibility failure on apply |
| 500 | Internal Error | Backend crash |

**Frontend rule:** On 401, clear the session and redirect to `/login`. On 403, show a "You don't have access" message. On 500, show a generic error banner with a retry button.

---

## 10. Enums and Constant Values

### Branch values
```
CSE, IT, ECE, EE, ME, CE, CH, MCA, MBA, PHD_CS, OTHER
```

### Application status values
```
applied → shortlisted → interview_scheduled → selected
applied → rejected
applied → shortlisted → not_selected
```

### Job status values
```
open, closed
```

### Interview mode values
```
online, on_campus
```

---

## 11. Frontend Page → API Mapping

> One-stop reference for M1. Every page and the exact calls it makes.

### Auth pages

| Page | API calls |
|---|---|
| `/login` | `POST /auth/login` |
| `/register` | `POST /auth/register` |
| App load (session restore) | `GET /auth/me` |

---

### Student pages

| Page | API calls |
|---|---|
| `/student/dashboard` | `GET /auth/me`, `GET /students/me`, `GET /applications/my`, `GET /jobs?limit=5&open_only=true` |
| `/student/profile` | `GET /students/me` (load), `PUT /students/me` (save) |
| `/student/resume` | `GET /students/me` (check `resume_url`), `POST /students/resume` (upload), `POST /ai/ats-analysis` (Should Have), `POST /ai/build-resume` (If time permits) |
| `/student/jobs` | `GET /jobs` (with pagination and filters) |
| `/student/jobs/:jobId` | `GET /jobs/{job_id}`, `POST /ai/match-resume` (to show match score before applying), `POST /ai/skill-gaps` (Should Have), `POST /applications` (Apply button) |
| `/student/applications` | `GET /applications/my` |
| `/student/interviews` | `GET /interviews/my?upcoming=true` |

---

### Recruiter pages

| Page | API calls |
|---|---|
| `/recruiter/dashboard` | `GET /auth/me`, `GET /jobs` (own jobs), `GET /jobs/{job_id}/applicants` (for recent activity) |
| `/recruiter/jobs` | `GET /jobs` |
| `/recruiter/jobs/new` | `POST /jobs` |
| `/recruiter/jobs/:jobId` | `GET /jobs/{job_id}`, `PATCH /jobs/{job_id}/status` (close or reopen) |
| `/recruiter/jobs/:jobId/edit` | `GET /jobs/{job_id}` (prefill), `PUT /jobs/{job_id}` |
| `/recruiter/jobs/:jobId/applicants` | `GET /jobs/{job_id}/applicants` (with sort and filters) |
| `/recruiter/applications/:applicationId` | `GET /applications/{application_id}`, `POST /ai/ats-analysis` (Should Have), `PATCH /applications/{application_id}/status`, `POST /interviews` (schedule form) |
| `/recruiter/interviews` | `GET /interviews/my` |

---

### Admin pages (If time permits)

| Page | API calls |
|---|---|
| `/admin/dashboard` | `GET /admin/stats` |
| `/admin/students` | `GET /admin/students` |
| `/admin/recruiters` | `GET /admin/recruiters` |

---

## 12. Mock Responses for Frontend Dev

> Use these until M3's real backend is ready. Paste them into `frontend/src/api/mocks.js` or equivalent.

### Mock user (student)
```json
{
  "id": "usr_01",
  "name": "Prateek Sharma",
  "email": "prateek@mnnit.ac.in",
  "role": "student",
  "token": "mock_token_student"
}
```

### Mock user (recruiter)
```json
{
  "id": "usr_02",
  "name": "Ananya Verma",
  "email": "ananya@techcorp.com",
  "role": "recruiter",
  "token": "mock_token_recruiter"
}
```

### Mock student profile
```json
{
  "id": "stu_01",
  "user_id": "usr_01",
  "name": "Prateek Sharma",
  "email": "prateek@mnnit.ac.in",
  "branch": "CSE",
  "cgpa": 8.5,
  "graduation_year": 2027,
  "backlogs": 0,
  "skills": ["Python", "FastAPI", "SQL", "React"],
  "projects": [
    {
      "title": "CogniVault",
      "description": "FastAPI chatbot with RAG and session memory",
      "tech_stack": ["Python", "FastAPI", "LangChain"]
    }
  ],
  "resume_uploaded": true,
  "resume_url": "/students/resume/file",
  "profile_complete": true
}
```

### Mock job list
```json
{
  "total": 2,
  "page": 1,
  "limit": 20,
  "jobs": [
    {
      "id": "job_01",
      "title": "Backend Engineer Intern",
      "company": "TechCorp",
      "description": "Build scalable backend services using Python and FastAPI.",
      "required_skills": ["Python", "FastAPI", "SQL"],
      "eligible_branches": ["CSE", "IT"],
      "min_cgpa": 7.0,
      "graduation_year": 2027,
      "max_backlogs": 0,
      "deadline": "2026-11-15T23:59:00Z",
      "status": "open",
      "recruiter_id": "usr_02",
      "recruiter_name": "Ananya Verma",
      "applicant_count": 12,
      "created_at": "2026-10-30T10:00:00Z"
    },
    {
      "id": "job_02",
      "title": "ML Intern",
      "company": "DataSoft",
      "description": "Work on NLP and classification models.",
      "required_skills": ["Python", "PyTorch", "scikit-learn"],
      "eligible_branches": ["CSE", "IT", "ECE"],
      "min_cgpa": 7.5,
      "graduation_year": 2027,
      "max_backlogs": 1,
      "deadline": "2026-11-20T23:59:00Z",
      "status": "open",
      "recruiter_id": "usr_03",
      "recruiter_name": "Rohan Das",
      "applicant_count": 5,
      "created_at": "2026-10-29T09:00:00Z"
    }
  ]
}
```

### Mock match result
```json
{
  "match_score": 85,
  "matched_skills": ["Python", "FastAPI", "SQL"],
  "missing_skills": ["Docker", "AWS"],
  "explanation": "The candidate has strong backend development skills in Python and FastAPI, matching 3 of 5 required skills. Cloud and containerization experience (Docker, AWS) is not evident in the resume.",
  "eligible": true,
  "eligibility_reasons": []
}
```

### Mock ineligible match result
```json
{
  "match_score": 88,
  "matched_skills": ["Python", "FastAPI", "SQL"],
  "missing_skills": ["Docker"],
  "explanation": "Skills align very well, but the candidate does not meet the CGPA requirement for this role.",
  "eligible": false,
  "eligibility_reasons": [
    "CGPA 6.8 is below the required minimum of 7.0"
  ]
}
```

### Mock applicants list
```json
{
  "job_id": "job_01",
  "total": 2,
  "applicants": [
    {
      "application_id": "app_01",
      "student": {
        "id": "stu_01",
        "name": "Prateek Sharma",
        "email": "prateek@mnnit.ac.in",
        "branch": "CSE",
        "cgpa": 8.5,
        "graduation_year": 2027,
        "backlogs": 0,
        "skills": ["Python", "FastAPI", "SQL", "React"],
        "resume_url": "/students/stu_01/resume"
      },
      "status": "applied",
      "eligible": true,
      "match_result": {
        "match_score": 85,
        "matched_skills": ["Python", "FastAPI", "SQL"],
        "missing_skills": ["Docker", "AWS"],
        "explanation": "Strong backend skills; no cloud experience yet.",
        "eligible": true,
        "eligibility_reasons": []
      },
      "applied_at": "2026-10-31T12:00:00Z"
    },
    {
      "application_id": "app_02",
      "student": {
        "id": "stu_02",
        "name": "Sneha Gupta",
        "email": "sneha@mnnit.ac.in",
        "branch": "ECE",
        "cgpa": 6.8,
        "graduation_year": 2027,
        "backlogs": 1,
        "skills": ["Python", "SQL"],
        "resume_url": "/students/stu_02/resume"
      },
      "status": "applied",
      "eligible": false,
      "match_result": {
        "match_score": 60,
        "matched_skills": ["Python", "SQL"],
        "missing_skills": ["FastAPI", "Docker", "AWS"],
        "explanation": "Basic Python and SQL skills present but branch (ECE) and CGPA (6.8) do not meet requirements.",
        "eligible": false,
        "eligibility_reasons": [
          "Branch ECE is not in the eligible list (CSE, IT)",
          "CGPA 6.8 is below the required minimum of 7.0"
        ]
      },
      "applied_at": "2026-10-31T13:00:00Z"
    }
  ]
}
```

---

*End of API Contract — v1.0*  
*Frozen at Minute 20. Any change requires sign-off from M3 (backend) and notification to M1 (frontend) and M2 (AI).*