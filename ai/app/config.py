"""Central configuration. Everything comes from environment variables / .env.
No credentials are ever hard-coded."""
from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL, make_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Query params Prisma understands but libpq/psycopg2 rejects.
_PRISMA_ONLY_PARAMS = {
    "schema",
    "connection_limit",
    "pool_timeout",
    "pgbouncer",
    "socket_timeout",
    "statement_cache_size",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # server
    app_name: str = "CampusLink AI Service"
    environment: str = "development"
    log_level: str = "INFO"
    api_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # database
    database_url: Optional[str] = None
    db_host: Optional[str] = None
    db_port: int = 5432
    db_name: Optional[str] = None
    db_user: Optional[str] = None
    db_password: Optional[str] = None
    db_schema: Optional[str] = None
    db_sslmode: Optional[str] = None
    db_pool_size: int = 5
    db_statement_timeout_ms: int = 15000

    table_user: str = "User"
    table_student: str = "Student"
    table_job: str = "Job"
    table_application: str = "Application"
    column_overrides_json: Optional[str] = None

    # resume files
    resume_storage_dir: str = "../backend/uploads/resumes"
    max_resume_mb: int = 5
    max_pdf_pages: int = 10

    # auth
    jwt_secret: Optional[str] = None
    jwt_algorithm: str = "HS256"
    jwt_user_id_claims: str = "id,userId,user_id,sub"
    jwt_role_claim: str = "role"
    internal_api_key: Optional[str] = None
    auth_disabled: bool = False

    # gemini
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.5-flash"
    gemini_embedding_model: str = "gemini-embedding-001"
    gemini_timeout_seconds: int = 40
    gemini_max_retries: int = 2

    # matching
    embedding_backend: str = "sentence-transformers"
    st_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    semantic_match_threshold: Optional[float] = None
    related_match_threshold: Optional[float] = None
    weight_skills: float = 0.60
    weight_context: float = 0.25
    weight_evidence: float = 0.15
    warmup_models: bool = False
    match_batch_limit: int = 100

    # RAG over the resume (grounding snippets for LLM prompts; never changes scores)
    rag_enabled: bool = True
    rag_chunk_words: int = 90
    rag_chunk_overlap: int = 15
    rag_snippet_chars: int = 320
    rag_max_snippets: int = 8
    rag_index_cache: int = 64

    # cache
    cache_dir: str = ".cache"
    cache_enabled: bool = True

    # node backend callbacks (optional)
    node_backend_url: str = "http://localhost:8000"
    node_callbacks_enabled: bool = False
    node_path_resume_analysis: str = "/api/v1/internal/students/{student_id}/resume-analysis"
    node_path_match_result: str = "/api/v1/internal/applications/{application_id}/match-result"
    node_callback_method: str = "PUT"
    node_timeout_seconds: int = 8

    # ------------------------------------------------------------------ helpers
    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def jwt_user_id_claim_list(self) -> list[str]:
        return [c.strip() for c in self.jwt_user_id_claims.split(",") if c.strip()]

    @property
    def resume_dir(self) -> Path:
        p = Path(self.resume_storage_dir).expanduser()
        if not p.is_absolute():
            p = (BASE_DIR / p)
        return p.resolve()

    @property
    def cache_path(self) -> Path:
        p = Path(self.cache_dir).expanduser()
        return p if p.is_absolute() else (BASE_DIR / p)

    @property
    def column_overrides(self) -> dict[str, dict[str, list[str]]]:
        if not self.column_overrides_json:
            return {}
        try:
            raw = json.loads(self.column_overrides_json)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"COLUMN_OVERRIDES_JSON is not valid JSON: {exc}") from exc
        out: dict[str, dict[str, list[str]]] = {}
        for entity, fields in (raw or {}).items():
            out[entity.lower()] = {
                logical: ([names] if isinstance(names, str) else list(names))
                for logical, names in fields.items()
            }
        return out

    @property
    def sqlalchemy_url(self) -> URL:
        """Build the SQLAlchemy URL from DATABASE_URL or the DB_* parts."""
        if self.database_url:
            url = make_url(self.database_url)
            query = {k: v for k, v in url.query.items() if k not in _PRISMA_ONLY_PARAMS}
            return url.set(drivername="postgresql+psycopg2", query=query)

        missing = [
            name
            for name, val in (
                ("DB_HOST", self.db_host),
                ("DB_NAME", self.db_name),
                ("DB_USER", self.db_user),
            )
            if not val
        ]
        if missing:
            raise RuntimeError(
                "Database is not configured. Set DATABASE_URL or "
                + ", ".join(missing)
                + " in the environment/.env file."
            )
        query: dict[str, Any] = {}
        if self.db_sslmode:
            query["sslmode"] = self.db_sslmode
        return URL.create(
            "postgresql+psycopg2",
            username=self.db_user,
            password=self.db_password,
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
            query=query,
        )

    @property
    def schema_name(self) -> Optional[str]:
        schema = self.db_schema
        if not schema and self.database_url:
            schema = make_url(self.database_url).query.get("schema")  # type: ignore[assignment]
        if schema and not re.fullmatch(r"[A-Za-z0-9_]+", str(schema)):
            raise RuntimeError("DB schema name may only contain letters, digits and underscores")
        return str(schema) if schema else None

    def safe_db_description(self) -> str:
        """Human-readable DB target with the password removed (safe to log)."""
        try:
            return self.sqlalchemy_url.render_as_string(hide_password=True)
        except Exception:
            return "<database not configured>"


@lru_cache
def get_settings() -> Settings:
    return Settings()
