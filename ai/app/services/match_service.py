"""Explainable resume-to-job matching.

score = 100 * ( w_skills * skill_coverage      # required skills found (exact / alias / semantic)
              + w_context * context_similarity # resume text vs job description (embeddings)
              + w_evidence * evidence_ratio )  # matched skills actually shown in projects/experience

The score is fully deterministic. Gemini only *writes the explanation* from the computed
facts, so the explanation can never contradict the score."""
from __future__ import annotations

import hashlib
import json
import logging
from dataclasses import dataclass
from typing import Optional

from app.config import Settings
from app.db.records import JobRecord, StudentRecord
from app.schemas import MatchResult
from app.services.eligibility import check_eligibility
from app.services.embeddings import Embedder
from app.services.gemini_client import GeminiClient, LLMUnavailable
from app.services.resume_service import ResumeContext
from app.services.skill_matcher import SkillMatcher, SkillMatchSummary
from app.utils.cache import JsonCache
from app.utils.skills import keyword_hit
from app.utils.text import clamp, dedupe, truncate

log = logging.getLogger(__name__)

EXPLAIN_SYSTEM = (
    "You write short, factual explanations of resume-to-job match scores inside a college placement platform. "
    "Use ONLY the facts in the JSON provided. Never invent skills, experience or numbers. "
    "Refer to the person as 'the candidate'. Write 2-3 sentences (max 60 words), plain text, no markdown. "
    "If eligible is false, state the eligibility reasons plainly."
)


@dataclass
class MatchBreakdown:
    skill_score: float
    context_score: float
    evidence_score: float
    summary: SkillMatchSummary
    has_resume: bool


def _join(items: list[str], limit: int = 6) -> str:
    items = items[:limit]
    return ", ".join(items)


