from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.task import Task
from backend.app.models.goal import Goal
from backend.app.models.note import Note
from backend.app.models.learning import LearningItem
from backend.app.models.coding import CodingProblem
from backend.app.models.career import JobApplication
from backend.app.models.finance import FinanceTransaction
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("")
async def global_search(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    query_str = f"%{q.lower()}%"

    # Tasks
    tasks_res = await db.execute(
        select(Task).where(Task.user_id == current_user.id, Task.title.ilike(query_str)).limit(5)
    )
    tasks = [{"id": t.id, "title": t.title, "category": t.category, "priority": t.priority} for t in tasks_res.scalars().all()]

    # Goals
    goals_res = await db.execute(
        select(Goal).where(Goal.user_id == current_user.id, Goal.name.ilike(query_str)).limit(5)
    )
    goals = [{"id": g.id, "title": g.name, "category": g.category, "progress": g.progress} for g in goals_res.scalars().all()]

    # Notes
    notes_res = await db.execute(
        select(Note).where(Note.user_id == current_user.id, Note.title.ilike(query_str)).limit(5)
    )
    notes = [{"id": n.id, "title": n.title, "category": n.category} for n in notes_res.scalars().all()]

    # Learning
    learn_res = await db.execute(
        select(LearningItem).where(LearningItem.user_id == current_user.id, LearningItem.skill.ilike(query_str)).limit(5)
    )
    learning = [{"id": l.id, "title": l.skill, "category": l.category, "hours": l.total_hours} for l in learn_res.scalars().all()]

    # Coding
    coding_res = await db.execute(
        select(CodingProblem).where(CodingProblem.user_id == current_user.id, CodingProblem.title.ilike(query_str)).limit(5)
    )
    coding = [{"id": c.id, "title": c.title, "topic": c.topic, "difficulty": c.difficulty} for c in coding_res.scalars().all()]

    # Career
    career_res = await db.execute(
        select(JobApplication).where(JobApplication.user_id == current_user.id, JobApplication.company.ilike(query_str)).limit(5)
    )
    career = [{"id": a.id, "title": f"{a.role} @ {a.company}", "status": a.status} for a in career_res.scalars().all()]

    # Profile Skills & Background
    from backend.app.models.profile import UserSkill, UserExperience, UserContact
    skills_res = await db.execute(
        select(UserSkill).where(UserSkill.user_id == current_user.id, UserSkill.name.ilike(query_str)).limit(5)
    )
    profile_skills = [{"id": s.id, "title": f"Skill: {s.name} ({s.proficiency})", "category": s.category} for s in skills_res.scalars().all()]

    exp_res = await db.execute(
        select(UserExperience).where(UserExperience.user_id == current_user.id, UserExperience.company.ilike(query_str)).limit(5)
    )
    profile_exp = [{"id": e.id, "title": f"Experience: {e.role} @ {e.company}", "category": "Experience"} for e in exp_res.scalars().all()]

    total_matches = len(tasks) + len(goals) + len(notes) + len(learning) + len(coding) + len(career) + len(profile_skills) + len(profile_exp)

    return {
        "query": q,
        "total": total_matches,
        "results": {
            "tasks": tasks,
            "goals": goals,
            "notes": notes,
            "learning": learning,
            "coding": coding,
            "career": career,
            "profile": profile_skills + profile_exp,
        }
    }
