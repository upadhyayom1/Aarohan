"""Resume lifecycle, RAG isolation, and absent resume handling tests."""
from __future__ import annotations

import hashlib
import tempfile
from pathlib import Path
from types import SimpleNamespace as NS
import pytest

from app.db.records import JobRecord, StudentRecord
from app.errors import AppError
from app.rag import ResumeRAG, split_resume
from app.services.embeddings import TfidfEmbedder
from app.services.match_service import MatchService
from app.services.pdf_extractor import load_resume_pdf, resolve_resume_path
from app.services.resume_service import ResumeService
from app.utils.cache import JsonCache

SAMPLE_RESUME = """Om Upadhyay
om@mnnit.ac.in | github.com/upadhyayom1
Summary
Full-stack software developer experienced in FastAPI and React.
Education
B.Tech in Computer Science, MNNIT Allahabad (2023 - 2027)
CGPA: 9.3
Skills
Python, FastAPI, SQL, Docker, React.js, Express.js
Projects
Nagar-Drishti - Smart Urban Traffic Intelligence System (Python, Docker, FastAPI)
- Built real-time video analytics pipeline with sub-second latency
Jan Saarthi AI - Government Opportunity Recommendation Platform (React, FastAPI)
- Engineered semantic search over public scholarship schemes
Experience
ML Researcher & Project Lead, MNNIT Intelligent Systems Group (2025 - 2026)
- Developed anomaly detection heuristics for streaming sensor data
"""

SETTINGS = NS(
    rag_enabled=True,
    rag_chunk_words=90,
    rag_chunk_overlap=15,
    rag_snippet_chars=320,
    rag_max_snippets=8,
    rag_index_cache=8,
    weight_skills=0.6,
    weight_context=0.2,
    weight_evidence=0.2,
    max_resume_mb=5,
    max_pdf_pages=10,
    resume_dir=Path("/tmp"),
)


def _pdf(text: str = SAMPLE_RESUME, sha: str = "sha_test_1"):
    return NS(
        text=text,
        sha256=sha or hashlib.sha256(text.encode()).hexdigest(),
        word_count=len(text.split()),
        page_count=1,
        table_count=0,
        image_count=0,
    )


class DummyGemini:
    enabled = False
    model = "offline"


def _cache():
    return JsonCache(Path("/tmp"), "test", enabled=False)


# ───────────────────────────── 1. Absent Resume Tests ─────────────────────────────
def test_absent_resume_raises_resume_not_uploaded():
    """Om Upadhyay or Adya Tripathi with no resume path must raise RESUME_NOT_UPLOADED."""
    svc = ResumeService(SETTINGS, DummyGemini(), _cache())
    student = StudentRecord(
        id="stu_om",
        user_id="user_om",
        name="Om Upadhyay",
        email="om@example.com",
        branch="CSE",
        cgpa=9.3,
        graduation_year=2027,
        backlogs=0,
        skills=[],
        projects=[],
        experience=[],
        resume_path=None,
    )
    with pytest.raises(AppError) as exc_info:
        svc.get_context(student)
    assert exc_info.value.code == "RESUME_NOT_UPLOADED"
    assert exc_info.value.status_code == 404


def test_try_get_context_returns_none_for_absent_resume():
    svc = ResumeService(SETTINGS, DummyGemini(), _cache())
    student = StudentRecord(
        id="stu_adya",
        user_id="user_adya",
        name="Adya Tripathi",
        email="adya@example.com",
        branch="CSE",
        cgpa=9.1,
        graduation_year=2027,
        backlogs=0,
        skills=[],
        projects=[],
        experience=[],
        resume_path=None,
    )
    assert svc.try_get_context(student) is None


# ───────────────────────────── 2. Matching with Absent Resume ─────────────────────────────
def test_matching_absent_resume_empty_skills_yields_zero():
    """No resume and empty profile produces 0% match, NOT fabricated scores or error crash."""
    embedder = TfidfEmbedder()
    matcher = MatchService(SETTINGS, DummyGemini(), embedder, _cache())
    student = StudentRecord(
        id="stu_om",
        user_id="user_om",
        name="Om Upadhyay",
        email="om@example.com",
        branch="CSE",
        cgpa=9.3,
        graduation_year=2027,
        backlogs=0,
        skills=[],
        projects=[],
        experience=[],
        resume_path=None,
    )
    job = JobRecord(
        id="job1",
        title="Full Stack Engineer",
        company="Razorpay",
        description="Build payment gateways",
        required_skills=["Python", "FastAPI", "React"],
        eligible_branches=["CSE"],
        min_cgpa=8.0,
        graduation_year=2027,
        max_backlogs=0,
        deadline=None,
        status="open",
        recruiter_id="rec1",
    )
    result, breakdown = matcher.compute(student, job, ctx=None, with_explanation=False)
    assert result.match_score == 0
    assert result.matched_skills == []
    assert "No verified resume uploaded and no technical skills in profile" in result.explanation
    assert breakdown.has_resume is False


