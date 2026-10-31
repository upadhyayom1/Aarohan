"""Skill-level matching: exact/alias -> text mention -> semantic similarity -> related."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import numpy as np

from app.services.embeddings import Embedder
from app.utils.skills import canonical, is_confusable, mentions

MATCHED = {"exact", "text", "semantic"}
RELATED_CREDIT = 0.35


@dataclass
class SkillMatchDetail:
    required: str
    status: str  # exact | text | semantic | related | missing
    credit: float
    matched_with: Optional[str] = None
    similarity: Optional[float] = None
    evidenced: bool = False

    @property
    def matched(self) -> bool:
        return self.status in MATCHED


@dataclass
class SkillMatchSummary:
    details: list[SkillMatchDetail]

    @property
    def matched(self) -> list[str]:
        return [d.required for d in self.details if d.matched]

    @property
    def missing(self) -> list[str]:
        return [d.required for d in self.details if not d.matched]

    @property
    def related(self) -> list[SkillMatchDetail]:
        return [d for d in self.details if d.status == "related"]

    @property
    def skill_score(self) -> float:
        return sum(d.credit for d in self.details) / len(self.details) if self.details else 0.0

    @property
    def evidence_score(self) -> float:
        return sum(1 for d in self.details if d.evidenced) / len(self.details) if self.details else 0.0


class SkillMatcher:
    def __init__(self, embedder: Embedder):
        self.embedder = embedder

    def match(
        self,
        required: list[str],
        pool: list[str],
        resume_text: str = "",
        evidence_text: str = "",
        use_semantic: bool = True,
    ) -> SkillMatchSummary:
        required = [r.strip() for r in required if r and r.strip()]
        pool_by_canon: dict[str, str] = {}
        for p in pool:
            if p and p.strip():
                pool_by_canon.setdefault(canonical(p), p.strip())
        pool_list = list(pool_by_canon.values())

        found: dict[str, SkillMatchDetail] = {}
        pending: list[str] = []
        for req in required:
            if req in found:
                continue
            c = canonical(req)
            if c in pool_by_canon:
                found[req] = SkillMatchDetail(req, "exact", 1.0, pool_by_canon[c], 1.0)
            elif resume_text and mentions(req, resume_text):
                found[req] = SkillMatchDetail(req, "text", 1.0, req, 1.0)
            else:
                pending.append(req)

        if pending:
            threshold = self.embedder.default_threshold
            related_t = self.embedder.default_related
            sims = self.embedder.similarity(pending, pool_list) if (use_semantic and pool_list) else None
            for i, req in enumerate(pending):
                best: Optional[tuple[str, float]] = None
                if sims is not None:
                    for j in np.argsort(-sims[i])[:5]:
                        cand = pool_list[int(j)]
                        if is_confusable(req, cand):
                            continue
                        best = (cand, float(sims[i][int(j)]))
                        break
                if best and best[1] >= threshold:
                    found[req] = SkillMatchDetail(req, "semantic", min(1.0, best[1]), best[0], round(best[1], 3))
                elif best and best[1] >= related_t:
                    found[req] = SkillMatchDetail(req, "related", RELATED_CREDIT, best[0], round(best[1], 3))
                else:
                    found[req] = SkillMatchDetail(req, "missing", 0.0, best[0] if best else None, round(best[1], 3) if best else None)

        if evidence_text:
            for d in found.values():
                if d.matched:
                    d.evidenced = mentions(d.required, evidence_text) or bool(d.matched_with and mentions(d.matched_with, evidence_text))

        return SkillMatchSummary(details=[found[r] for r in dict.fromkeys(required)])
