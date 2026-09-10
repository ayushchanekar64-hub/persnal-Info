from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.task import Task
from backend.app.models.goal import Goal
from backend.app.models.learning import LearningItem
from backend.app.models.coding import CodingProblem
from backend.app.models.habit import Habit
from backend.app.api.deps import get_current_user

router = APIRouter()


class AIQueryRequest(BaseModel):
    query: str


class AIResponse(BaseModel):
    reply: str
    context_used: Dict[str, Any] = {}


@router.post("/query", response_model=AIResponse)
async def query_copilot(
    req: AIQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    q = req.query.lower().strip()

    # Load only current user's context
    task_res = await db.execute(select(Task).where(Task.user_id == current_user.id, Task.completed == False))
    pending_tasks = task_res.scalars().all()

    goal_res = await db.execute(select(Goal).where(Goal.user_id == current_user.id))
    goals = goal_res.scalars().all()

    learn_res = await db.execute(select(LearningItem).where(LearningItem.user_id == current_user.id))
    learning_items = learn_res.scalars().all()

    coding_res = await db.execute(select(CodingProblem).where(CodingProblem.user_id == current_user.id))
    coding_problems = coding_res.scalars().all()

    # If user has no data yet
    if not pending_tasks and not goals and not learning_items and not coding_problems:
        return AIResponse(
            reply="Your AI insights will appear here once MYNEXUS has enough activity to analyze.",
            context_used={"has_data": False}
        )

    # Dynamic context synthesis based on real user records
    reply_lines = []
    if "focus" in q or "today" in q or "task" in q:
        if pending_tasks:
            high_pri = [t for t in pending_tasks if t.priority in ["Critical", "High"]]
            first_task = high_pri[0] if high_pri else pending_tasks[0]
            reply_lines.append(
                f"Today's Priority: You have {len(pending_tasks)} pending task(s). Recommended focus: start with \"{first_task.title}\" ({first_task.priority} priority)."
            )
        else:
            reply_lines.append("All scheduled tasks are completed. Consider advancing on long-term goals or planning upcoming milestones.")

    if "goal" in q:
        if goals:
            reply_lines.append(f"Active Goals: You are currently tracking {len(goals)} goal(s). Keep up regular milestone check-ins.")
        else:
            reply_lines.append("No active goals registered yet. Create a goal to begin milestone velocity tracking.")

    if "learn" in q or "study" in q:
        if learning_items:
            total_h = sum(item.total_hours for item in learning_items)
            reply_lines.append(f"Learning Velocity: You have logged {total_h:.1f} hours across {len(learning_items)} skill track(s).")
        else:
            reply_lines.append("No learning items logged yet. Add your curriculum topics under Learning.")

    if "code" in q or "dsa" in q or "coding" in q:
        if coding_problems:
            solved = [p for p in coding_problems if p.status in ["Solved", "Mastered"]]
            reply_lines.append(f"Coding Mastery: {len(solved)} problems solved so far across your registered tracks.")
        else:
            reply_lines.append("No coding problems solved yet. Log your first problem in Coding to track patterns and mistakes.")

    if not reply_lines:
        reply_lines.append(
            f"Here is your real-time summary: {len(pending_tasks)} pending tasks, {len(goals)} active goals, and {len(learning_items)} learning tracks active."
        )

    return AIResponse(
        reply="\n\n".join(reply_lines),
        context_used={
            "tasks_count": len(pending_tasks),
            "goals_count": len(goals),
            "learning_count": len(learning_items),
            "coding_count": len(coding_problems),
        }
    )


@router.get("/daily-brief")
async def get_daily_brief(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task_res = await db.execute(select(Task).where(Task.user_id == current_user.id, Task.completed == False))
    pending_tasks = task_res.scalars().all()

    goal_res = await db.execute(select(Goal).where(Goal.user_id == current_user.id))
    goals = goal_res.scalars().all()

    bullets = []
    if pending_tasks:
        bullets.append({
            "id": 1,
            "text": f"{len(pending_tasks)} task(s) scheduled and awaiting completion today.",
            "type": "warning" if len(pending_tasks) > 3 else "primary"
        })
    if goals:
        bullets.append({
            "id": 2,
            "text": f"{len(goals)} active goal(s) currently being tracked.",
            "type": "accent"
        })

    return {
        "title": "AI Daily Brief",
        "subtitle": "Here's what deserves your attention today.",
        "bullets": bullets
    }
