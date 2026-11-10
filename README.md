# Aarohan — University Placement & Recruitment Management Platform

Aarohan is an enterprise-grade, explainable university placement and campus recruitment platform built with a three-tier architecture:
- **Client**: Modern React 19, TypeScript, and Vite single-page application with smooth Motion page transitions.
- **Server**: Express.js REST API with Prisma ORM and PostgreSQL (Neon serverless).
- **AI Service**: FastAPI intelligence service powering resume parsing, semantic matching (TF-IDF & neural embeddings), ATS compatibility scoring, and Retrieval-Augmented Generation (RAG).

---

## 1. Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React 19 / Vite SPA           │
                      │  Port 3000 (Student/Recruiter/Admin)   │
                      └───────────────┬────────────────────────┘
                                      │
                 ┌────────────────────┴────────────────────┐
                 │                                         │
                 ▼ REST API (JWT)                          ▼ AI / RAG Endpoints (JWT)
┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│        Express.js Backend        │      │        FastAPI AI Service        │
│    Port 8000 /api/v1             │      │    Port 8001 /api/v1/ai          │
└────────────────┬─────────────────┘      └────────────────┬─────────────────┘
                 │                                         │
                 │ Prisma ORM                              │ SQLAlchemy (Read-Only)
                 ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                       PostgreSQL Database (Neon)                           │
│     Users, Profiles, Jobs, Applications, Interviews, Drives, Audit Logs     │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
Aarohan/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # UI Primitives, Skeletons, Shells, Transitions
│   │   ├── lib/                # API Client, Router, Reactive Store, Matching Engine
│   │   ├── pages/              # Public, Student, Recruiter, and Admin Views
│   │   └── types/              # Domain Models & Interfaces
│   └── package.json
├── server/                     # Backend API Service
│   ├── src/
│   │   ├── config/             # DB & Environment Configuration
│   │   ├── controllers/        # Express Request Handlers
│   │   ├── middlewares/        # JWT Authentication, RBAC, File Uploads
│   │   ├── routes/             # API v1 Route Definitions
│   │   ├── services/           # PDF Text Extraction & Gemini ATS Parsing
│   │   └── utils/              # Token Signing & Helpers
│   ├── prisma/                 # Schema & Idempotent Seeding Scripts
│   ├── scripts/                # Guarded Demo Database Reset Tool
│   ├── tests/                  # Node.js Test Runner Suites
│   └── package.json
├── ai/                         # Intelligence & Semantic Matching Service
│   ├── app/
│   │   ├── db/                 # Repository & Schema Mapping
│   │   ├── rag/                # Section-Aware Chunker, LRU Embedder & Retriever
│   │   ├── routers/            # AI REST Routes (/analyze-resume, /ats-analysis, etc.)
│   │   └── services/           # Match Engine, Skill Gap Analyzer, ATS Scorer
│   └── tests/                  # Pytest Suite (RAG & Resume Lifecycle)
└── docs/                       # Architecture, Audit & Matrix Documentation
```

---

## 3. Environment Configuration

### Client (`client/.env`)
```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_AI_BASE_URL=http://localhost:8001/api/v1/ai
```

### Server (`server/.env`)
```bash
PORT=8000
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
```

### AI Service (`ai/.env`)
```bash
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
RESUME_STORAGE_DIR=../server/uploads
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 4. Setup and Installation

### Prerequisites
- Node.js v20+ / v22+
- Python 3.11+ / 3.12+ / 3.13+
- PostgreSQL database instance

### A. Server Setup
```bash
cd server
npm install
npx prisma generate
```

### B. AI Service Setup
```bash
cd ai
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### C. Client Setup
```bash
cd client
npm install
```

---

## 5. Database Operations

### Normal Idempotent Seeding
Populates or updates the baseline institutional data (admins, realistic recruiters under `example.com`, jobs, placement drives, institutional policies) without wiping student or application records:
```bash
cd server
npm run seed
```

### Controlled Demo Reset
Strictly guarded reset tool requiring the `DEMO_RESET=true` flag. Explicitly aborts in `production` and deletes records in foreign-key safe order inside a Prisma transaction:
```bash
cd server
npm run db:demo-reset
npm run seed
```

---

## 6. Running with Docker & Nginx (Recommended for Production)

Run the entire three-tier platform and unified Nginx gateway with a single command:

```bash
# 1. Copy environment template and fill in your DB credentials & Gemini API key
cp .env.example .env

