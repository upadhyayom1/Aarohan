from __future__ import annotations

from fastapi import APIRouter, Depends

from app.config import get_settings
from app.db import session as db_session
from app.deps import get_services
from app.services.container import Services

router = APIRouter(tags=["health"])


@router.get("/health")
def health(svc: Services = Depends(get_services)):
    s = get_settings()
    db_ok, db_error = False, None
    try:
        db_ok = db_session.ping()
    except Exception as exc:
        db_error = getattr(exc, "message", None) or type(exc).__name__
    return {
        "status": "ok" if db_ok else "degraded",
        "service": s.app_name,
        "database": {"connected": db_ok, "read_only": True, "error": db_error},
        "gemini": {"configured": svc.gemini.enabled, "model": s.gemini_model},
        "embedding_backend_requested": s.embedding_backend,
        "node_callbacks_enabled": svc.node.enabled,
        "auth": {"jwt_configured": bool(s.jwt_secret), "internal_key_configured": bool(s.internal_api_key), "auth_disabled": s.auth_disabled},
    }
