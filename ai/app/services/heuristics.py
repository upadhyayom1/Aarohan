"""Offline (no-LLM) resume parsing. Used when Gemini is unavailable and to
*augment* LLM output with skills literally present in the text (never invented)."""
from __future__ import annotations

import re
from typing import Optional

from app.schemas import EducationItem, ResumeAnalysis
from app.utils.skills import SKILL_VOCAB, mentions
from app.utils.text import dedupe

SECTION_PATTERNS: dict[str, re.Pattern[str]] = {
    "summary": re.compile(r"^(professional\s+|career\s+)?(summary|objective|profile|about\s*me)\b", re.I),
    "skills": re.compile(r"^(technical\s+|key\s+|core\s+)?(skills|technologies|tech\s*stack)\b", re.I),
    "education": re.compile(r"^(education|academic(s| background| qualifications)?)\b", re.I),
    "experience": re.compile(r"^(work\s+|professional\s+)?(experience|employment|internships?)\b", re.I),
    "projects": re.compile(r"^(personal\s+|academic\s+)?projects?\b", re.I),
    "certifications": re.compile(r"^(certifications?|courses|achievements|awards)\b", re.I),
}

_CGPA_RE = re.compile(r"(?:cgpa|gpa)\s*[:\-]?\s*([0-9](?:\.[0-9]{1,2})?)\s*(?:/\s*10)?", re.I)
_YEAR_RE = re.compile(r"\b(20[0-4][0-9])\b")
_EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE_RE = re.compile(r"(?:\+?\d{1,3}[\s-]?)?(?:\d[\s-]?){9,12}\d")
_LINK_RE = re.compile(r"(linkedin\.com|github\.com|gitlab\.com|portfolio)", re.I)


def find_sections(text: str) -> dict[str, str]:
    """Split resume text into sections keyed by the heading type found."""
    sections: dict[str, list[str]] = {}
    current: Optional[str] = None
    for line in text.splitlines():
        stripped = line.strip().rstrip(":").strip()
        if 0 < len(stripped) <= 40:
            for name, rx in SECTION_PATTERNS.items():
                if rx.match(stripped):
                    current = name
                    sections.setdefault(name, [])
                    break
            else:
                if current:
                    sections[current].append(line)
            continue
        if current:
            sections[current].append(line)
    return {k: "\n".join(v).strip() for k, v in sections.items()}


def extract_skills_from_text(text: str) -> list[str]:
    return [s for s in SKILL_VOCAB if mentions(s, text)]


def contact_signals(text: str) -> dict[str, bool]:
    return {
        "email": bool(_EMAIL_RE.search(text)),
        "phone": bool(_PHONE_RE.search(text)),
        "links": bool(_LINK_RE.search(text)),
    }


def heuristic_analysis(text: str) -> ResumeAnalysis:
    sections = find_sections(text)
    skills = extract_skills_from_text(text)

    education: list[EducationItem] = []
    edu_text = sections.get("education", "")
    if edu_text:
        cgpa_m = _CGPA_RE.search(edu_text)
        years = _YEAR_RE.findall(edu_text)
        first_line = next((l.strip() for l in edu_text.splitlines() if l.strip()), "")
        education.append(
            EducationItem(
                degree=first_line[:120],
                graduation_year=int(max(years)) if years else None,
                cgpa=float(cgpa_m.group(1)) if cgpa_m else None,
            )
        )

    summary = sections.get("summary", "")
    summary = " ".join(summary.split())[:300]
    return ResumeAnalysis(skills=dedupe(skills), education=education, experience=[], projects=[], summary=summary)
