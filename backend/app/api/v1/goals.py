from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.goal import Goal, Milestone
from backend.app.models.activity import Activity
from backend.app.schemas.goal import (
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    MilestoneCreate,
    MilestoneResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[GoalResponse])
async def list_goals(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Goal)
        .options(selectinload(Goal.milestones))
        .where(Goal.user_id == current_user.id)
        .order_by(Goal.created_at.desc())
    )
    if category:
        query = query.where(Goal.category == category)
    if status:
        query = query.where(Goal.status == status)

    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_in: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target = goal_in.target_date or goal_in.deadline
    goal = Goal(
        user_id=current_user.id,
        name=goal_in.name,
        description=goal_in.description,
        category=goal_in.category or "Career",
        priority=goal_in.priority or "High",
        start_date=goal_in.start_date,
        target_date=target,
        deadline=target,
        progress=goal_in.progress or 0,
        status=goal_in.status or "In Progress",
        color=goal_in.color or "primary",
        tags=goal_in.tags or "[]",
    )
    db.add(goal)
    await db.flush()

    # Activity log
    activity = Activity(
        user_id=current_user.id,
        type="goal",
        title=f'Created goal "{goal.name}"',
        time_label="Just now",
        color="var(--accent-600)",
    )
    db.add(activity)
    await db.commit()

    result = await db.execute(
        select(Goal).options(selectinload(Goal.milestones)).where(Goal.id == goal.id)
    )
    return result.scalars().first()


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Goal)
        .options(selectinload(Goal.milestones))
        .where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalars().first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.patch("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    goal_update: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Goal)
        .options(selectinload(Goal.milestones))
        .where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalars().first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    old_progress = goal.progress
    update_dict = goal_update.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(goal, field, val)

    if "progress" in update_dict and goal.progress != old_progress:
        activity = Activity(
            user_id=current_user.id,
            type="goal",
            title=f'Updated "{goal.name}" to {goal.progress}%',
            time_label="Just now",
            color="var(--accent-600)",
        )
        db.add(activity)

    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalars().first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await db.delete(goal)
    await db.commit()
    return None


@router.post("/{goal_id}/milestones", response_model=MilestoneResponse)
async def add_milestone(
    goal_id: str,
    milestone_in: MilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalars().first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    milestone = Milestone(
        goal_id=goal.id,
        title=milestone_in.title,
        target_date=milestone_in.target_date,
        completed=milestone_in.completed or False,
    )
    db.add(milestone)
    await db.commit()
    await db.refresh(milestone)
    return milestone
