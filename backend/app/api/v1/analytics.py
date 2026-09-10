from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.task import Task
from backend.app.models.goal import Goal
from backend.app.models.habit import Habit, HabitLog
from backend.app.models.learning import LearningItem, LearningSession
from backend.app.models.coding import CodingProblem
from backend.app.models.finance import FinanceTransaction
from backend.app.schemas.analytics import AnalyticsSummary, DashboardStats, DayAnalytics
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Tasks
    task_res = await db.execute(select(Task).where(Task.user_id == current_user.id))
    all_tasks = task_res.scalars().all()
    tasks_total = len(all_tasks)
    tasks_completed = len([t for t in all_tasks if t.completed])
    tasks_remaining = tasks_total - tasks_completed
    task_completion_rate = round((tasks_completed / (tasks_total or 1)) * 100, 1) if tasks_total > 0 else 0.0

    # 2. Goals
    goal_res = await db.execute(select(Goal).where(Goal.user_id == current_user.id))
    all_goals = goal_res.scalars().all()
    active_goals = len([g for g in all_goals if g.status != "Completed"])

    # 3. Learning
    learn_res = await db.execute(select(LearningItem).where(LearningItem.user_id == current_user.id))
    all_learning = learn_res.scalars().all()
    total_learning_hours = round(sum(item.total_hours for item in all_learning), 1)

    # 4. Coding
    coding_res = await db.execute(select(CodingProblem).where(CodingProblem.user_id == current_user.id))
    all_coding = coding_res.scalars().all()
    solved_problems = [p for p in all_coding if p.status in ["Solved", "Mastered"]]
    coding_solved_count = len(solved_problems)

    # Difficulty breakdown
    diff_counts = {"Easy": 0, "Medium": 0, "Hard": 0}
    topic_counts: Dict[str, int] = {}
    for p in solved_problems:
        if p.difficulty in diff_counts:
            diff_counts[p.difficulty] += 1
        topic_counts[p.topic] = topic_counts.get(p.topic, 0) + 1

    top_topics = [
        {"name": k, "count": v, "percentage": round((v / (coding_solved_count or 1)) * 100, 1)}
        for k, v in topic_counts.items()
    ]

    # 5. Habits
    habit_res = await db.execute(select(Habit).where(Habit.user_id == current_user.id))
    all_habits = habit_res.scalars().all()
    max_streak = max([h.current_streak for h in all_habits], default=0)

    # 6. Finance
    tx_res = await db.execute(select(FinanceTransaction).where(FinanceTransaction.user_id == current_user.id))
    all_tx = tx_res.scalars().all()
    monthly_income = sum(t.amount for t in all_tx if t.type == "Income")
    monthly_expenses = sum(t.amount for t in all_tx if t.type == "Expense")
    savings = monthly_income - monthly_expenses
    savings_rate = round((savings / monthly_income) * 100, 1) if monthly_income > 0 else 0.0

    # 7. Weekly 7-day Analytics (Mon - Sun)
    days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_analytics = [DayAnalytics(day=d, tasks=0, hours=0.0, coding=0) for d in days_of_week]

    stats = DashboardStats(
        tasksRemaining=tasks_remaining,
        tasksTotal=tasks_total,
        activeGoals=active_goals,
        goalsDueSoon=0,
        learningHours=total_learning_hours,
        codingSolved=coding_solved_count,
        focusTime="0h",
        focusSessions=0,
        codingStreak=max_streak,
    )

    return AnalyticsSummary(
        stats=stats,
        weeklyAnalytics=weekly_analytics,
        taskCompletionRate=task_completion_rate,
        habitsCompletionRate=0.0,
        monthlyIncome=monthly_income,
        monthlyExpenses=monthly_expenses,
        savingsRate=savings_rate,
        codingDifficultyBreakdown=diff_counts,
        topTopics=top_topics,
    )
