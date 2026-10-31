"""'Improve my resume' – rewrites EXISTING resume content; never fabricates experience."""
from __future__ import annotations

import json
import logging
from typing import Optional

from app.db.records import StudentRecord
from app.schemas import BuildResumeResult, ExperienceItem, ImprovedResume, ProjectItem, ResumeAnalysis
from app.services.gemini_client import GeminiClient, LLMUnavailable
from app.services.llm_schemas import LLMImprovedResume
from app.utils.text import dedupe

log = logging.getLogger(__name__)

SYSTEM = (
    "You improve student resumes. Rewrite the provided resume data to be clearer and more ATS-friendly. "
    "STRICT RULES: use only facts present in the input; never invent employers, roles, dates, metrics, skills or projects; "
    "do not add numbers that are not in the input. Start descriptions with strong action verbs, keep each to 1-2 sentences. "
    "summary: 2 sentences. skills: deduplicated, ordered by relevance. "
    "suggestions: 3-6 things the student should add or fix themselves (e.g. 'add measurable results to Project X')."
)


class ResumeBuilderService:
    def __init__(self, gemini: GeminiClient):
        self.gemini = gemini

    @staticmethod
    def _merge_source(student: StudentRecord, analysis: Optional[ResumeAnalysis]) -> dict:
        profile_projects = [
            {"title": p.get("title", ""), "description": p.get("description", ""), "tech_stack": p.get("tech_stack", [])}
            for p in student.projects
        ]
        a = analysis or ResumeAnalysis()
        return {
            "name": student.name,
            "branch": student.branch,
            "cgpa": student.cgpa,
            "graduation_year": student.graduation_year,
            "summary": a.summary,
            "skills": dedupe(student.skills + a.skills),
            "experience": [e.model_dump() for e in a.experience] or student.experience,
            "projects": [p.model_dump() for p in a.projects] or profile_projects,
        }

    def build(self, student: StudentRecord, analysis: Optional[ResumeAnalysis]) -> BuildResumeResult:
        src = self._merge_source(student, analysis)
        if self.gemini.enabled:
            try:
                out = self.gemini.generate_json(
                    system=SYSTEM,
                    prompt="Resume data (JSON):\n" + json.dumps(src, ensure_ascii=False),
                    schema=LLMImprovedResume,
                    temperature=0.3,
                )
                return BuildResumeResult(
                    improved_resume=ImprovedResume(
                        summary=out.summary.strip(),
                        skills=dedupe([s.strip() for s in out.skills if s.strip()])[:40],
                        experience=[ExperienceItem(**e.model_dump()) for e in out.experience],
                        projects=[ProjectItem(**p.model_dump()) for p in out.projects],
                        suggestions=[s.strip() for s in out.suggestions if s.strip()][:8],
                    )
                )
            except LLMUnavailable:
                log.info("Gemini unavailable for build-resume; returning structured fallback")

        suggestions = ["Add a 2-line professional summary at the top"]
        if not src["experience"]:
            suggestions.append("Add internships or practical experience, even short ones or open-source contributions")
        if any(not p.get("description") for p in src["projects"]):
            suggestions.append("Give every project a one-line description of what it does and your contribution")
        suggestions.append("Quantify results (users, speed, accuracy) wherever you can")
        return BuildResumeResult(
            improved_resume=ImprovedResume(
                summary=src["summary"] or "",
                skills=src["skills"],
                experience=[ExperienceItem(**{k: str(v or "") for k, v in e.items() if k in ExperienceItem.model_fields}) for e in src["experience"]],
                projects=[ProjectItem(title=p.get("title", ""), description=p.get("description", ""), tech_stack=p.get("tech_stack", [])) for p in src["projects"]],
                suggestions=suggestions,
            )
        )
