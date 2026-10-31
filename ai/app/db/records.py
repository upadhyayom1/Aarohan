from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional


@dataclass
class StudentRecord:
    id: str
    user_id: Optional[str]
    name: str
    email: str
    branch: Optional[str]
    cgpa: Optional[float]
    graduation_year: Optional[int]
    backlogs: Optional[int]
    skills: list[str] = field(default_factory=list)
    projects: list[dict[str, Any]] = field(default_factory=list)
    experience: list[dict[str, Any]] = field(default_factory=list)
    resume_path: Optional[str] = None


@dataclass
class JobRecord:
    id: str
    title: str
    company: str
    description: str
    required_skills: list[str]
    eligible_branches: list[str]
    min_cgpa: Optional[float]
    graduation_year: Optional[int]
    max_backlogs: Optional[int]
    deadline: Optional[datetime]
    status: str
    recruiter_id: Optional[str]


@dataclass
class ApplicationRecord:
    id: str
    job_id: str
    student_id: str
    status: str
    applied_at: Optional[datetime]
