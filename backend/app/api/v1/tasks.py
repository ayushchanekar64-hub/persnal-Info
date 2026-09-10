from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.task import Task, Subtask
from backend.app.models.goal import Goal
from backend.app.models.activity import Activity
from backend.app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    SubtaskCreate,
    SubtaskResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    view: Optional[str] = Query(None),  # today, upcoming, overdue, completed, all
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Task)
        .options(selectinload(Task.subtasks))
        .where(Task.user_id == current_user.id)
        .order_by(Task.created_at.desc())
    )

    if priority and priority != "All":
        query = query.where(Task.priority == priority)

    if view == "today":
        query = query.where(Task.completed == False)
    elif view == "completed":
        query = query.where(Task.completed == True)

    result = await db.execute(query)
    tasks = result.scalars().all()

    if search:
        s = search.lower()
        tasks = [t for t in tasks if s in t.title.lower() or (t.category and s in t.category.lower())]

    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    goal_title = task_in.goal_title
    if task_in.goal_id:
        goal_res = await db.execute(
            select(Goal).where(Goal.id == task_in.goal_id, Goal.user_id == current_user.id)
        )
        goal_obj = goal_res.scalars().first()
        if not goal_obj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Linked goal not found or does not belong to your workspace"
            )
        goal_title = goal_obj.name

    est = task_in.estimated_time or task_in.estimated_duration

    task = Task(
        user_id=current_user.id,
        title=task_in.title,
        description=task_in.description,
        category=task_in.category or "Engineering",
        priority=task_in.priority or "High",
        status=task_in.status or "To Do",
        completed=task_in.completed or (task_in.status == "Completed"),
        start_date=task_in.start_date,
        due_date=task_in.due_date,
        due_time=task_in.due_time,
        estimated_time=est,
        estimated_duration=est,
        reminder=task_in.reminder,
        recurring_schedule=task_in.recurring_schedule,
        goal_id=task_in.goal_id,
        goal_title=goal_title,
        tags=task_in.tags or "[]",
        notes=task_in.notes,
    )
    db.add(task)
    await db.flush()

    # Log activity
    activity = Activity(
        user_id=current_user.id,
        type="task",
        title=f'Created task "{task.title}"',
        time_label="Just now",
        color="var(--primary-600)",
    )
    db.add(activity)
    await db.commit()

    # Reload with subtasks
    result = await db.execute(select(Task).options(selectinload(Task.subtasks)).where(Task.id == task.id))
    return result.scalars().first()


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.subtasks))
        .where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.subtasks))
        .where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_dict = task_update.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(task, field, val)

    if "completed" in update_dict:
        if task.completed:
            task.completed_at = datetime.now(timezone.utc)
            task.status = "Completed"
        else:
            task.completed_at = None
            task.status = "In Progress"

    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.post("/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task_completion(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task)
        .options(selectinload(Task.subtasks))
        .where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed
    if task.completed:
        task.completed_at = datetime.now(timezone.utc)
        task.status = "Completed"
        title = f'Completed "{task.title}"'
        color = "var(--success-500)"
    else:
        task.completed_at = None
        task.status = "In Progress"
        title = f'Reopened "{task.title}"'
        color = "var(--primary-600)"

    # Log activity
    activity = Activity(
        user_id=current_user.id,
        type="task",
        title=title,
        time_label="Just now",
        color=color,
    )
    db.add(activity)
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()
    return None


@router.post("/{task_id}/subtasks", response_model=SubtaskResponse)
async def add_subtask(
    task_id: str,
    subtask_in: SubtaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    subtask = Subtask(task_id=task.id, title=subtask_in.title, completed=subtask_in.completed or False)
    db.add(subtask)
    await db.commit()
    await db.refresh(subtask)
    return subtask
