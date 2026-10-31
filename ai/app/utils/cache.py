"""Tiny file-based JSON cache so identical resumes / prompts do not hit Gemini twice.
This is a local cache directory — it never touches the shared database."""
from __future__ import annotations

import hashlib
import json
import logging
import os
import tempfile
import time
from pathlib import Path
from typing import Any, Optional

log = logging.getLogger(__name__)


class JsonCache:
    def __init__(self, directory: Path, namespace: str, enabled: bool = True, ttl_seconds: Optional[int] = None):
        self.dir = directory / namespace
        self.enabled = enabled
        self.ttl = ttl_seconds

    def _path(self, key: str) -> Path:
        digest = hashlib.sha256(key.encode("utf-8")).hexdigest()
        return self.dir / digest[:2] / f"{digest}.json"

    def get(self, key: str) -> Optional[Any]:
        if not self.enabled:
            return None
        path = self._path(key)
        try:
            if not path.exists():
                return None
            if self.ttl and time.time() - path.stat().st_mtime > self.ttl:
                return None
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:  # corrupt cache must never break a request
            log.warning("cache read failed (%s): %s", path.name, exc)
            return None

    def set(self, key: str, value: Any) -> None:
        if not self.enabled:
            return
        path = self._path(key)
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
            with os.fdopen(fd, "w", encoding="utf-8") as fh:
                json.dump(value, fh, ensure_ascii=False)
            os.replace(tmp, path)
        except Exception as exc:
            log.warning("cache write failed (%s): %s", path.name, exc)
