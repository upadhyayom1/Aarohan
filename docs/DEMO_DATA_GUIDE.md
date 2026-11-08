# AAROHAN DEMO DATASET & SEEDING ARCHITECTURE GUIDE

**Version:** 1.0.0  
**Target Environment:** Development / Staging Testing  
**Database Engine:** PostgreSQL (Neon Serverless) / Prisma ORM  

---

## 1. OVERVIEW & SAFETY PRINCIPLES

Aarohan features a production-safe, two-tier database initialization architecture designed to ensure data integrity, prevent accidental production data loss, and provide clean demonstration data without hardcoded frontend mocks.

### The Two Separate Operations:
1. **Normal Seed (`npm run seed`):**
   - **Idempotent & Safe:** Uses `upsert` and deterministic matching to insert or update demonstration entities.
   - **Non-destructive:** Does **not** erase unrelated or production records.
   - **Safe to Repeat:** Can be executed repeatedly without generating duplicate records or failing unique constraints.
   - **Silent on Secrets:** Never outputs database credentials, connection strings, or raw passwords.

2. **Explicit Demo Reset (`npm run db:demo-reset`):**
   - **Strict Protection:** Refuses to execute unless `DEMO_RESET=true` is explicitly provided as an environment variable.
   - **Production Barrier:** Immediately aborts if `NODE_ENV=production`.
   - **Sanitized Logging:** Logs the target database host and database name with all passwords and secrets masked.
   - **Foreign-Key-Safe Transaction:** Executes deletions inside a Prisma transaction in strict topological order:
     $$\text{Interviews} \longrightarrow \text{Applications} \longrightarrow \text{Jobs} \longrightarrow \text{StudentProfiles} \longrightarrow \text{Users} \longrightarrow \text{PlacementDrives} \longrightarrow \text{AuditLogs} \longrightarrow \text{Settings}$$

---

## 2. DEMONSTRATION ACCOUNTS & CREDENTIALS

All demonstration accounts are provisioned with the standard demo password:
> **Default Password:** `Password@123`  
*(Securely hashed with `bcryptjs` cost factor 10)*

### 2.1 Central Placement Directorate (Administrator)

| Portal Role | Name | Email Address | Access & Purpose |
| :--- | :--- | :--- | :--- |
| **admin** | Campus Placement Directorate (Coordinator) | `admin@aarohan.edu` | Master administrator access: drive management, institutional settings, governance audit logs, student and recruiter directories, global application analytics. |

### 2.2 Demonstration Recruiters & Partner Employers

Demonstration recruiter accounts use clearly marked demo emails under the reserved `example.com` domain:

| Enterprise Partner | Recruiter Name | Demo Email Address | Portal Role | Verified Opening |
| :--- | :--- | :--- | :--- | :--- |
| **Microsoft** | Pooja Sharma | `recruiter.microsoft@example.com` | `recruiter` | Software Development Engineer - Azure Core |
| **Morgan Stanley** | Rohit Singhal | `recruiter.morganstanley@example.com` | `recruiter` | Technology Analyst - Institutional Securities |
| **Deutsche Bank** | Vikram Malhotra | `recruiter.db@example.com` | `recruiter` | Investment Banking Technology Analyst |
| **BNY** | Neha Kapoor | `recruiter.bny@example.com` | `recruiter` | Data Engineer - Global Asset Servicing |
| **Amazon** | Karthik Menon | `recruiter.amazon@example.com` | `recruiter` | Software Development Engineer - AWS Databases |
| **Apex Systems** | Ananya Verma | `recruiter@apexsystems.com` | `recruiter` | Software Development Engineer I & ML Research Engineer |

> [!NOTE]
> These demo accounts represent sample enterprise partner workflows for demonstration and QA purposes.

---

### 2.3 Demonstration Student Accounts

In accordance with institutional privacy and data integrity constraints:
- **No fabricated resume text, skills, projects, or credentials are pre-seeded.**
- `resumeUploaded` is set to `false`.
- Resume URL, file path, extracted text, and AI analysis fields are `null`.
- `profileComplete` is set to `false`.
- When the student logs in and uploads their actual PDF resume, the FastAPI resume parser extracts their authentic credentials, computes semantic match scores against active job openings, and populates the database.

| Student Name | Email Address | Portal Role | Initial Academic State | Resume State |
| :--- | :--- | :--- | :--- | :--- |
| **Om Upadhyay** | `om.upadhyay@aarohan.edu` | `student` | CSE, Class of 2027 | `NOT_UPLOADED` (Clean slate) |
| **Adya Tripathi** | `adya.20253026@mnnit.ac.in` | `student` | CSE, Class of 2027 | `NOT_UPLOADED` (Clean slate) |
| **Dev Sharma** | `student.sample@example.com` | `student` | CSE, Class of 2027 | Sample applicant for recruiter test flows |

---

## 3. SAMPLE JOB OPENINGS INVENTORY

Every job opening record contains coherent responsibilities, eligibility criteria, and transparent compensation:

