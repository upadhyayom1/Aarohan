"""Turns whatever the database stores (text[], jsonb, JSON string, CSV string, enum…)
into clean Python values."""
from __future__ import annotations

import json
import re
import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import BigInteger, Column, Integer, SmallInteger
from sqlalchemy.types import Uuid

INVALID = object()  # sentinel: value can never match this column's type

_SPLIT = re.compile(r"[,;\n|]+")


def to_str_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        s = value.strip()
        if not s:
            return []
        if s[0] in "[{":
            try:
                return to_str_list(json.loads(s))
            except json.JSONDecodeError:
                pass
        return [p.strip() for p in _SPLIT.split(s) if p.strip()]
    if isinstance(value, dict):
        for key in ("skills", "items", "values"):
            if key in value:
                return to_str_list(value[key])
        return [str(k).strip() for k in value.keys() if str(k).strip()]
    if isinstance(value, (list, tuple, set)):
        out: list[str] = []
        for item in value:
            if isinstance(item, dict):
                name = item.get("name") or item.get("skill") or item.get("title")
                if name:
                    out.append(str(name).strip())
            elif item is not None and str(item).strip():
                out.append(str(item).strip())
        return out
    return [str(value).strip()]


def to_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def to_int(value: Any) -> Optional[int]:
    if value is None or isinstance(value, bool):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def to_str(value: Any) -> Optional[str]:
    if value is None:
        return None
    return str(value)


def to_datetime(value: Any) -> Optional[datetime]:
    return value if isinstance(value, datetime) else None


def _as_list_of_dicts(value: Any) -> list[dict[str, Any]]:
    if value is None:
        return []
    if isinstance(value, str):
        s = value.strip()
        if not s:
            return []
        if s[0] in "[{":
            try:
                return _as_list_of_dicts(json.loads(s))
            except json.JSONDecodeError:
                pass
        return [{"_text": s}]
    if isinstance(value, dict):
        return [value]
    if isinstance(value, (list, tuple)):
        out: list[dict[str, Any]] = []
        for item in value:
            if isinstance(item, dict):
                out.append(item)
            elif item is not None and str(item).strip():
                out.append({"_text": str(item).strip()})
        return out
    return []


def _pick(d: dict[str, Any], *keys: str) -> Any:
    lowered = {re.sub(r"[^a-z0-9]", "", k.lower()): v for k, v in d.items()}
    for k in keys:
        v = lowered.get(re.sub(r"[^a-z0-9]", "", k.lower()))
        if v not in (None, ""):
            return v
    return None


def to_projects(value: Any) -> list[dict[str, Any]]:
    out = []
    for item in _as_list_of_dicts(value):
        if "_text" in item:
            out.append({"title": "Project", "description": item["_text"], "tech_stack": []})
            continue
        out.append(
            {
                "title": str(_pick(item, "title", "name", "projectName") or "Project"),
                "description": str(_pick(item, "description", "desc", "summary", "details") or ""),
                "tech_stack": to_str_list(_pick(item, "tech_stack", "techStack", "technologies", "tech", "stack")),
            }
        )
    return out


def to_experience(value: Any) -> list[dict[str, Any]]:
    out = []
    for item in _as_list_of_dicts(value):
        if "_text" in item:
            out.append({"company": "", "role": "", "duration": "", "description": item["_text"]})
            continue
        out.append(
            {
                "company": str(_pick(item, "company", "organization", "employer") or ""),
                "role": str(_pick(item, "role", "title", "position") or ""),
                "duration": str(_pick(item, "duration", "period", "dates") or ""),
                "description": str(_pick(item, "description", "desc", "summary", "details") or ""),
            }
        )
    return out


_OPEN_WORDS = {"open", "active", "published", "live", "true"}


def to_job_status(value: Any) -> str:
    if isinstance(value, bool):
        return "open" if value else "closed"
    if value is None:
        return "open"
    return "open" if str(value).strip().lower() in _OPEN_WORDS else "closed"


def coerce_for_column(col: Column[Any], value: Any) -> Any:
    """Convert an incoming id (always a string from JSON) to the column's real type."""
    t = col.type
    try:
        if isinstance(t, (Integer, BigInteger, SmallInteger)):
            return int(value)
        if isinstance(t, Uuid):
            return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return INVALID
    return value if not isinstance(value, (uuid.UUID,)) else str(value)
