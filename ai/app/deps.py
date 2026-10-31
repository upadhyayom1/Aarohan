from __future__ import annotations

from typing import Iterator

from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.repository import Repository
from app.db.session import get_engine, get_tables
from app.services.container import Services, get_services as _get_services


def get_repository() -> Iterator[Repository]:
    tables = get_tables()
    session = Session(get_engine())
    try:
        yield Repository(session, tables, get_settings())
    finally:
        session.close()


def get_services() -> Services:
    return _get_services()