| Role Title | Company | Eligible Branches | Min CGPA | Max Backlogs | Deadline | Work Arrangement | CTC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Software Development Engineer - Azure Core** | Microsoft | CSE, IT, ECE | 7.5 | 0 | 2026-12-25 | Bengaluru / Hyderabad (Hybrid) | ₹26.50 LPA |
| **Technology Analyst - Institutional Securities** | Morgan Stanley | CSE, IT, ECE, EE | 8.0 | 0 | 2026-12-30 | Mumbai / Bengaluru (Hybrid) | ₹24.00 LPA |
| **Investment Banking Technology Analyst** | Deutsche Bank | CSE, IT, ECE, EE, MCA | 7.0 | 0 | 2026-12-20 | Pune / Bengaluru (Hybrid) | ₹19.50 LPA |
| **Data Engineer - Global Asset Servicing** | BNY | CSE, IT, ECE | 7.5 | 0 | 2027-01-10 | Chennai / Pune (Hybrid) | ₹18.00 LPA |
| **Software Development Engineer - AWS Databases** | Amazon | CSE, IT | 8.0 | 0 | 2027-01-05 | Hyderabad / Bengaluru (Onsite) | ₹28.00 LPA |
| **Software Development Engineer I** | Apex Systems | CSE, IT, ECE | 7.5 | 0 | 2026-12-15 | Noida / Remote (Hybrid) | ₹16.00 LPA |
| **Machine Learning Research Engineer** | Apex Systems | CSE, IT | 8.0 | 0 | 2026-12-20 | Bengaluru (Onsite) | ₹22.00 LPA |

---

## 4. SAMPLE PLACEMENT DRIVES

| Drive Name | Partner Companies | Openings Count | Status | Eligible Branches | Min CGPA | Dates |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Autumn Technology & Engineering Drive 2026** | Microsoft, Morgan Stanley, Deutsche Bank, BNY, Amazon, Apex Systems | 18 | `Active` | CSE, IT, ECE | 7.0 | Nov 25 – Dec 10, 2026 |
| **Global FinTech & Quantitative Systems Drive** | Morgan Stanley, Deutsche Bank, BNY | 8 | `Active` | CSE, IT, ECE, EE | 7.5 | Dec 12 – Dec 22, 2026 |
| **Spring Cloud & Distributed Systems Hiring Consortium** | Microsoft, Amazon | 10 | `Draft` | CSE, IT | 8.0 | Feb 01 – Feb 15, 2027 |

---

## 5. CLI EXECUTION PROCEDURES

### 5.1 Normal Idempotent Seeding (Safe)

To seed or update demo records without altering existing data:

```bash
# From workspace root
npm --prefix server run seed

# Or directly within server directory
cd server
node --env-file=.env prisma/seed.js
```

**Expected Output:**
```
═══════════════════════════════════════════════════════════════
                 AAROHAN IDEMPOTENT SEED                       
═══════════════════════════════════════════════════════════════
Execution Timestamp: 2026-11-08T12:18:15.323Z
Beginning idempotent seed operations...
───────────────────────────────────────────────────────────────
                  SEED OPERATION SUMMARY                       
───────────────────────────────────────────────────────────────
 Administrators Created / Updated : 1
 Recruiters Created / Updated     : 6
 Students Created / Updated       : 3
 Job Openings Created / Updated   : 7
 Applications Created / Updated   : 2
 Interviews Created / Updated     : 1
 Placement Drives Created / Updated: 3
 Institutional Settings Configured : 1
───────────────────────────────────────────────────────────────
✔ Idempotent seed completed successfully.
═══════════════════════════════════════════════════════════════
```

---

### 5.2 Explicit Demo Reset (Destructive - Non-Production Only)

To completely wipe all demonstration tables and restore a clean slate:

```bash
# Direct command with required confirmation flag
DEMO_RESET=true npm --prefix server run db:reset

# Or via dedicated script
npm --prefix server run db:demo-reset
```

**Safety Abort Behaviors:**
1. Running without `DEMO_RESET=true`:
   ```
   ⛔ ABORTED: Missing required confirmation flag DEMO_RESET=true.
      To safely reset demo data, execute:
      DEMO_RESET=true node --env-file=.env scripts/reset-db.js
      No records were modified.
   ```
2. Running in `NODE_ENV=production`:
   ```
   ⛔ FATAL: Demo database reset is strictly prohibited in PRODUCTION environments.
      Operation aborted. No records were modified.
   ```

---

## 6. VERIFICATION & TEST CONFORMANCE

All test suites and verification checks have been run against the seeded PostgreSQL database:

```bash
$ npm --prefix server test
ℹ tests 49
ℹ suites 0
ℹ pass 49
ℹ fail 0
ℹ duration_ms 83327ms

$ npm --prefix client test
ℹ tests 8
ℹ pass 8
ℹ fail 0

$ npm --prefix client run lint
# Exit code 0 (Zero type errors)

$ npm --prefix client run build
# Built production bundle in 191ms (Zero errors)
```

