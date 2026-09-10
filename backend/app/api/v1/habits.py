from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.habit import Habit, HabitLog
from backend.app.models.activity import Activity
from backend.app.schemas.habit import (
    HabitCreate,
    HabitUpdate,
    HabitResponse,
    HabitLogCreate,
    HabitLogResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[HabitResponse])
async def list_habits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Habit)
        .options(selectinload(Habit.logs))
        .where(Habit.user_id == current_user.id, Habit.is_archived == False)
        .order_by(Habit.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    habit_in: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    habit = Habit(
        user_id=current_user.id,
        name=habit_in.name,
        description=habit_in.description,
        category=habit_in.category or "Productivity",
        frequency=habit_in.frequency or "Daily",
        target_count=habit_in.target_count or 1,
        reminder_time=habit_in.reminder_time,
        start_date=habit_in.start_date,
    )
    db.add(habit)
    await db.flush()

    # Log activity
    activity = Activity(
        user_id=current_user.id,
        type="habit",
        title=f'Started habit "{habit.name}"',
        time_label="Just now",
        color="var(--warning-500)",
    )
    db.add(activity)
    await db.commit()

    result = await db.execute(
        select(Habit).options(selectinload(Habit.logs)).where(Habit.id == habit.id)
    )
    return result.scalars().first()


@router.post("/{habit_id}/checkin", response_model=HabitResponse)
async def checkin_habit(
    habit_id: str,
    date_str: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Habit)
        .options(selectinload(Habit.logs))
        .where(Habit.id == habit_id, Habit.user_id == current_user.id)
    )
    habit = result.scalars().first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    target_date = date_str or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Check if already checked in today
    existing_log = next((l for l in habit.logs if l.date == target_date), None)
    if existing_log:
        existing_log.completed = not existing_log.completed
        if not existing_log.completed and habit.current_streak > 0:
            habit.current_streak -= 1
        elif existing_log.completed:
            habit.current_streak += 1
            if habit.current_streak > habit.best_streak:
                habit.best_streak = habit.current_streak
    else:
        new_log = HabitLog(
            habit_id=habit.id,
            user_id=current_user.id,
            date=target_date,
            completed=True,
            count=1,
        )
        db.add(new_log)
        habit.current_streak += 1
        if habit.current_streak > habit.best_streak:
            habit.best_streak = habit.current_streak

        activity = Activity(
            user_id=current_user.id,
            type="habit",
            title=f'Completed habit "{habit.name}" ({habit.current_streak}d streak)',
            time_label="Just now",
            color="var(--warning-500)",
        )
        db.add(activity)

    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return habit


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == current_user.id)
    )
    habit = result.scalars().first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    await db.delete(habit)
    await db.commit()
    return None
