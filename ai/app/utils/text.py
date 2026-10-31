from __future__ import annotations

import re
from typing import Callable, Iterable, Optional, TypeVar

T = TypeVar("T")
_WS = re.compile(r"[ \t\f\v]+")
_BLANKS = re.compile(r"\n{3,}")


def clean_text(text: str) -> str:
    text = (text or "").replace("\x00", " ").replace("\r", "\n")
    text = _WS.sub(" ", text)
    text = _BLANKS.sub("\n\n", text)
    return text.strip()


def truncate(text: str, limit: int) -> str:
    text = text or ""
    return text if len(text) <= limit else text[:limit]


def chunk_words(text: str, size: int = 120) -> list[str]:
    words = (text or "").split()
    if not words:
        return []
    return [" ".join(words[i : i + size]) for i in range(0, len(words), size)]


def dedupe(items: Iterable[T], key: Optional[Callable[[T], str]] = None) -> list[T]:
    seen: set[str] = set()
    out: list[T] = []
    for item in items:
        k = key(item) if key else str(item).strip().lower()
        if not k or k in seen:
            continue
        seen.add(k)
        out.append(item)
    return out


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))
