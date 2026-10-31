"""AI endpoints. Paths/shapes follow API contract section 6 (+ clearly marked extras)."""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Query

from app.db.records import JobRecord, StudentRecord
from app.db.repository import Repository
from app.deps import get_repository, get_services
from app.errors import AppError
from app.schemas import (
    ApplicantMatch,
    AtsRequest,
    AtsResult,
    BuildResumeResult,
    JobApplicantsMatchResult,
    JobRequest,
    MatchComparison,
    MatchRequest,
    MatchResult,
    ResumeAnalysis,
    SkillDemandResult,
    SkillGapResult,
    StudentRequest,
)
from app.security import (
    Principal,
    authorize_job_access,
    authorize_student_access,
    get_principal,
    require_roles,
)
from app.services import analytics
from app.services.container import Services

log = logging.getLogger(__name__)
router = APIRouter(tags=["ai"])


# ───────────────────────────── helpers ─────────────────────────────
def _student(repo: Repository, student_id: str) -> StudentRecord:
    s = repo.get_student(student_id)
    if not s:
        raise AppError(404, "STUDENT_NOT_FOUND", "Student not found")
    return s


def _job(repo: Repository, job_id: str) -> JobRecord:
    j = repo.get_job(job_id)
    if not j:
        raise AppError(404, "JOB_NOT_FOUND", "Job not found")
    return j


def _guard_student_job(repo: Repository, principal: Principal, student: StudentRecord, job: JobRecord) -> None:
    """Students may score any job against themselves; recruiters only their own jobs' applicants."""
    authorize_job_access(principal, job)
    authorize_student_access(repo, principal, student, job_id=job.id if principal.role == "recruiter" else None)


# ───────────────────────────── 6.1 ─────────────────────────────
@router.post("/analyze-resume", response_model=ResumeAnalysis)
def analyze_resume(
    body: StudentRequest,
    background: BackgroundTasks,
    principal: Principal = Depends(get_principal),
    repo: Repository = Depends(get_repository),
    svc: Services = Depends(get_services),
):
    require_roles(principal, "student", "admin")
    student = _student(repo, body.student_id)
    authorize_student_access(repo, principal, student)
    ctx = svc.resumes.get_context(student)
    background.add_task(svc.node.push_resume_analysis, student.id, ctx.analysis)
    return ctx.analysis


# ───────────────────────────── 6.2 ─────────────────────────────
@router.post("/match-resume", response_model=MatchResult)
def match_resume(
    body: MatchRequest,
    background: BackgroundTasks,
    principal: Principal = Depends(get_principal),
    repo: Repository = Depends(get_repository),
    svc: Services = Depends(get_services),
):
    require_roles(principal, "student", "recruiter", "admin")
    student = _student(repo, body.student_id)
    job = _job(repo, body.job_id)
    _guard_student_job(repo, principal, student, job)

    ctx = svc.resumes.try_get_context(student)
    result, _ = svc.matching.compute(student, job, ctx)

    application = repo.get_application(student.id, job.id)
    if application and application.id:
        background.add_task(svc.node.push_match_result, application.id, result)
    return result


# ───────────────────────────── 6.3 ─────────────────────────────
@router.post("/ats-analysis", response_model=AtsResult)
def ats_analysis(
    body: AtsRequest,
    principal: Principal = Depends(get_principal),
    repo: Repository = Depends(get_repository),
    svc: Services = Depends(get_services),
):
    require_roles(principal, "student", "recruiter", "admin")
    student = _student(repo, body.student_id)
    job: Optional[JobRecord] = None
    if body.job_id:
        job = _job(repo, body.job_id)
        authorize_job_access(principal, job)
    authorize_student_access(
        repo, principal, student, job_id=job.id if (job and principal.role == "recruiter") else None
    )
    ctx = svc.resumes.get_context(student)
    demand = [] if job else analytics.top_demand_keywords(repo)
    return svc.ats.analyze(ctx.pdf, job, demand)


# ───────────────────────────── 6.4 ─────────────────────────────
@router.post("/skill-gaps", response_model=SkillGapResult)
def skill_gaps(
    body: MatchRequest,
    principal: Principal = Depends(get_principal),
    repo: Repository = Depends(get_repository),
    svc: Services = Depends(get_services),
):
    require_roles(principal, "student", "admin")
    student = _student(repo, body.student_id)
    job = _job(repo, body.job_id)
    authorize_student_access(repo, principal, student)
    ctx = svc.resumes.try_get_context(student)
    breakdown = svc.matching.breakdown(student, job, ctx)
    pool = svc.matching.build_pool(student, ctx)
    return svc.gaps.recommend(job, breakdown.summary.missing, pool)


# ───────────────────────────── 6.5 ─────────────────────────────
@router.post("/build-resume", response_model=BuildResumeResult)
def build_resume(
    body: StudentRequest,
    principal: Principal = Depends(get_principal),
    repo: Repository = Depends(get_repository),
    svc: Services = Depends(get_services),
):
    require_roles(principal, "student", "admin")
    student = _student(repo, body.student_id)
    authorize_student_access(repo, principal, student)
    ctx = svc.resumes.try_get_context(student)
    return svc.builder.build(student, ctx.analysis if ctx else None)


# ═════════════════ EXTRA endpoints (not part of the frozen contract) ═════════════════
@router.post("/match-job-applicants", response_model=JobApplicantsMatchResult)
def match_job_applicants(
    body: JobRequest,
    principal: Principal = Depends(get_principal),
    repo: Repository = Depends(get_repository),
    svc: Services = Depends(get_services),
    explain: bool = Query(False, description="Use Gemini for per-applicant explanations (slower)"),
):
    """Score every applicant of a job at once (recruiter applicants list)."""
    require_roles(principal, "recruiter", "admin")
    job = _job(repo, body.job_id)
    authorize_job_access(principal, job)
    pairs = repo.applicants_for_job(job.id, limit=svc.settings.match_batch_limit)
    results: list[ApplicantMatch] = []
    for application, student in pairs:
        ctx = svc.resumes.try_get_context(student)
        match, _ = svc.matching.compute(student, job, ctx, with_explanation=explain)
        results.append(
            ApplicantMatch(
                application_id=application.id,
                student_id=student.id,
                student_name=student.name,
                status=application.status,
                match_result=match,
            )
        )
    results.sort(key=lambda r: r.match_result.match_score, reverse=True)
    return JobApplicantsMatchResult(job_id=job.id, total=len(results), results=results)


@router.post("/compare-matching", response_model=MatchComparison)
def compare_matching(
    body: MatchRequest,
    principal: Principal = Depends(get_principal),
    repo: Repository = Depends(get_repository),
    svc: Services = Depends(get_services),
):
    """Keyword-only vs semantic matching on the same student/job (demo / brownie point)."""
    require_roles(principal, "student", "recruiter", "admin")
    student = _student(repo, body.student_id)
    job = _job(repo, body.job_id)
    _guard_student_job(repo, principal, student, job)
    ctx = svc.resumes.try_get_context(student)
    out = svc.matching.compare(student, job, ctx)
    return MatchComparison(student_id=student.id, job_id=job.id, embedding_backend=svc.embedder.name, **out)


@router.get("/analytics/skill-demand", response_model=SkillDemandResult)
def skill_demand(
    limit: int = Query(15, ge=1, le=50),
    open_only: bool = Query(True),
    principal: Principal = Depends(get_principal),
    repo: Repository = Depends(get_repository),
):
    """In-demand skills across jobs vs how many students have them."""
    require_roles(principal, "recruiter", "admin")
    return analytics.skill_demand(repo, limit=limit, open_only=open_only)
