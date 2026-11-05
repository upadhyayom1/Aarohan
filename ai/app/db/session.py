"""Read-only SQLAlchemy engine + schema reflection for the Node.js/Prisma database.

* The engine is opened with `default_transaction_read_only=on`, so even a bug in this
  service cannot modify the shared database.
* Tables are *reflected* (read from the live schema) – we never declare or migrate them.
"""
from __future__ import annotations

import logging
import re
import threading
from dataclasses import dataclass
from typing import Optional

from sqlalchemy import MetaData, Table, create_engine, inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

from app.config import Settings, get_settings
from app.errors import AppError

log = logging.getLogger(__name__)

_engine: Optional[Engine] = None
_tables: Optional["Tables"] = None
_lock = threading.RLock()


@dataclass
class Tables:
    student: Table
    job: Table
    application: Table
    user: Optional[Table]


def _connect_options(settings: Settings) -> str:
    opts = [
        "-c default_transaction_read_only=on",
    ]
    # Neon pooler (PgBouncer) rejects statement_timeout in startup connection options
    db_url_str = (settings.database_url or "").lower()
    is_pooler = "pooler" in db_url_str or "neon.tech" in db_url_str or "pgbouncer=true" in db_url_str
    if not is_pooler and settings.db_statement_timeout_ms:
        opts.append(f"-c statement_timeout={int(settings.db_statement_timeout_ms)}")
    if settings.schema_name:
        opts.append(f"-c search_path={settings.schema_name}")
    return " ".join(opts)


def get_engine() -> Engine:
    global _engine
    if _engine is not None:
        return _engine
    with _lock:
        if _engine is None:
            settings = get_settings()
            try:
                url = settings.sqlalchemy_url
            except RuntimeError as exc:
                raise AppError(503, "DATABASE_NOT_CONFIGURED", str(exc)) from exc
            _engine = create_engine(
                url,
                pool_size=settings.db_pool_size,
                max_overflow=2,
                pool_pre_ping=True,
                pool_recycle=1800,
                connect_args={"options": _connect_options(settings)},
            )
            log.info("Database engine created for %s (read-only)", settings.safe_db_description())
    return _engine


def _norm(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", name.lower())


def _resolve_table_name(configured: str, existing: list[str]) -> Optional[str]:
    """Exact -> case-insensitive -> punctuation/plural-insensitive match."""
    if configured in existing:
        return configured
    lowered = {n.lower(): n for n in existing}
    if configured.lower() in lowered:
        return lowered[configured.lower()]
    target = _norm(configured).rstrip("s")
    for n in existing:
        if _norm(n).rstrip("s") == target:
            return n
    return None


def get_tables(force: bool = False) -> Tables:
    """Reflect the existing tables once and cache the result."""
    global _tables
    if _tables is not None and not force:
        return _tables
    with _lock:
        if _tables is not None and not force:
            return _tables
        settings = get_settings()
        engine = get_engine()
        schema = settings.schema_name
        try:
            existing = inspect(engine).get_table_names(schema=schema)
            wanted = {
                "student": _resolve_table_name(settings.table_student, existing),
                "job": _resolve_table_name(settings.table_job, existing),
                "application": _resolve_table_name(settings.table_application, existing),
                "user": _resolve_table_name(settings.table_user, existing),
            }
            missing = [k for k in ("student", "job", "application") if not wanted[k]]
            if missing:
                raise AppError(
                    503,
                    "SCHEMA_MISMATCH",
                    "Could not find required tables in the database: " + ", ".join(missing),
                    {"existing_tables": existing[:50], "hint": "Set TABLE_STUDENT / TABLE_JOB / TABLE_APPLICATION"},
                )
            md = MetaData(schema=schema)
            _tables = Tables(
                student=Table(wanted["student"], md, autoload_with=engine, schema=schema),
                job=Table(wanted["job"], md, autoload_with=engine, schema=schema),
                application=Table(wanted["application"], md, autoload_with=engine, schema=schema),
                user=Table(wanted["user"], md, autoload_with=engine, schema=schema) if wanted["user"] else None,
            )
        except SQLAlchemyError as exc:
            log.exception("Schema reflection failed")
            raise AppError(503, "DATABASE_UNAVAILABLE", "Could not read the database schema") from exc
        log.info(
            "Reflected tables: student=%s job=%s application=%s user=%s",
            _tables.student.name,
            _tables.job.name,
            _tables.application.name,
            _tables.user.name if _tables.user is not None else None,
        )
        return _tables


def ping() -> bool:
    with get_engine().connect() as conn:
        conn.execute(text("SELECT 1"))
    return True


def reset_for_tests() -> None:
    global _engine, _tables
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _tables = None
