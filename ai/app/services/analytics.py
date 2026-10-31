from __future__ import annotations

from app.db.repository import Repository
from app.schemas import SkillDemandItem, SkillDemandResult
from app.utils.skills import canonical


def skill_demand(repo: Repository, limit: int = 15, open_only: bool = True) -> SkillDemandResult:
    demand = repo.skill_demand(open_only=open_only)
    supply: dict[str, int] = {}
    for skills in repo.list_student_skills():
        for c in {canonical(s) for s in skills}:
            supply[c] = supply.get(c, 0) + 1
    items = [
        SkillDemandItem(
            skill=skill,
            jobs_requiring=count,
            students_with_skill=supply.get(canonical(skill), 0),
            gap=count - supply.get(canonical(skill), 0),
        )
        for skill, count in demand.most_common(max(1, min(limit, 50)))
    ]
    return SkillDemandResult(open_jobs_only=open_only, skills=items)


def top_demand_keywords(repo: Repository, limit: int = 10) -> list[str]:
    try:
        return [s for s, _ in repo.skill_demand(open_only=True).most_common(limit)]
    except Exception:
        return []
