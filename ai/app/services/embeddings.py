"""Embedding back-ends used for *semantic* skill / document matching.

Order of preference (configurable with EMBEDDING_BACKEND):
    sentence-transformers (local)  ->  gemini  ->  tfidf (always available)
If the requested back-end cannot be loaded we fall back to TF-IDF so the service
never fails to start."""
from __future__ import annotations

import logging
import threading
from abc import ABC, abstractmethod
from typing import Optional, Sequence

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.config import Settings
from app.services.gemini_client import GeminiClient
from app.utils.text import chunk_words

log = logging.getLogger(__name__)


class Embedder(ABC):
    name = "base"
    #: similarity >= this  => treated as the same skill
    default_threshold = 0.72
    #: similarity >= this  => "related" (partial credit, still reported missing)
    default_related = 0.58
    #: raw document similarity range mapped onto 0..1
    context_low = 0.15
    context_high = 0.65

    @abstractmethod
    def similarity(self, a: Sequence[str], b: Sequence[str]) -> np.ndarray:
        """Cosine similarity matrix of shape (len(a), len(b))."""

    def document_similarity(self, doc: str, query: str) -> float:
        """How well a (long) resume text covers a (short) job text."""
        chunks = chunk_words(doc, 120)
        if not chunks or not query.strip():
            return 0.0
        sims = self.similarity(chunks, [query])[:, 0]
        return float(np.mean(np.sort(sims)[::-1][:3]))


class SentenceTransformerEmbedder(Embedder):
    name = "sentence-transformers"

    def __init__(self, model_name: str):
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(model_name)
        self._cache: dict[str, np.ndarray] = {}
        self._lock = threading.Lock()

    def _embed(self, texts: Sequence[str]) -> np.ndarray:
        with self._lock:
            missing = [t for t in dict.fromkeys(texts) if t not in self._cache]
            if missing:
                vecs = self.model.encode(missing, normalize_embeddings=True, convert_to_numpy=True, show_progress_bar=False)
                for t, v in zip(missing, vecs):
                    self._cache[t] = v
                if len(self._cache) > 6000:
                    for k in list(self._cache)[:3000]:
                        self._cache.pop(k, None)
            return np.vstack([self._cache[t] for t in texts])

    def similarity(self, a: Sequence[str], b: Sequence[str]) -> np.ndarray:
        return self._embed(list(a)) @ self._embed(list(b)).T


class GeminiEmbedder(Embedder):
    name = "gemini"
    default_threshold = 0.78
    default_related = 0.65
    context_low = 0.45
    context_high = 0.80

    def __init__(self, client: GeminiClient):
        self.client = client
        self._cache: dict[str, np.ndarray] = {}

    def _embed(self, texts: Sequence[str]) -> np.ndarray:
        missing = [t for t in dict.fromkeys(texts) if t not in self._cache]
        if missing:
            vecs = self.client.embed(missing)
            for t, v in zip(missing, vecs):
                self._cache[t] = v
        return np.vstack([self._cache[t] for t in texts])

    def similarity(self, a: Sequence[str], b: Sequence[str]) -> np.ndarray:
        return self._embed(list(a)) @ self._embed(list(b)).T


class TfidfEmbedder(Embedder):
    """Lexical fallback: character n-grams catch spelling variants (postgres ~ postgresql)."""

    name = "tfidf"
    default_threshold = 0.72
    default_related = 0.50
    context_low = 0.02
    context_high = 0.30

    def similarity(self, a: Sequence[str], b: Sequence[str]) -> np.ndarray:
        a, b = list(a), list(b)
        vec = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 4), lowercase=True)
        X = vec.fit_transform(a + b)
        return (X[: len(a)] @ X[len(a) :].T).toarray()

    def document_similarity(self, doc: str, query: str) -> float:
        if not doc.strip() or not query.strip():
            return 0.0
        try:
            X = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), sublinear_tf=True).fit_transform([doc, query])
        except ValueError:
            return 0.0
        return float(cosine_similarity(X[0], X[1])[0, 0])


class LazyEmbedder(Embedder):
    """Builds the real embedder on first use (keeps API start-up fast)."""

    def __init__(self, settings: Settings, gemini: GeminiClient):
        self._settings = settings
        self._gemini = gemini
        self._inner: Optional[Embedder] = None
        self._lock = threading.Lock()

    @property
    def inner(self) -> Embedder:
        if self._inner is None:
            with self._lock:
                if self._inner is None:
                    self._inner = _build(self._settings, self._gemini)
        return self._inner

    @property
    def name(self) -> str:  # type: ignore[override]
        return self.inner.name

    @property
    def default_threshold(self) -> float:  # type: ignore[override]
        return self._settings.semantic_match_threshold or self.inner.default_threshold

    @property
    def default_related(self) -> float:  # type: ignore[override]
        return self._settings.related_match_threshold or self.inner.default_related

    @property
    def context_low(self) -> float:  # type: ignore[override]
        return self.inner.context_low

    @property
    def context_high(self) -> float:  # type: ignore[override]
        return self.inner.context_high

    def similarity(self, a: Sequence[str], b: Sequence[str]) -> np.ndarray:
        return self.inner.similarity(a, b)

    def document_similarity(self, doc: str, query: str) -> float:
        return self.inner.document_similarity(doc, query)


def _build(settings: Settings, gemini: GeminiClient) -> Embedder:
    backend = settings.embedding_backend.strip().lower()
    if backend == "gemini":
        if gemini.enabled:
            log.info("Embedding backend: gemini (%s)", settings.gemini_embedding_model)
            return GeminiEmbedder(gemini)
        log.warning("EMBEDDING_BACKEND=gemini but GEMINI_API_KEY missing; trying sentence-transformers")
        backend = "sentence-transformers"
    if backend in {"sentence-transformers", "sbert", "st"}:
        try:
            emb = SentenceTransformerEmbedder(settings.st_model_name)
            log.info("Embedding backend: sentence-transformers (%s)", settings.st_model_name)
            return emb
        except Exception as exc:
            log.warning("sentence-transformers unavailable (%s: %s); falling back to TF-IDF", type(exc).__name__, exc)
    log.info("Embedding backend: tfidf")
    return TfidfEmbedder()
