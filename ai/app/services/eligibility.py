"""Deterministic eligibility engine — branch, CGPA, graduation year, backlogs.
Pure functions, no LLM: eligibility must never be 'guessed'."""
from __future__ import annotations

import re

from app.db.records import JobRecord, StudentRecord

BRANCH_ENUM = ["CSE", "IT", "ECE", "EE", "ME", "CE", "CH", "MCA", "MBA", "PHD_CS", "OTHER"]

_BRANCH_ALIASES: dict[str, str] = {
    "cse": "CSE", "cs": "CSE", "computerscience": "CSE", "computerscienceandengineering": "CSE",
    "computerscienceengineering": "CSE", "computerengineering": "CSE",
    "it": "IT", "informationtechnology": "IT",
    "ece": "ECE", "electronicsandcommunicationengineering": "ECE", "electronicsandcommunication": "ECE",
    "electronicscommunicationengineering": "ECE",
    "ee": "EE", "eee": "EE", "electricalengineering": "EE", "electricalandelectronicsengineering": "EE",
    "me": "ME", "mechanicalengineering": "ME", "mechanical": "ME",
    "ce": "CE", "civilengineering": "CE", "civil": "CE",
    "ch": "CH", "chemicalengineering": "CH", "chemical": "CH",
    "mca": "MCA", "mastersofcomputerapplications": "MCA", "mastersofcomputerapplication": "MCA",
    "mba": "MBA", "mastersofbusinessadministration": "MBA",
    "phdcs": "PHD_CS", "phdcse": "PHD_CS", "phdcomputerscience": "PHD_CS",
    "other": "OTHER",
}


def normalize_branch(value: str | None) -> str | None:
    if not value:
        return None
    key = re.sub(r"[^a-z]", "", value.lower())
    return _BRANCH_ALIASES.get(key, value.strip().upper())


def check_eligibility(student: StudentRecord, job: JobRecord) -> tuple[bool, list[str]]:
    """Return (eligible, reasons). `reasons` lists every failed mandatory rule."""
    reasons: list[str] = []

    # Branch
    allowed = [normalize_branch(b) for b in job.eligible_branches if b and b.strip()]
    allowed = [b for b in allowed if b]
    if allowed:
        branch = normalize_branch(student.branch)
        if not branch:
            reasons.append("Your branch is missing from the profile")
        elif branch not in allowed:
            reasons.append(f"Branch {branch} is not in the eligible list ({', '.join(allowed)})")

    # CGPA
    if job.min_cgpa is not None:
        if student.cgpa is None:
            reasons.append("CGPA is missing from the profile")
        elif student.cgpa + 1e-9 < job.min_cgpa:
            reasons.append(f"CGPA {student.cgpa:g} is below the required minimum of {job.min_cgpa:g}")

    # Graduation year
    if job.graduation_year is not None:
        if student.graduation_year is None:
            reasons.append("Graduation year is missing from the profile")
        elif student.graduation_year != job.graduation_year:
            reasons.append(
                f"Graduation year {student.graduation_year} does not match the required batch {job.graduation_year}"
            )

    # Backlogs
    if job.max_backlogs is not None:
        if student.backlogs is None:
            reasons.append("Backlog count is missing from the profile")
        elif student.backlogs > job.max_backlogs:
            reasons.append(f"Backlogs ({student.backlogs}) exceed the maximum allowed ({job.max_backlogs})")

    return (not reasons), reasons
