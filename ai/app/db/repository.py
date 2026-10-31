"""Read-only data access for the AI service. Only SELECT statements live here."""
from __future__ import annotations

import logging
from collections import Counter
from typing import Any, Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import Settings
from app.db import normalize as n
from app.db.mapping import EntityMap
from app.db.records import ApplicationRecord, JobRecord, StudentRecord
from app.db.session import Tables
from app.errors import AppError

log = logging.getLogger(__name__)


class Repository:
    def __init__(self, session: Session, tables: Tables, settings: Settings):
        self.session = session
        over = settings.column_overrides
        self.students = EntityMap(tables.student, "student", over)
        self.jobs = EntityMap(tables.job, "job", over)
        self.applications = EntityMap(tables.application, "application", over)
        self.users = EntityMap(tables.user, "user", over) if tables.user is not None else None

        for ent, required in (
            (self.students, ("id",)),
            (self.jobs, ("id", "required_skills")),
            (self.applications, ("job_id", "student_id")),
        ):
            missing = [f for f in required if not ent.has(f)]
            if missing:
                raise AppError(
                    503,
                    "SCHEMA_MISMATCH",
                    f"Table '{ent.table.name}' has no column for: {', '.join(missing)}",
                    {"mapped": ent.describe(), "hint": "Use COLUMN_OVERRIDES_JSON to map custom column names"},
                )

    # ------------------------------------------------------------------ low level
    @staticmethod
    def _val(ent: EntityMap, row: Any, logical: str) -> Any:
        col = ent.col(logical)
        return row._mapping[col] if col is not None else None

    def _fetch(self, ent: EntityMap, logical: str, value: Any, limit: Optional[int] = None) -> list[Any]:
        col = ent.col(logical)
        if col is None:
            return []
        v = n.coerce_for_column(col, value)
        if v is n.INVALID:
            return []
        stmt = select(*ent.selected_columns()).where(col == v)
        if limit:
            stmt = stmt.limit(limit)
        return list(self.session.execute(stmt).all())

    def _fetch_in(self, ent: EntityMap, logical: str, values: Sequence[Any]) -> list[Any]:
        col = ent.col(logical)
        if col is None or not values:
            return []
        coerced = [n.coerce_for_column(col, v) for v in values]
        coerced = [v for v in coerced if v is not n.INVALID]
        if not coerced:
            return []
        return list(self.session.execute(select(*ent.selected_columns()).where(col.in_(coerced))).all())

    # ------------------------------------------------------------------ builders
    def _user_basics(self, user_id: Optional[str]) -> tuple[Optional[str], Optional[str]]:
        if not user_id or self.users is None:
            return None, None
        rows = self._fetch(self.users, "id", user_id, limit=1)
        if not rows:
            return None, None
        return n.to_str(self._val(self.users, rows[0], "name")), n.to_str(self._val(self.users, rows[0], "email"))

    def _to_student(self, row: Any) -> StudentRecord:
        e = self.students
        user_id = n.to_str(self._val(e, row, "user_id"))
        name = n.to_str(self._val(e, row, "name"))
        email = n.to_str(self._val(e, row, "email"))
        if (not name or not email) and user_id:
            u_name, u_email = self._user_basics(user_id)
            name, email = name or u_name, email or u_email
        return StudentRecord(
            id=str(self._val(e, row, "id")),
            user_id=user_id,
            name=name or "",
            email=email or "",
            branch=n.to_str(self._val(e, row, "branch")),
            cgpa=n.to_float(self._val(e, row, "cgpa")),
            graduation_year=n.to_int(self._val(e, row, "graduation_year")),
            backlogs=n.to_int(self._val(e, row, "backlogs")),
            skills=n.to_str_list(self._val(e, row, "skills")),
            projects=n.to_projects(self._val(e, row, "projects")),
            experience=n.to_experience(self._val(e, row, "experience")),
            resume_path=n.to_str(self._val(e, row, "resume_path")) or None,
        )

    def _to_job(self, row: Any) -> JobRecord:
        e = self.jobs
        return JobRecord(
            id=str(self._val(e, row, "id")),
            title=n.to_str(self._val(e, row, "title")) or "",
            company=n.to_str(self._val(e, row, "company")) or "",
            description=n.to_str(self._val(e, row, "description")) or "",
            required_skills=n.to_str_list(self._val(e, row, "required_skills")),
            eligible_branches=n.to_str_list(self._val(e, row, "eligible_branches")),
            min_cgpa=n.to_float(self._val(e, row, "min_cgpa")),
            graduation_year=n.to_int(self._val(e, row, "graduation_year")),
            max_backlogs=n.to_int(self._val(e, row, "max_backlogs")),
            deadline=n.to_datetime(self._val(e, row, "deadline")),
            status=n.to_job_status(self._val(e, row, "status")),
            recruiter_id=n.to_str(self._val(e, row, "recruiter_id")),
        )

    def _to_application(self, row: Any) -> ApplicationRecord:
        e = self.applications
        return ApplicationRecord(
            id=str(self._val(e, row, "id")) if e.has("id") else "",
            job_id=str(self._val(e, row, "job_id")),
            student_id=str(self._val(e, row, "student_id")),
            status=(n.to_str(self._val(e, row, "status")) or "applied").lower(),
            applied_at=n.to_datetime(self._val(e, row, "applied_at")),
        )

    # ------------------------------------------------------------------ queries
    def get_student(self, ident: str) -> Optional[StudentRecord]:
        """Look up by student id first, then by the owning user id."""
        for logical in ("id", "user_id"):
            rows = self._fetch(self.students, logical, ident, limit=1)
            if rows:
                return self._to_student(rows[0])
        return None

    def get_job(self, job_id: str) -> Optional[JobRecord]:
        rows = self._fetch(self.jobs, "id", job_id, limit=1)
        return self._to_job(rows[0]) if rows else None

    def get_application(self, student_id: str, job_id: str) -> Optional[ApplicationRecord]:
        rows = self._fetch(self.applications, "student_id", student_id)
        for row in rows:
            app = self._to_application(row)
            if app.job_id.lower() == str(job_id).lower():
                return app
        return None

    def applicants_for_job(self, job_id: str, limit: int = 500) -> list[tuple[ApplicationRecord, StudentRecord]]:
        app_rows = self._fetch(self.applications, "job_id", job_id)[:limit]
        apps = [self._to_application(r) for r in app_rows]
        students = {s.id: s for s in (self._to_student(r) for r in self._fetch_in(self.students, "id", [a.student_id for a in apps]))}
        return [(a, students[a.student_id]) for a in apps if a.student_id in students]

    def recruiter_has_applicant(self, recruiter_user_id: Optional[str], student_id: str, job_id: Optional[str] = None) -> bool:
        """True if `student_id` applied to a job owned by this recruiter (optionally a specific job)."""
        if not recruiter_user_id:
            return False
        owned = {
            str(self._val(self.jobs, r, "id")).lower()
            for r in self._fetch(self.jobs, "recruiter_id", recruiter_user_id)
        }
        if job_id is not None:
            if str(job_id).lower() not in owned:
                return False
            owned = {str(job_id).lower()}
        for row in self._fetch(self.applications, "student_id", student_id):
            if str(self._val(self.applications, row, "job_id")).lower() in owned:
                return True
        return False

    def list_jobs(self, open_only: bool = True, limit: int = 500) -> list[JobRecord]:
        rows = self.session.execute(select(*self.jobs.selected_columns()).limit(limit)).all()
        jobs = [self._to_job(r) for r in rows]
        return [j for j in jobs if j.status == "open"] if open_only else jobs

    def list_student_skills(self, limit: int = 5000) -> list[list[str]]:
        col = self.students.col("skills")
        if col is None:
            return []
        rows = self.session.execute(select(col).limit(limit)).all()
        return [n.to_str_list(r[0]) for r in rows]

    def skill_demand(self, open_only: bool = True) -> Counter[str]:
        counter: Counter[str] = Counter()
        for job in self.list_jobs(open_only=open_only):
            for s in {x.strip() for x in job.required_skills if x.strip()}:
                counter[s] += 1
        return counter