class MatchService:
    def __init__(self, settings: Settings, gemini: GeminiClient, embedder: Embedder, cache: JsonCache):
        self.settings = settings
        self.gemini = gemini
        self.embedder = embedder
        self.matcher = SkillMatcher(embedder)
        self.cache = cache

    # ------------------------------------------------------------------ inputs
    @staticmethod
    def build_pool(student: StudentRecord, ctx: Optional[ResumeContext]) -> list[str]:
        pool = list(student.skills)
        for p in student.projects:
            pool += p.get("tech_stack", [])
        if ctx:
            pool += ctx.analysis.skills
            for p in ctx.analysis.projects:
                pool += p.tech_stack
        return dedupe([s for s in pool if s and s.strip()])

    @staticmethod
    def evidence_text(student: StudentRecord, ctx: Optional[ResumeContext]) -> str:
        parts: list[str] = []
        for p in student.projects:
            parts += [p.get("title", ""), p.get("description", ""), " ".join(p.get("tech_stack", []))]
        for e in student.experience:
            parts += [e.get("role", ""), e.get("description", "")]
        if ctx:
            for p in ctx.analysis.projects:
                parts += [p.title, p.description, " ".join(p.tech_stack)]
            for e in ctx.analysis.experience:
                parts += [e.role, e.description]
        return "\n".join(x for x in parts if x)

    @staticmethod
    def context_document(student: StudentRecord, ctx: Optional[ResumeContext]) -> str:
        if ctx:
            return truncate(ctx.pdf.text, 9000)
        parts = [", ".join(student.skills)]
        for p in student.projects:
            parts.append(f"{p.get('title','')}. {p.get('description','')} {' '.join(p.get('tech_stack', []))}")
        for e in student.experience:
            parts.append(f"{e.get('role','')} {e.get('company','')}. {e.get('description','')}")
        return "\n".join(x for x in parts if x.strip())

    @staticmethod
    def job_query(job: JobRecord) -> str:
        return truncate(f"{job.title}. {job.description}. Required skills: {', '.join(job.required_skills)}", 2500)

    # ------------------------------------------------------------------ scoring
    def breakdown(self, student: StudentRecord, job: JobRecord, ctx: Optional[ResumeContext], use_semantic: bool = True) -> MatchBreakdown:
        resume_text = ctx.pdf.text if ctx else ""
        summary = self.matcher.match(
            job.required_skills,
            self.build_pool(student, ctx),
            resume_text=resume_text,
            evidence_text=self.evidence_text(student, ctx),
            use_semantic=use_semantic,
        )
        doc = self.context_document(student, ctx)
        raw = self.embedder.document_similarity(doc, self.job_query(job)) if doc.strip() else 0.0
        span = max(self.embedder.context_high - self.embedder.context_low, 1e-6)
        context = clamp((raw - self.embedder.context_low) / span)

        if job.required_skills:
            skill, evidence = summary.skill_score, summary.evidence_score
        else:  # nothing to match against: rely on description similarity only
            skill, evidence = context, context
        return MatchBreakdown(skill, context, evidence, summary, has_resume=ctx is not None)

    def final_score(self, b: MatchBreakdown) -> int:
        ws, wc, we = self.settings.weight_skills, self.settings.weight_context, self.settings.weight_evidence
        total = (ws + wc + we) or 1.0
        score = (ws * b.skill_score + wc * b.context_score + we * b.evidence_score) / total
        return int(round(clamp(score) * 100))

    def compute(
        self,
        student: StudentRecord,
        job: JobRecord,
        ctx: Optional[ResumeContext],
        with_explanation: bool = True,
    ) -> tuple[MatchResult, MatchBreakdown]:
        b = self.breakdown(student, job, ctx)
        eligible, reasons = check_eligibility(student, job)
        score = self.final_score(b)
        facts = {
            "job": f"{job.title} at {job.company}".strip(),
            "match_score": score,
            "required_skill_count": len(b.summary.details),
            "matched_skills": b.summary.matched,
            "missing_skills": b.summary.missing,
            "related_but_not_equivalent": [f"{d.required} (candidate has {d.matched_with})" for d in b.summary.related],
            "matched_via_equivalent_wording": [
                f"{d.required} ~ {d.matched_with}" for d in b.summary.details if d.status == "semantic"
            ],
            "skills_shown_in_projects_or_experience": [d.required for d in b.summary.details if d.evidenced],
            "resume_content_relevance_to_job": "high" if b.context_score >= 0.66 else "moderate" if b.context_score >= 0.33 else "low",
            "resume_available": b.has_resume,
            "eligible": eligible,
            "eligibility_reasons": reasons,
        }
        explanation = self._explain(facts) if with_explanation else self._template(facts)
        result = MatchResult(
            match_score=score,
            matched_skills=b.summary.matched,
            missing_skills=b.summary.missing,
            explanation=explanation,
            eligible=eligible,
            eligibility_reasons=reasons,
        )
        return result, b

    # ------------------------------------------------------------------ explanation
    @staticmethod
    def _template(f: dict) -> str:
        n_req, matched, missing = f["required_skill_count"], f["matched_skills"], f["missing_skills"]
        if n_req == 0:
            text = f"No specific skills were required, so the score reflects how relevant the candidate's profile is to this role ({f['resume_content_relevance_to_job']} relevance)."
        else:
            text = f"The candidate matches {len(matched)} of {n_req} required skills"
            text += f" ({_join(matched)})." if matched else "."
            if f["matched_via_equivalent_wording"]:
                text += f" Some were matched by equivalent wording ({_join(f['matched_via_equivalent_wording'], 3)})."
            if missing:
                text += f" Missing: {_join(missing)}."
            if f["related_but_not_equivalent"]:
                text += f" Related experience: {_join(f['related_but_not_equivalent'], 3)}."
        if not f["resume_available"]:
            text += " No readable resume was available, so the score is based on the profile only."
        if not f["eligible"]:
            text += " The candidate does not meet the eligibility criteria: " + "; ".join(f["eligibility_reasons"]) + "."
        return text

    def _explain(self, facts: dict) -> str:
        fallback = self._template(facts)
        if not self.gemini.enabled:
            return fallback
        key = f"explain-v1:{self.gemini.model}:" + hashlib.sha256(json.dumps(facts, sort_keys=True).encode()).hexdigest()
        cached = self.cache.get(key)
        if isinstance(cached, str) and cached:
            return cached
        try:
            text = self.gemini.generate_text(
                system=EXPLAIN_SYSTEM,
                prompt="Facts (JSON):\n" + json.dumps(facts, ensure_ascii=False),
                temperature=0.2,
            )
        except LLMUnavailable:
            return fallback
        text = " ".join(text.split())[:700]
        # Guard: if the model dropped mandatory eligibility info, append it deterministically.
        if not facts["eligible"] and not any(r.split()[0].lower() in text.lower() for r in facts["eligibility_reasons"][:1]):
            text += " Eligibility: " + "; ".join(facts["eligibility_reasons"]) + "."
        self.cache.set(key, text)
        return text

    # ------------------------------------------------------------------ keyword vs semantic
    def compare(self, student: StudentRecord, job: JobRecord, ctx: Optional[ResumeContext]) -> dict:
        """Naive keyword matching vs. our semantic matching on the same inputs."""
        text = "\n".join([", ".join(self.build_pool(student, ctx)), ctx.pdf.text if ctx else ""])
        required = [r for r in dict.fromkeys(job.required_skills) if r.strip()]
        keyword_hits = {r: keyword_hit(r, text) for r in required}
        sem = self.breakdown(student, job, ctx).summary
        by_req = {d.required: d for d in sem.details}
        per_skill = [
            {
                "required_skill": r,
                "keyword_match": keyword_hits[r],
                "semantic_status": by_req[r].status,
                "matched_with": by_req[r].matched_with,
                "similarity": by_req[r].similarity,
            }
            for r in required
        ]
        kw_matched = [r for r in required if keyword_hits[r]]
        sem_matched = sem.matched
        n = len(required) or 1
        return {
            "keyword_matched": kw_matched,
            "semantic_matched": sem_matched,
            "found_only_by_semantic": [r for r in sem_matched if r not in kw_matched],
            "keyword_score": int(round(100 * len(kw_matched) / n)),
            "semantic_score": int(round(100 * sem.skill_score)),
            "per_skill": per_skill,
        }
