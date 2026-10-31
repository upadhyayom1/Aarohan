"""Section-aware resume chunking.

Chunks never cross a section boundary (Skills / Education / Experience / Projects ...),
so a retrieved snippet is always about one topic. Long sections are packed line by line
(bullets stay intact) with a small overlap between neighbours."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.services.heuristics import SECTION_PATTERNS

HEADER = "header"  # everything before the first recognised heading (name, contacts)


@dataclass(frozen=True)
class Chunk:
    idx: int
    section: str
    text: str  # what gets embedded / shown (may begin with overlap from the previous chunk)
    body: str  # the part that is NOT overlap - used to rebuild text without duplicates


def _heading(line: str) -> Optional[str]:
    stripped = line.strip().rstrip(":").strip()
    if 0 < len(stripped) <= 40:
        for name, rx in SECTION_PATTERNS.items():
            if rx.match(stripped):
                return name
    return None


def _blocks(text: str) -> list[tuple[str, list[str]]]:
    blocks: list[tuple[str, list[str]]] = []
    section, lines = HEADER, []
    for raw in text.splitlines():
        if not raw.strip():
            continue
        name = _heading(raw)
        if name:
            if lines:
                blocks.append((section, lines))
            section, lines = name, [raw.strip()]
        else:
            lines.append(raw.strip())
    if lines:
        blocks.append((section, lines))
    return blocks


def _wc(s: str) -> int:
    return len(s.split())


def split_resume(text: str, max_words: int = 90, overlap_words: int = 15) -> list[Chunk]:
    max_words = max(20, max_words)
    overlap_words = max(0, min(overlap_words, max_words // 2))
    chunks: list[Chunk] = []

    def emit(section: str, overlap: list[str], body: list[str]) -> None:
        if not body:
            return
        chunks.append(
            Chunk(idx=len(chunks), section=section, text="\n".join(overlap + body), body="\n".join(body))
        )

    for section, lines in _blocks(text or ""):
        cur: list[str] = []
        carry: list[str] = []
        words = 0
        for line in lines:
            lw = _wc(line)
            if lw > max_words:  # one huge line: slide a word window over it
                emit(section, carry, cur)
                cur, carry, words = [], [], 0
                toks = line.split()
                step = max(1, max_words - overlap_words)
                for i in range(0, len(toks), step):
                    piece = " ".join(toks[i : i + max_words])
                    emit(section, [], [piece])
                    if i + max_words >= len(toks):
                        break
                continue
            if cur and words + lw > max_words:
                emit(section, carry, cur)
                carry, tail = [], 0
                for prev in reversed(cur):  # carry the last line(s) into the next chunk
                    if tail + _wc(prev) > overlap_words:
                        break
                    carry.insert(0, prev)
                    tail += _wc(prev)
                cur, words = [], 0
            cur.append(line)
            words += lw
        emit(section, carry, cur)
    return chunks
