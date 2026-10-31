"""ATS (applicant-tracking-system) compatibility analysis.

The 0-100 score is computed deterministically from transparent checks; Gemini only
phrases the improvement advice from those findings."""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from typing import Optional

from app.config import Settings
from app.db.records import JobRecord
from app.schemas import AtsResult
from app.services.gemini_client import GeminiClient, LLMUnavailable
from app.services.heuristics import contact_signals, extract_skills_from_text, find_sections
from app.services.llm_schemas import LLMAtsAdvice
from app.services.pdf_extractor import ExtractedPdf
from app.utils.skills import mentions
from app.utils.text import clamp, dedupe

log = logging.getLogger(__name__)

SYSTEM = (
    "You are an ATS resume advisor for college students. Using ONLY the findings in the JSON, write practical advice. "
    "improvement_suggestions: 3-6 short, specific, actionable items (no generic filler, do not invent facts about the student). "
    "overall_feedback: 2 sentences. Plain text, no markdown."
)

_BULLET = re.compile(r"^\s*[•\-\*–·▪●◦]\s+")
_HAS_NUMBER = re.compile(r"\d+\s*(%|x|\+|k\b|users|ms|s\b)?|\b(one|two|three|ten|hundred)\b", re.I)


@dataclass
class AtsFindings:
    score: int
    breakdown: dict[str, str] = field(default_factory=dict)
    missing_keywords: list[str] = field(default_factory=list)
    gaps: list[str] = field(default_factory=list)       # things to fix
    formatting: list[str] = field(default_factory=list)  # deterministic formatting feedback


