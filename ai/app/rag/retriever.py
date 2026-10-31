"""Index + retrieval for one resume.

* Index  : section-aware chunks, cached per PDF sha256 (small LRU, in memory).
* Embeds : through the SAME embedder the matcher already uses (sentence-transformers,
           Gemini or TF-IDF), so no new model / dependency / API key is needed.
* Search : hybrid - an exact/alias mention of the skill (utils.skills.mentions) always
           outranks a purely semantic hit, then cosine similarity breaks ties.
* Safety : every public method swallows its own errors and returns an empty result, so
           RAG can never make an endpoint fail."""
from __future__ import annotations

import logging
import threading
from collections import OrderedDict
from dataclasses import dataclass
from typing import Optional, Sequence

import numpy as np

from app.rag.chunker import HEADER, Chunk, split_resume
from app.utils.skills import mentions

log = logging.getLogger(__name__)

# Queries used to decide which chunks of a *very long* resume deserve room in the parsing prompt.
_PARSE_QUERIES = {
    "summary": "professional summary objective profile",
    "skills": "technical skills programming languages frameworks tools technologies",
    "education": "education degree branch university college cgpa graduation year",
    "experience": "work experience internship company role responsibilities duration",
    "projects": "projects built developed implemented tech stack description",
}
_PARSE_SECTIONS = set(_PARSE_QUERIES)


@dataclass
class ResumeIndex:
    sha: str
    chunks: list[Chunk]


def _snippet(text: str, limit: int) -> str:
    flat = " ".join(text.split())
    return flat if len(flat) <= limit else flat[: limit - 1].rstrip() + "…"


class ResumeRAG:
    def __init__(self, settings, embedder):
        self.settings = settings
        self.embedder = embedder
        self._indexes: "OrderedDict[str, ResumeIndex]" = OrderedDict()
        self._lock = threading.Lock()

    # ------------------------------------------------------------------ state
    @property
    def enabled(self) -> bool:
        return bool(getattr(self.settings, "rag_enabled", True))

    def index(self, pdf) -> ResumeIndex:
        with self._lock:
            hit = self._indexes.get(pdf.sha256)
            if hit is not None:
                self._indexes.move_to_end(pdf.sha256)
                return hit
        idx = ResumeIndex(
            sha=pdf.sha256,
            chunks=split_resume(
                pdf.text,
                max_words=self.settings.rag_chunk_words,
                overlap_words=self.settings.rag_chunk_overlap,
            ),
        )
        with self._lock:
            self._indexes[pdf.sha256] = idx
            while len(self._indexes) > max(1, self.settings.rag_index_cache):
                self._indexes.popitem(last=False)
        return idx

    def _sims(self, chunks: Sequence[Chunk], queries: Sequence[str]) -> np.ndarray:
        """(n_chunks, n_queries) cosine matrix; zeros if the embedder is unavailable."""
        try:
            return np.asarray(self.embedder.similarity([c.text for c in chunks], list(queries)), dtype=float)
        except Exception as exc:
            log.warning("RAG embedding failed (%s); using lexical ranking only", type(exc).__name__)
            return np.zeros((len(chunks), len(queries)))

    # ------------------------------------------------------------------ evidence for skills
    def skill_evidence(
        self, pdf, skills: Sequence[str], *, per_skill: int = 1, relax: float = 1.0
    ) -> dict[str, str]:
        """skill -> the resume passage that best shows it (or, for a missing skill, the closest
        place it could naturally be added). Skills with no relevant passage are omitted, so the
        LLM is never handed fabricated 'evidence'."""
        try:
            wanted = [s for s in dict.fromkeys(s.strip() for s in skills if s and s.strip())]
            wanted = wanted[: self.settings.rag_max_snippets]
            if not self.enabled or not wanted or pdf is None:
                return {}
            chunks = [c for c in self.index(pdf).chunks if c.section != HEADER] or self.index(pdf).chunks
            if not chunks:
                return {}
            sims = self._sims(chunks, wanted)
            floor = float(self.embedder.default_related) * relax
            out: dict[str, str] = {}
            for j, skill in enumerate(wanted):
                ranked = sorted(
                    range(len(chunks)),
                    key=lambda i: (not mentions(skill, chunks[i].text), -sims[i, j]),
                )
                picked: list[str] = []
                for i in ranked[: max(1, per_skill)]:
                    if mentions(skill, chunks[i].text) or sims[i, j] >= floor:
                        picked.append(_snippet(chunks[i].text, self.settings.rag_snippet_chars))
                if picked:
                    out[skill] = " … ".join(picked)
            return out
        except Exception as exc:
            log.warning("RAG skill_evidence failed: %s", type(exc).__name__)
            return {}

    # ------------------------------------------------------------------ free-form excerpts
    def excerpts(self, pdf, queries: Sequence[str], *, per_query: int = 1, max_total: Optional[int] = None) -> list[str]:
        """Top passage(s) for each query, de-duplicated, in resume order."""
        try:
            qs = [q for q in dict.fromkeys(q.strip() for q in queries if q and q.strip())]
            if not self.enabled or not qs or pdf is None:
                return []
            chunks = [c for c in self.index(pdf).chunks if c.section != HEADER] or self.index(pdf).chunks
            if not chunks:
                return []
            sims = self._sims(chunks, qs)
            chosen: dict[int, None] = {}
            for j in range(len(qs)):
                for i in np.argsort(-sims[:, j])[: max(1, per_query)]:
                    chosen.setdefault(int(i))
            limit = max_total or self.settings.rag_max_snippets
            ordered = sorted(chosen)[:limit]
            return [_snippet(chunks[i].text, self.settings.rag_snippet_chars) for i in ordered]
        except Exception as exc:
            log.warning("RAG excerpts failed: %s", type(exc).__name__)
            return []

    # ------------------------------------------------------------------ parsing prompt
    def parse_context(self, pdf, limit: int) -> str:
        """Resume text for the parsing prompt.

        * Fits in `limit`  -> the full text, byte-for-byte what was always sent (identical output).
        * Too long         -> retrieved chunks (all Skills/Education/Experience/Projects/Summary
                              material first, most relevant first) instead of blindly cutting the end."""
        text = pdf.text
        if len(text) <= limit or not self.enabled:
            return text[:limit]
        try:
            chunks = self.index(pdf).chunks
            if not chunks:
                return text[:limit]
            sims = self._sims(chunks, list(_PARSE_QUERIES.values())).max(axis=1)
            order = sorted(
                range(len(chunks)),
                key=lambda i: (chunks[i].section not in _PARSE_SECTIONS, -sims[i]),
            )
            chosen: list[int] = []
            used = 0
            for i in order:
                cost = len(chunks[i].body) + 1
                if used + cost > limit:
                    continue
                chosen.append(i)
                used += cost
            if not chosen:
                return text[:limit]
            return "\n".join(chunks[i].body for i in sorted(chosen))[:limit]
        except Exception as exc:
            log.warning("RAG parse_context failed (%s); truncating instead", type(exc).__name__)
            return text[:limit]
