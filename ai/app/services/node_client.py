"""Optional, best-effort HTTP client for the Node.js backend.

The AI service never writes to the shared database; if you want results persisted,
the Node backend exposes endpoints and we call them here. Disabled by default
(NODE_CALLBACKS_ENABLED=false). Failures are logged, never raised."""
from __future__ import annotations

import logging
from typing import Any, Optional

import httpx

from app.config import Settings
from app.schemas import MatchResult, ResumeAnalysis

log = logging.getLogger(__name__)


class NodeClient:
    def __init__(self, settings: Settings):
        self.s = settings

    @property
    def enabled(self) -> bool:
        return bool(self.s.node_callbacks_enabled and self.s.node_backend_url and self.s.internal_api_key)

    def _headers(self) -> dict[str, str]:
        return {"X-Internal-Api-Key": self.s.internal_api_key or "", "Content-Type": "application/json"}

    def _send(self, path: str, payload: dict[str, Any]) -> bool:
        url = self.s.node_backend_url.rstrip("/") + path
        try:
            r = httpx.request(
                self.s.node_callback_method.upper(), url, json=payload, headers=self._headers(),
                timeout=self.s.node_timeout_seconds,
            )
            if r.status_code >= 400:
                log.warning("Node callback %s -> HTTP %s", path, r.status_code)
                return False
            return True
        except httpx.HTTPError as exc:
            log.warning("Node callback %s failed: %s", path, type(exc).__name__)
            return False

    def push_resume_analysis(self, student_id: str, analysis: ResumeAnalysis) -> None:
        if not self.enabled:
            return
        self._send(self.s.node_path_resume_analysis.format(student_id=student_id), analysis.model_dump())

    def push_match_result(self, application_id: str, result: MatchResult) -> None:
        if not self.enabled:
            return
        self._send(self.s.node_path_match_result.format(application_id=application_id), result.model_dump())

    def ping(self) -> Optional[bool]:
        if not self.s.node_backend_url:
            return None
        try:
            httpx.get(self.s.node_backend_url.rstrip("/") + "/", timeout=3)
            return True
        except httpx.HTTPError:
            return False
