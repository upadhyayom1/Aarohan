"""Thin wrapper around the Google Gen AI SDK (`google-genai`).

All model calls go through here so retries, timeouts, JSON parsing and
"Gemini is down / not configured" fallbacks are handled in one place."""
from __future__ import annotations

import logging
import re
import threading
import time
from typing import Optional, Sequence, TypeVar

import numpy as np
from pydantic import BaseModel, ValidationError

from app.config import Settings

log = logging.getLogger(__name__)
M = TypeVar("M", bound=BaseModel)


class LLMUnavailable(RuntimeError):
    """Raised when Gemini is not configured or every retry failed."""


_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE)


class GeminiClient:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._client = None
        self._lock = threading.Lock()

    @property
    def enabled(self) -> bool:
        return bool(self.settings.gemini_api_key)

    @property
    def model(self) -> str:
        return self.settings.gemini_model

    def _get(self):
        if not self.enabled:
            raise LLMUnavailable("GEMINI_API_KEY is not configured")
        if self._client is None:
            with self._lock:
                if self._client is None:
                    from google import genai
                    from google.genai import types

                    self._client = genai.Client(
                        api_key=self.settings.gemini_api_key,
                        http_options=types.HttpOptions(timeout=int(self.settings.gemini_timeout_seconds * 1000)),
                    )
        return self._client

    def _with_retries(self, fn):
        last: Optional[Exception] = None
        attempts = max(1, self.settings.gemini_max_retries + 1)
        for i in range(attempts):
            try:
                return fn()
            except LLMUnavailable:
                raise
            except Exception as exc:  # network, quota, safety, malformed JSON…
                last = exc
                log.warning("Gemini call failed (attempt %d/%d): %s", i + 1, attempts, type(exc).__name__)
                if i < attempts - 1:
                    time.sleep(min(2 ** i, 4))
        raise LLMUnavailable(f"Gemini request failed: {type(last).__name__}") from last

    # ------------------------------------------------------------------ generation
    def generate_json(self, *, system: str, prompt: str, schema: type[M], temperature: float = 0.1) -> M:
        from google.genai import types

        def call() -> M:
            resp = self._get().models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    temperature=temperature,
                    response_mime_type="application/json",
                    response_schema=schema,
                ),
            )
            text = (resp.text or "").strip()
            if not text:
                raise ValueError("empty response")
            try:
                return schema.model_validate_json(_FENCE.sub("", text))
            except ValidationError as exc:
                raise ValueError(f"response did not match schema: {exc.error_count()} errors") from exc

        return self._with_retries(call)

    def generate_text(self, *, system: str, prompt: str, temperature: float = 0.3) -> str:
        from google.genai import types

        def call() -> str:
            resp = self._get().models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(system_instruction=system, temperature=temperature),
            )
            text = (resp.text or "").strip()
            if not text:
                raise ValueError("empty response")
            return text

        return self._with_retries(call)

    # ------------------------------------------------------------------ embeddings
    def embed(self, texts: Sequence[str]) -> np.ndarray:
        from google.genai import types

        def call() -> np.ndarray:
            vectors: list[list[float]] = []
            items = list(texts)
            for i in range(0, len(items), 90):  # API batch limit is 100
                resp = self._get().models.embed_content(
                    model=self.settings.gemini_embedding_model,
                    contents=items[i : i + 90],
                    config=types.EmbedContentConfig(task_type="SEMANTIC_SIMILARITY"),
                )
                vectors.extend(e.values for e in resp.embeddings)
            arr = np.asarray(vectors, dtype=np.float32)
            norms = np.linalg.norm(arr, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return arr / norms

        return self._with_retries(call)