class AtsService:
    def __init__(self, settings: Settings, gemini: GeminiClient):
        self.settings = settings
        self.gemini = gemini

    # ------------------------------------------------------------------ deterministic checks
    def evaluate(self, pdf: ExtractedPdf, job: Optional[JobRecord], demand_keywords: list[str]) -> AtsFindings:
        text = pdf.text
        sections = find_sections(text)
        points = 0.0
        notes: dict[str, str] = {}
        gaps: list[str] = []
        fmt: list[str] = []

        # 1) sections (25)
        sec_points = 0
        for name, pts in (("skills", 8), ("education", 7), ("experience", 5), ("projects", 5)):
            if name in sections and sections[name].strip():
                sec_points += pts
            else:
                gaps.append(f"No clear '{name.title()}' section heading was detected")
        # experience OR projects is enough to be credited partially
        if "experience" not in sections and "projects" in sections:
            sec_points += 2
        points += sec_points
        notes["sections"] = f"{sec_points}/25"

        # 2) contact (10)
        c = contact_signals(text)
        cp = (4 if c["email"] else 0) + (3 if c["phone"] else 0) + (3 if c["links"] else 0)
        if not c["email"]:
            gaps.append("No email address detected in the text")
        if not c["phone"]:
            gaps.append("No phone number detected in the text")
        if not c["links"]:
            gaps.append("No LinkedIn/GitHub link detected")
        points += cp
        notes["contact"] = f"{cp}/10"

        # 3) keywords (35)
        missing: list[str] = []
        if job and job.required_skills:
            required = dedupe(job.required_skills)
            hit = [r for r in required if mentions(r, text)]
            missing = [r for r in required if r not in hit]
            ratio = len(hit) / len(required)
            notes["keywords"] = f"{len(hit)}/{len(required)} job keywords present"
            if missing:
                gaps.append("Job keywords not found in the resume: " + ", ".join(missing[:8]))
        else:
            found = extract_skills_from_text(text)
            ratio = min(len(found) / 10, 1.0)
            missing = [k for k in demand_keywords if not mentions(k, text)][:8]
            notes["keywords"] = f"{len(found)} recognised technical keywords"
            if len(found) < 6:
                gaps.append("Few recognisable technical keywords were found")
            if missing:
                gaps.append("In-demand skills on open jobs not found in the resume: " + ", ".join(missing[:6]))
        points += 35 * ratio

        # 4) quantified achievements (15)
        lines = [l for l in text.splitlines() if l.strip()]
        bullets = [l for l in lines if _BULLET.match(l)] or [l for l in lines if len(l.split()) >= 7]
        with_nums = [l for l in bullets if _HAS_NUMBER.search(l)]
        q_ratio = (len(with_nums) / len(bullets)) if bullets else 0.0
        points += 15 * clamp(q_ratio / 0.3)
        notes["quantification"] = f"{len(with_nums)}/{len(bullets)} bullet lines contain numbers"
        if q_ratio < 0.2:
            gaps.append("Very few achievements are quantified (numbers, percentages, scale)")

        # 5) length & pages (10)
        words = pdf.word_count
        if 300 <= words <= 800 and pdf.page_count <= 2:
            lp = 10
            fmt.append(f"Length is appropriate ({words} words, {pdf.page_count} page(s))")
        elif 200 <= words <= 1000 and pdf.page_count <= 3:
            lp = 6
            fmt.append(f"Length is acceptable but could be tighter ({words} words, {pdf.page_count} page(s))")
        else:
            lp = 3
            fmt.append(f"Length may hurt readability ({words} words, {pdf.page_count} page(s)); aim for 1-2 pages")
        points += lp
        notes["length"] = f"{lp}/10"

        # 6) formatting (5)
        fp = 5
        if pdf.table_count:
            fp -= 3
            fmt.append(f"{pdf.table_count} table(s) detected; many ATS parsers read tables out of order")
        else:
            fmt.append("No tables detected (ATS-friendly)")
        if pdf.image_count:
            fp -= 2
            fmt.append(f"{pdf.image_count} image(s) detected; text inside images is invisible to ATS")
        else:
            fmt.append("No images detected")
        if not bullets or not any(_BULLET.match(l) for l in lines):
            fmt.append("No bullet points detected; use bullets for experience and projects")
        points += max(fp, 0)
        notes["formatting"] = f"{max(fp, 0)}/5"

        return AtsFindings(
            score=int(round(clamp(points / 100) * 100)),
            breakdown=notes,
            missing_keywords=missing,
            gaps=gaps,
            formatting=fmt,
        )

    # ------------------------------------------------------------------ advice
    def analyze(self, pdf: ExtractedPdf, job: Optional[JobRecord], demand_keywords: list[str]) -> AtsResult:
        f = self.evaluate(pdf, job, demand_keywords)
        suggestions, overall = self._fallback_advice(f, job)
        if self.gemini.enabled:
            payload = {
                "ats_score": f.score,
                "score_breakdown": f.breakdown,
                "problems_found": f.gaps,
                "missing_keywords": f.missing_keywords,
                "target_job": f"{job.title} at {job.company}" if job else None,
            }
            try:
                advice = self.gemini.generate_json(
                    system=SYSTEM,
                    prompt="Findings (JSON):\n" + json.dumps(payload, ensure_ascii=False),
                    schema=LLMAtsAdvice,
                    temperature=0.3,
                )
                if advice.improvement_suggestions:
                    suggestions = [s.strip() for s in advice.improvement_suggestions if s.strip()][:8]
                if advice.overall_feedback.strip():
                    overall = advice.overall_feedback.strip()
            except LLMUnavailable:
                pass
        return AtsResult(
            ats_score=f.score,
            missing_keywords=f.missing_keywords,
            improvement_suggestions=suggestions,
            formatting_feedback=f.formatting,
            overall_feedback=overall,
        )

    @staticmethod
    def _fallback_advice(f: AtsFindings, job: Optional[JobRecord]) -> tuple[list[str], str]:
        s: list[str] = []
        if f.missing_keywords:
            target = f" from the {job.title} description" if job else ""
            s.append(f"Add relevant keywords{target} where you genuinely have the skill: {', '.join(f.missing_keywords[:6])}")
        for g in f.gaps:
            if g.startswith("No clear"):
                s.append(g.replace("No clear", "Add a clear").replace(" was detected", "").replace("heading", "heading at the start of that part"))
            elif "quantified" in g:
                s.append("Quantify project and internship impact with numbers (users, speed-ups, accuracy, team size)")
            elif "email" in g or "phone" in g or "LinkedIn" in g:
                s.append(g.replace("detected in the text", "- add it to the header as plain text"))
        s = dedupe(s)[:6] or ["Keep the resume to 1-2 pages with clear section headings and concise bullet points"]
        band = "strong" if f.score >= 75 else "fairly good" if f.score >= 55 else "weak"
        overall = (
            f"This resume's ATS compatibility is {band} (score {f.score}/100). "
            "Addressing the listed gaps, especially missing keywords and unquantified achievements, will raise it."
        )
        return s, overall