# ───────────────────────────── 3. Corrupt / Empty PDF Validation ─────────────────────────────
def test_corrupt_pdf_rejected(tmp_path, monkeypatch):
    monkeypatch.setattr("app.services.pdf_extractor.get_settings", lambda: NS(resume_dir=tmp_path, max_resume_mb=5, max_pdf_pages=10))
    corrupt_file = tmp_path / "corrupt.pdf"
    corrupt_file.write_bytes(b"NOT A REAL PDF FILE CONTENT")

    with pytest.raises(AppError) as exc_info:
        load_resume_pdf(str(corrupt_file))
    assert exc_info.value.code == "INVALID_FILE_TYPE"


def test_empty_pdf_rejected(tmp_path, monkeypatch):
    monkeypatch.setattr("app.services.pdf_extractor.get_settings", lambda: NS(resume_dir=tmp_path, max_resume_mb=5, max_pdf_pages=10))
    empty_file = tmp_path / "empty.pdf"
    empty_file.write_bytes(b"")

    with pytest.raises(AppError) as exc_info:
        load_resume_pdf(str(empty_file))
    assert exc_info.value.code == "RESUME_UNREADABLE"


def test_oversized_pdf_rejected(tmp_path, monkeypatch):
    monkeypatch.setattr("app.services.pdf_extractor.get_settings", lambda: NS(resume_dir=tmp_path, max_resume_mb=1, max_pdf_pages=10))
    large_file = tmp_path / "large.pdf"
    # Write 1.5 MB of dummy data
    large_file.write_bytes(b"%PDF-1.4 " + b"0" * (1024 * 1024 * 2))

    with pytest.raises(AppError) as exc_info:
        load_resume_pdf(str(large_file))
    assert exc_info.value.code == "FILE_TOO_LARGE"


# ───────────────────────────── 4. RAG Chunks, Metadata & Student Isolation ─────────────────────────────
def test_rag_chunk_metadata_includes_student_and_sha():
    chunks = split_resume(SAMPLE_RESUME, student_id="student_123", resume_sha="sha_abc_456")
    assert len(chunks) > 0
    for chunk in chunks:
        assert chunk.student_id == "student_123"
        assert chunk.resume_sha == "sha_abc_456"


def test_rag_indexes_support_student_isolation_and_invalidation():
    rag = ResumeRAG(SETTINGS, TfidfEmbedder())
    pdf1 = _pdf(SAMPLE_RESUME, sha="sha_v1")
    pdf2 = _pdf(SAMPLE_RESUME.replace("Full-stack", "Backend"), sha="sha_v2")

    # Index for Student A
    idx_a1 = rag.index(pdf1, student_id="stu_A")
    assert idx_a1.student_id == "stu_A"
    assert idx_a1.sha == "sha_v1"
    assert "stu_A:sha_v1" in rag._indexes

    # Student A re-uploads a new resume version (v2)
    idx_a2 = rag.index(pdf2, student_id="stu_A")
    assert idx_a2.sha == "sha_v2"
    assert "stu_A:sha_v2" in rag._indexes
    # Old v1 for Student A was evicted
    assert "stu_A:sha_v1" not in rag._indexes

    # Index for Student B with v1 (must remain independent)
    idx_b1 = rag.index(pdf1, student_id="stu_B")
    assert "stu_B:sha_v1" in rag._indexes
    assert "stu_A:sha_v2" in rag._indexes

    # Invalidate Student A: only stu_A is cleared
    rag.invalidate_student("stu_A")
    assert "stu_A:sha_v2" not in rag._indexes
    assert "stu_B:sha_v1" in rag._indexes


def test_rag_missing_evidence_does_not_fabricate():
    rag = ResumeRAG(SETTINGS, TfidfEmbedder())
    pdf = _pdf("John Doe\nSummary\nAccounting and finance graduate with excel skills.")
    evidence = rag.skill_evidence(pdf, ["Kubernetes", "Quantum Computing", "Rust"])
    # Nonexistent technical skills in an accounting text must NOT return fabricated evidence
    assert evidence == {}
