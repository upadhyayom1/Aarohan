"""Application errors. Every error response follows the API contract shape:
{"code": "...", "message": "...", "details": {}}"""
from __future__ import annotations

from typing import Any, Optional


class AppError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}


def error_body(code: str, message: str, details: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    return {"code": code, "message": message, "details": details or {}}
