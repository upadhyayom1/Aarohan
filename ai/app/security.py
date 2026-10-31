"""Authentication & authorisation.

Two ways to call this service:
 1. `Authorization: Bearer <JWT>` – the SAME token the Node backend issues. We verify it
    with the shared JWT_SECRET (no database lookup, no duplicated login logic).
 2. `X-Internal-Api-Key: <INTERNAL_API_KEY>` – trusted server-to-server calls from Node.
"""
from __future__ import annotations

import logging
import secrets
from dataclasses import dataclass
from typing import Optional

import jwt
from fastapi import Header

from app.config import get_settings
from app.db.records import JobRecord, StudentRecord
from app.db.repository import Repository
from app.errors import AppError

log = logging.getLogger(__name__)

_ROLE_ALIASES = {
    "student": "student",
    "recruiter": "recruiter",
    "admin": "admin",
    "placementadmin": "admin",
    "placement_admin": "admin",
    "tpo": "admin",
    "superadmin": "admin",
}


@dataclass
class Principal:
    user_id: Optional[str]
    role: str  # student | recruiter | admin | internal
    internal: bool = False


def get_principal(
    authorization: Optional[str] = Header(default=None),
    x_internal_api_key: Optional[str] = Header(default=None),
) -> Principal:
    s = get_settings()

    if s.auth_disabled:
        if s.is_production:
            raise AppError(500, "MISCONFIGURED", "AUTH_DISABLED must not be used in production")
        return Principal(user_id=None, role="admin", internal=True)

    if x_internal_api_key:
        if s.internal_api_key and secrets.compare_digest(x_internal_api_key, s.internal_api_key):
            return Principal(user_id=None, role="internal", internal=True)
        raise AppError(401, "UNAUTHORIZED", "Invalid internal API key")

    if not authorization or not authorization.lower().startswith("bearer "):
        raise AppError(401, "UNAUTHORIZED", "Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    if not s.jwt_secret:
        log.error("JWT_SECRET is not configured; cannot verify tokens")
        raise AppError(401, "UNAUTHORIZED", "Token verification is not configured")
    try:
        claims = jwt.decode(
            token,
            s.jwt_secret,
            algorithms=[s.jwt_algorithm],
            options={"verify_aud": False},
        )
    except jwt.ExpiredSignatureError as exc:
        raise AppError(401, "UNAUTHORIZED", "Token expired") from exc
    except jwt.PyJWTError as exc:
        raise AppError(401, "UNAUTHORIZED", "Invalid token") from exc

    user_id = next((str(claims[c]) for c in s.jwt_user_id_claim_list if claims.get(c) is not None), None)
    raw_role = str(claims.get(s.jwt_role_claim, "")).strip().lower().replace(" ", "")
    role = _ROLE_ALIASES.get(raw_role)
    if not user_id or not role:
        raise AppError(401, "UNAUTHORIZED", "Token is missing user id or a recognised role")
    return Principal(user_id=user_id, role=role)


# ───────────────────────────── authorisation helpers ─────────────────────────────
def require_roles(principal: Principal, *roles: str) -> None:
    if principal.internal or principal.role in roles:
        return
    raise AppError(403, "FORBIDDEN", "You do not have access to this resource")


def _privileged(principal: Principal) -> bool:
    return principal.internal or principal.role == "admin"


def authorize_student_access(
    repo: Repository, principal: Principal, student: StudentRecord, job_id: Optional[str] = None
) -> None:
    """Students: only themselves. Recruiters: only applicants of their own jobs."""
    if _privileged(principal):
        return
    if principal.role == "student":
        if principal.user_id and principal.user_id in {student.user_id, student.id}:
            return
    elif principal.role == "recruiter":
        if repo.recruiter_has_applicant(principal.user_id, student.id, job_id):
            return
    raise AppError(403, "FORBIDDEN", "You do not have access to this student's data")


def authorize_job_access(principal: Principal, job: JobRecord) -> None:
    """Recruiters may only work with jobs they own."""
    if _privileged(principal) or principal.role == "student":
        return
    if principal.role == "recruiter" and principal.user_id and job.recruiter_id == principal.user_id:
        return
    raise AppError(403, "FORBIDDEN", "You do not own this job")
