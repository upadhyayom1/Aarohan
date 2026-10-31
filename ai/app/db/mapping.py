"""Maps our logical field names to the real (Prisma camelCase) column names.

Matching ignores case, underscores and punctuation, so `graduationYear`,
`graduation_year` and `GraduationYear` are all the same candidate. If your column has
an unusual name, add it via COLUMN_OVERRIDES_JSON – no code change needed."""
from __future__ import annotations

import re
from typing import Any, Optional

from sqlalchemy import Column, Table

STUDENT_FIELDS: dict[str, list[str]] = {
    "id": ["id", "studentId"],
    "user_id": ["userId", "user"],
    "name": ["name", "fullName", "studentName"],
    "email": ["email", "emailAddress"],
    "branch": ["branch", "department", "stream"],
    "cgpa": ["cgpa", "gpa", "cgpaScore"],
    "graduation_year": ["graduationYear", "gradYear", "passingYear", "passoutYear", "batchYear", "batch", "yearOfGraduation"],
    "backlogs": ["backlogs", "activeBacklogs", "backlogCount", "numBacklogs"],
    "skills": ["skills", "skillSet", "technicalSkills"],
    "projects": ["projects", "projectDetails"],
    "experience": ["experience", "experiences", "workExperience", "internships"],
    "resume_path": ["resumePath", "resumeUrl", "resumeFilePath", "resumeFile", "resumeFileName", "resumeLink", "resume"],
}

JOB_FIELDS: dict[str, list[str]] = {
    "id": ["id", "jobId"],
    "title": ["title", "jobTitle", "role", "position"],
    "company": ["company", "companyName", "organization"],
    "description": ["description", "jobDescription", "details"],
    "required_skills": ["requiredSkills", "skillsRequired", "skills", "techStack"],
    "eligible_branches": ["eligibleBranches", "allowedBranches", "branchesAllowed", "branches"],
    "min_cgpa": ["minCgpa", "minimumCgpa", "cgpaCutoff", "cgpaRequired", "minGpa", "cgpa"],
    "graduation_year": ["graduationYear", "gradYear", "eligibleBatch", "passingYear", "batch"],
    "max_backlogs": ["maxBacklogs", "backlogsAllowed", "maxActiveBacklogs", "backlogs"],
    "deadline": ["deadline", "applicationDeadline", "lastDate"],
    "status": ["status", "isOpen", "isActive", "open"],
    "recruiter_id": ["recruiterId", "postedBy", "createdBy", "userId", "recruiter"],
}

APPLICATION_FIELDS: dict[str, list[str]] = {
    "id": ["id", "applicationId"],
    "job_id": ["jobId", "job"],
    "student_id": ["studentId", "student"],
    "status": ["status", "applicationStatus"],
    "applied_at": ["appliedAt", "createdAt"],
}

USER_FIELDS: dict[str, list[str]] = {
    "id": ["id", "userId"],
    "name": ["name", "fullName"],
    "email": ["email"],
    "role": ["role", "userRole"],
}

DEFAULT_FIELDS = {
    "student": STUDENT_FIELDS,
    "job": JOB_FIELDS,
    "application": APPLICATION_FIELDS,
    "user": USER_FIELDS,
}


def _norm(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", name.lower())


class EntityMap:
    """Resolved logical-field -> Column mapping for one table."""

    def __init__(self, table: Table, entity: str, overrides: Optional[dict[str, dict[str, list[str]]]] = None):
        self.table = table
        self.entity = entity
        by_norm = {_norm(c.name): c for c in table.columns}
        user_over = (overrides or {}).get(entity, {})
        self._cols: dict[str, Column[Any]] = {}
        for logical, candidates in DEFAULT_FIELDS[entity].items():
            for cand in [*user_over.get(logical, []), *candidates]:
                col = by_norm.get(_norm(cand))
                if col is not None:
                    self._cols[logical] = col
                    break

    def col(self, logical: str) -> Optional[Column[Any]]:
        return self._cols.get(logical)

    def has(self, logical: str) -> bool:
        return logical in self._cols

    def selected_columns(self) -> list[Column[Any]]:
        seen: list[Column[Any]] = []
        for c in self._cols.values():
            if c not in seen:
                seen.append(c)
        return seen

    def describe(self) -> dict[str, Optional[str]]:
        return {k: (self._cols[k].name if k in self._cols else None) for k in DEFAULT_FIELDS[self.entity]}
