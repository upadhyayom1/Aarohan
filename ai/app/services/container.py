"""Service wiring – one shared instance of every service (models are loaded once)."""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache

from app.config import Settings, get_settings
from app.services.ats_service import AtsService
from app.services.embeddings import LazyEmbedder
from app.services.gemini_client import GeminiClient
from app.services.match_service import MatchService
from app.services.node_client import NodeClient
from app.services.resume_builder import ResumeBuilderService
from app.services.resume_service import ResumeService
from app.services.skill_gap_service import SkillGapService
from app.utils.cache import JsonCache


@dataclass
class Services:
    settings: Settings
    gemini: GeminiClient
    embedder: LazyEmbedder
    resumes: ResumeService
    matching: MatchService
    ats: AtsService
    gaps: SkillGapService
    builder: ResumeBuilderService
    node: NodeClient


@lru_cache
def get_services() -> Services:
    s = get_settings()
    gemini = GeminiClient(s)
    embedder = LazyEmbedder(s, gemini)
    cache_root = s.cache_path
    return Services(
        settings=s,
        gemini=gemini,
        embedder=embedder,
        resumes=ResumeService(s, gemini, JsonCache(cache_root, "resume", s.cache_enabled)),
        matching=MatchService(s, gemini, embedder, JsonCache(cache_root, "explain", s.cache_enabled)),
        ats=AtsService(s, gemini),
        gaps=SkillGapService(gemini),
        builder=ResumeBuilderService(gemini),
        node=NodeClient(s),
    )