# 2. Build and launch all 4 containers in the background
docker compose up --build -d

# 3. View logs
docker compose logs -f
```

The entire platform is now available on **`http://localhost`** (port 80):
- **Frontend SPA**: `http://localhost/`
- **Express API**: `http://localhost/api/v1/`
- **FastAPI AI**: `http://localhost/api/v1/ai/`

To shut down:
```bash
docker compose down
```

---

## 7. Running Locally Without Docker (Development Mode)

### Start Backend API Server
```bash
cd server
npm run dev
# Running on http://localhost:8000
```

### Start FastAPI AI Service
```bash
source .venv/bin/activate
cd ai
uvicorn app.main:app --port 8001 --reload
# Running on http://localhost:8001
```

### Start Vite Frontend
```bash
cd client
npm run dev
# Running on http://localhost:3000
```

---

## 7. Verification & Automated Test Suites

### Server Backend Tests
Runs 56+ tests validating authentication, RBAC, application workflows, interview rescheduling, candidate profile privacy, and resume lifecycle:
```bash
cd server
npm test
```

### AI / RAG Pytest Suite
Runs 20 tests validating document isolation, section chunking, absent resume error handling (`RESUME_NOT_UPLOADED`), corrupted PDF rejection, and evidence grounding:
```bash
.venv/bin/pytest ai/tests/
```

### Client TypeScript & Unit Tests
Verifies zero TypeScript compilation errors, session persistence, match calculation, and role guards:
```bash
cd client
npm run lint    # tsc --noEmit
npm test        # unit test runner
npm run build   # production bundle verification
```

---

## 8. Demo User Credentials

All demonstration accounts use the password: `Password@123`

| Role | Name | Email | Focus / Department |
| :--- | :--- | :--- | :--- |
| **Admin** | Directorate Admin | `admin@aarohan.edu` | Placement Directorate Supervision |
| **Student** | Om Upadhyay | `om.upadhyay@example.com` | B.Tech CSE (Resume upload candidate) |
| **Student** | Adya Tripathi | `adya.tripathi@example.com` | B.Tech CSE (Clean dossier candidate) |
| **Student** | Dev Sharma | `dev.sharma@example.com` | B.Tech IT (Active applicant) |
| **Recruiter** | Sundar Pichai | `recruiter.google@example.com` | Google (Cloud Backend & ML) |
| **Recruiter** | Satya Nadella | `recruiter.microsoft@example.com` | Microsoft (Systems & Full-Stack) |
| **Recruiter** | Brian Chesky | `recruiter.airbnb@example.com` | Airbnb (Distributed Platform) |
| **Recruiter** | Shashank Kumar | `recruiter.razorpay@example.com` | Razorpay (FinTech Payments) |
| **Recruiter** | Sriharsha Majety | `recruiter.swiggy@example.com` | Swiggy (Logistics & Backend) |
| **Recruiter** | Ritesh Agarwal | `recruiter.oyo@example.com` | OYO (Data Platform) |

---

## 9. Security & Governance Standards

- **Zero Fabricated Records**: Unauthenticated candidates or students without uploaded resumes produce authentic, unadulterated 0% / empty states and explicit `RESUME_NOT_UPLOADED` signals.
- **Cross-Tenant Privacy**: Recruiters cannot access candidates who have not applied to their specific job openings; students cannot inspect or download another candidate's profile or resume dossier.
- **Strict PDF Magic Byte Validation**: Header inspection rejects corrupted or disguised binaries prior to text extraction.
- **Audit Logging**: Sensitive governance events (policy modifications, drive status transitions, account activations) are logged to the `audit_logs` table.

