"""Request / response models — they mirror the frozen API contract (v1.0) exactly.
Extra endpoints (clearly marked) live at the bottom."""
from __future__ import annotations

from typing import Annotated, Any, Optional

from pydantic import BaseModel, BeforeValidator, Field


def _coerce_id(v: Any) -> Any:
    if isinstance(v, bool):
        return v
    if isinstance(v, int):
        return str(v)
    if isinstance(v, str):
        return v.strip()
    return v


Id = Annotated[str, BeforeValidator(_coerce_id), Field(min_length=1, max_length=128)]


# ───────────────────────────── requests ─────────────────────────────
class StudentRequest(BaseModel):
    student_id: Id


class MatchRequest(BaseModel):
    student_id: Id
    job_id: Id


class AtsRequest(BaseModel):
    student_id: Id
    job_id: Optional[Id] = None  # optional per contract


class JobRequest(BaseModel):
    job_id: Id


# ───────────────────────────── 6.1 analyze-resume ─────────────────────────────
class ProjectItem(BaseModel):
    title: str = ""
    description: str = ""
    tech_stack: list[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    degree: str = ""
    branch: str = ""
    institution: str = ""
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None


class ExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    duration: str = ""
    description: str = ""


class ResumeAnalysis(BaseModel):
    skills: list[str] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    summary: str = ""


# ───────────────────────────── 6.2 match-resume ─────────────────────────────
class MatchResult(BaseModel):
    match_score: int = Field(ge=0, le=100)
    matched_skills: list[str]
    missing_skills: list[str]
    explanation: str
    eligible: bool
    eligibility_reasons: list[str]


# ───────────────────────────── 6.3 ats-analysis ─────────────────────────────
class AtsResult(BaseModel):
    ats_score: int = Field(ge=0, le=100)
    missing_keywords: list[str]
    improvement_suggestions: list[str]
    formatting_feedback: list[str]
    overall_feedback: str


# ───────────────────────────── 6.4 skill-gaps ─────────────────────────────
class SkillRecommendation(BaseModel):
    skill: str
    why: str
    learn_from: str
    estimated_time: str


class SkillGapResult(BaseModel):
    missing_skills: list[str]
    recommendations: list[SkillRecommendation]


# ───────────────────────────── 6.5 build-resume ─────────────────────────────
class ImprovedResume(BaseModel):
    summary: str
    skills: list[str]
    experience: list[ExperienceItem]
    projects: list[ProjectItem]
    suggestions: list[str]


class BuildResumeResult(BaseModel):
    improved_resume: ImprovedResume


# ═════════════════ EXTRA endpoints (not in the frozen contract) ═════════════════
class ApplicantMatch(BaseModel):
    application_id: str
    student_id: str
    student_name: str
    status: str
    match_result: MatchResult


class JobApplicantsMatchResult(BaseModel):
    job_id: str
    total: int
    results: list[ApplicantMatch]


class SkillComparison(BaseModel):
    required_skill: str
    keyword_match: bool
    semantic_status: str  # exact | text | semantic | related | missing
    matched_with: Optional[str] = None
    similarity: Optional[float] = None


class MatchComparison(BaseModel):
    student_id: str
    job_id: str
    embedding_backend: str
    keyword_matched: list[str]
    semantic_matched: list[str]
    found_only_by_semantic: list[str]
    keyword_score: int
    semantic_score: int
    per_skill: list[SkillComparison]


class SkillDemandItem(BaseModel):
    skill: str
    jobs_requiring: int
    students_with_skill: int
    gap: int


class SkillDemandResult(BaseModel):
    open_jobs_only: bool
    skills: list[SkillDemandItem]
