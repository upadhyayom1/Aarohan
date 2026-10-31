"""RAG tests. Run from the project root:  pytest -q

They use the TF-IDF embedder and a fake Gemini client, so no network / model download is needed."""
from __future__ import annotations

import hashlib
from types import SimpleNamespace as NS

from app.db.records import JobRecord
from app.rag import ResumeRAG, split_resume
from app.services.ats_service import AtsService
from app.services.embeddings import TfidfEmbedder
from app.services.resume_builder import ResumeBuilderService
from app.services.skill_gap_service import SkillGapService

RESUME = """Prateek Sharma
prateek@mnnit.ac.in | +91 98765 43210 | github.com/prateek
Summary
Backend-focused CSE student building REST services and LLM-powered applications.
Education
B.Tech, Computer Science and Engineering, MNNIT Allahabad (2023 - 2027)
CGPA: 8.5
Skills
Python, FastAPI, Postgres, ReactJS, REST APIs, Git, containerization with Docker Compose
Experience
Backend Intern, XYZ Corp (May 2026 - Jul 2026)
- Built 6 FastAPI microservices handling 10k requests per day
- Cut average API latency by 35% by adding Redis caching
Projects
CogniVault - FastAPI chatbot with RAG and session memory (Python, FastAPI, LangChain)
- Implemented retrieval over 2,000 documents with 90% answer relevance in manual tests
CampusLink - placement portal with role-based dashboards (React, Node.js, PostgreSQL)
"""

SETTINGS = NS(
    rag_enabled=True, rag_chunk_words=90, rag_chunk_overlap=15,
    rag_snippet_chars=320, rag_max_snippets=8, rag_index_cache=8,
)


def _pdf(text: str = RESUME):
    return NS(
        text=text, sha256=hashlib.sha256(text.encode()).hexdigest(),
        word_count=len(text.split()), page_count=1, table_count=0, image_count=0,
    )


def _job():
    return JobRecord(
        id="j1", title="Backend Engineer", company="Acme", description="APIs",
        required_skills=["Python", "Redis", "Kubernetes"], eligible_branches=[], min_cgpa=None,
        graduation_year=None, max_backlogs=None, deadline=None, status="OPEN", recruiter_id=None,
    )


class FakeGemini:
    """Records the prompts it receives and returns canned structured output."""
    enabled = True
    model = "fake"

    def __init__(self, out):
        self.out, self.calls = out, []

    def generate_json(self, *, system, prompt, schema, temperature=0.1):
        self.calls.append((system, prompt))
        return self.out


def _rag(enabled=True):
    s = NS(**{**SETTINGS.__dict__, "rag_enabled": enabled})
    return ResumeRAG(s, TfidfEmbedder())


# ───────────────────────── chunker ─────────────────────────
def test_chunks_follow_sections():
    sections = [c.section for c in split_resume(RESUME)]
    assert sections[0] == "header"
    assert {"summary", "education", "skills", "experience", "projects"} <= set(sections)


def test_long_section_is_split_with_overlap_but_body_is_lossless():
    lines = "\n".join(f"- Built feature number {i} using Python and Redis for users" for i in range(60))
    chunks = split_resume("Experience\n" + lines, max_words=40, overlap_words=10)
    assert len(chunks) > 3
    rebuilt = "\n".join(c.body for c in chunks).splitlines()
    assert rebuilt == ["Experience"] + lines.splitlines()


# ───────────────────────── parity (same output as before) ─────────────────────────
def test_parse_context_is_identical_for_resumes_that_fit():
    assert _rag().parse_context(_pdf(), 18000) == RESUME


def test_parse_context_disabled_equals_old_truncation():
    assert _rag(enabled=False).parse_context(_pdf(), 120) == RESUME[:120]


def test_long_resume_keeps_the_sections_truncation_would_have_lost():
    filler = "\n".join(f"Hobby line {i} about gardening chess and hiking with friends on weekends" for i in range(400))
    text = RESUME.replace("Projects", "Interests\n" + filler + "\nProjects")
    out = _rag().parse_context(_pdf(text), 3000)
    assert len(out) <= 3000
    assert "CampusLink" in out and "Docker Compose" in out and "CGPA: 8.5" in out
    assert "CampusLink" not in text[:3000]  # what the old code would have sent


def test_ats_score_and_formatting_unchanged_by_rag():
    pdf = _pdf()
    gem = FakeGemini(NS(improvement_suggestions=["x"], overall_feedback="ok"))
    plain = AtsService(NS(), gem).analyze(pdf, _job(), [])
    with_rag = AtsService(NS(), gem, _rag()).analyze(pdf, _job(), [])
    assert plain.ats_score == with_rag.ats_score
    assert plain.missing_keywords == with_rag.missing_keywords
    assert plain.formatting_feedback == with_rag.formatting_feedback
    assert list(plain.model_dump()) == list(with_rag.model_dump())  # same response shape


def test_ats_prompt_gets_grounding_only_when_rag_is_on():
    pdf = _pdf()
    g1, g2 = FakeGemini(NS(improvement_suggestions=["x"], overall_feedback="ok")), FakeGemini(NS(improvement_suggestions=["x"], overall_feedback="ok"))
    AtsService(NS(), g1).analyze(pdf, _job(), [])
    AtsService(NS(), g2, _rag()).analyze(pdf, _job(), [])
    assert "resume_context_for_missing_keywords" not in g1.calls[0][1]
    assert "resume_context_for_missing_keywords" in g2.calls[0][1]


def test_skill_gap_fallback_identical_without_llm():
    class Off:
        enabled = False
    a = SkillGapService(Off()).recommend(_job(), ["Kubernetes", "Docker"], ["Python"])
    b = SkillGapService(Off(), _rag()).recommend(_job(), ["Kubernetes", "Docker"], ["Python"], resume=_pdf())
    assert a == b


def test_builder_fallback_identical_without_llm():
    class Off:
        enabled = False
    student = NS(name="P", branch="CSE", cgpa=8.5, graduation_year=2027, skills=["Python"], projects=[], experience=[])
    a = ResumeBuilderService(Off()).build(student, None)
    b = ResumeBuilderService(Off(), _rag()).build(student, None, resume=_pdf())
    assert a == b


# ───────────────────────── retrieval quality / safety ─────────────────────────
def test_skill_evidence_finds_the_right_passage_and_skips_unrelated_skills():
    ev = _rag().skill_evidence(_pdf(), ["Redis", "Docker"])
    assert "caching" in ev["Redis"]
    assert "Docker Compose" in ev["Docker"]


def test_rag_never_raises_when_embedder_is_down():
    class Boom(TfidfEmbedder):
        def similarity(self, a, b):
            raise RuntimeError("down")
    rag = ResumeRAG(SETTINGS, Boom())
    assert "Redis" in rag.skill_evidence(_pdf(), ["Redis"])  # lexical hit still works
    assert rag.parse_context(_pdf("x " * 5000), 100)          # falls back to truncation
