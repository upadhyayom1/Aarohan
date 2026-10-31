"""Safe PDF loading + text extraction for resumes stored on the Node backend's disk."""
from __future__ import annotations

import hashlib
import logging
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

import pdfplumber

from app.config import get_settings
from app.errors import AppError
from app.utils.text import clean_text

log = logging.getLogger(__name__)


@dataclass
class ExtractedPdf:
    text: str
    page_count: int
    table_count: int
    image_count: int
    sha256: str
    size_bytes: int

    @property
    def word_count(self) -> int:
        return len(self.text.split())


def resolve_resume_path(stored: str) -> Path:
    """Map the value Node saved in the DB onto a real file INSIDE RESUME_STORAGE_DIR.

    Accepts absolute paths, relative paths, `/uploads/x.pdf` style URL paths and full URLs.
    Anything that resolves outside the storage folder is rejected (path-traversal safe)."""
    base = get_settings().resume_dir
    raw = (stored or "").strip()
    if not raw:
        raise AppError(404, "RESUME_NOT_FOUND", "No resume uploaded yet")
    if re.match(r"^https?://", raw, re.IGNORECASE):
        raw = urlparse(raw).path
    raw = raw.replace("\\", "/")

    candidates: list[Path] = []
    p = Path(raw)
    if p.is_absolute():
        candidates.append(p)
    candidates.append(base / raw.lstrip("/"))
    parts = [x for x in raw.split("/") if x not in ("", ".", "..")]
    for i in range(len(parts)):  # progressively strip leading folders (e.g. "uploads/resumes/x.pdf")
        candidates.append(base / Path(*parts[i:]))

    for cand in candidates:
        try:
            resolved = cand.resolve()
        except (OSError, RuntimeError):
            continue
        if resolved.is_file() and resolved.is_relative_to(base):
            return resolved
    raise AppError(404, "RESUME_NOT_FOUND", "Resume file could not be found on disk")


def load_resume_pdf(stored_path: str) -> ExtractedPdf:
    s = get_settings()
    path = resolve_resume_path(stored_path)

    if path.suffix.lower() != ".pdf":
        raise AppError(400, "INVALID_FILE_TYPE", "Resume must be a PDF file")
    size = path.stat().st_size
    if size > s.max_resume_mb * 1024 * 1024:
        raise AppError(400, "FILE_TOO_LARGE", f"Resume exceeds the {s.max_resume_mb} MB limit")
    if size == 0:
        raise AppError(400, "RESUME_UNREADABLE", "Resume file is empty")

    data = path.read_bytes()
    if not data.lstrip()[:5].startswith(b"%PDF"):
        raise AppError(400, "INVALID_FILE_TYPE", "File is not a valid PDF")
    digest = hashlib.sha256(data).hexdigest()

    pages_text: list[str] = []
    tables = images = pages = 0
    try:
        with pdfplumber.open(path) as pdf:
            pages = len(pdf.pages)
            for page in pdf.pages[: s.max_pdf_pages]:
                pages_text.append(page.extract_text() or "")
                try:
                    tables += len(page.find_tables())
                except Exception:
                    pass
                images += len(page.images)
    except Exception as exc:
        log.warning("PDF parse failed for %s: %s", path.name, type(exc).__name__)
        raise AppError(400, "RESUME_UNREADABLE", "The PDF is corrupted or cannot be read") from exc

    text = clean_text("\n".join(pages_text))
    if len(text) < 40:
        raise AppError(
            400,
            "RESUME_UNREADABLE",
            "No readable text found in the PDF (it may be a scanned image). Upload a text-based PDF.",
        )
    return ExtractedPdf(text=text, page_count=pages, table_count=tables, image_count=images, sha256=digest, size_bytes=size)
