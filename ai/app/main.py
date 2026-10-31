"""CampusLink AI Service — independent FastAPI app (default port 8001).

Run:  uvicorn app.main:app --host 0.0.0.0 --port 8001
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app import __version__
from app.config import get_settings
from app.errors import AppError, error_body
from app.routers import ai, health

log = logging.getLogger("campuslink.ai")


def _configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    s = get_settings()
    log.info("Starting %s v%s (env=%s)", s.app_name, __version__, s.environment)
    if s.auth_disabled:
        log.warning("AUTH_DISABLED=true – every request is treated as admin. DEV ONLY.")
    if not s.auth_disabled and not (s.jwt_secret or s.internal_api_key):
        log.error("Neither JWT_SECRET nor INTERNAL_API_KEY is set: all protected requests will be rejected")
    if not s.gemini_api_key:
        log.warning("GEMINI_API_KEY not set – running in degraded (offline heuristics) mode")
    try:
        from app.db.session import get_tables

        get_tables()
        log.info("Database schema reflected successfully")
    except Exception as exc:  # do not crash: /health reports the problem
        log.error("Database not ready at startup: %s", getattr(exc, "message", exc))
    if s.warmup_models:
        try:
            from app.services.container import get_services

            get_services().embedder.similarity(["warmup"], ["warmup"])
        except Exception as exc:
            log.warning("Model warm-up failed: %s", exc)
    yield
    log.info("Shutting down")


def create_app() -> FastAPI:
    s = get_settings()
    _configure_logging(s.log_level)
    app = FastAPI(
        title=s.app_name,
        version=__version__,
        description="AI endpoints for CampusLink (resume analysis, matching, ATS, skill gaps). Reads the shared PostgreSQL database read-only.",
        lifespan=lifespan,
        docs_url=None if s.is_production else "/docs",
        redoc_url=None,
        openapi_url=None if s.is_production else "/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=s.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Internal-Api-Key"],
    )

    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message, exc.details))

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError):
        details = {".".join(str(p) for p in e["loc"] if p != "body"): e["msg"] for e in exc.errors()}
        return JSONResponse(status_code=400, content=error_body("VALIDATION_ERROR", "Request validation failed", details))

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException):
        codes = {404: "NOT_FOUND", 405: "METHOD_NOT_ALLOWED", 401: "UNAUTHORIZED", 403: "FORBIDDEN"}
        return JSONResponse(status_code=exc.status_code, content=error_body(codes.get(exc.status_code, "HTTP_ERROR"), str(exc.detail)))

    @app.exception_handler(SQLAlchemyError)
    async def _db(_: Request, exc: SQLAlchemyError):
        log.exception("Database error")
        return JSONResponse(status_code=503, content=error_body("DATABASE_ERROR", "The database is temporarily unavailable"))

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception):
        log.exception("Unhandled error")
        return JSONResponse(status_code=500, content=error_body("INTERNAL_ERROR", "Something went wrong"))

    app.include_router(health.router)
    app.include_router(health.router, prefix=s.api_prefix, include_in_schema=False)
    app.include_router(ai.router, prefix=f"{s.api_prefix}/ai")
    return app


app = create_app()
