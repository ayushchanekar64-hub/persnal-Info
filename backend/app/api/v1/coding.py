from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.coding import CodingProblem
from backend.app.models.activity import Activity
from backend.app.schemas.coding import CodingCreate, CodingUpdate, CodingResponse
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[CodingResponse])
async def list_coding_problems(
    topic: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(CodingProblem).where(CodingProblem.user_id == current_user.id).order_by(CodingProblem.created_at.desc())
    if topic:
        query = query.where(CodingProblem.topic == topic)
    if difficulty:
        query = query.where(CodingProblem.difficulty == difficulty)
    if status:
        query = query.where(CodingProblem.status == status)

    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=CodingResponse, status_code=status.HTTP_201_CREATED)
async def log_coding_problem(
    coding_in: CodingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    problem = CodingProblem(
        user_id=current_user.id,
        title=coding_in.title,
        platform=coding_in.platform or "LeetCode",
        problem_url=coding_in.problem_url,
        topic=coding_in.topic or "Arrays & Strings",
        difficulty=coding_in.difficulty or "Medium",
        status=coding_in.status or "Solved",
        time_taken=coding_in.time_taken,
        time_taken_minutes=coding_in.time_taken_minutes or 30,
        attempts=coding_in.attempts or 1,
        programming_language=coding_in.programming_language or "Python",
        solution_notes=coding_in.solution_notes,
        solution_code=coding_in.solution_code,
        mistake_learning=coding_in.mistake_learning,
        mistake=coding_in.mistake or coding_in.mistake_learning,
        correct_approach=coding_in.correct_approach,
        what_to_remember=coding_in.what_to_remember,
        tags=coding_in.tags or "[]",
        solved_date=coding_in.solved_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    )
    db.add(problem)
    await db.flush()

    activity = Activity(
        user_id=current_user.id,
        type="coding",
        title=f'Solved "{problem.title}" ({problem.difficulty})',
        time_label="Just now",
        color="var(--success-600)",
    )
    db.add(activity)
    await db.commit()
    await db.refresh(problem)
    return problem


@router.get("/{problem_id}", response_model=CodingResponse)
async def get_coding_problem(
    problem_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CodingProblem).where(CodingProblem.id == problem_id, CodingProblem.user_id == current_user.id)
    )
    problem = result.scalars().first()
    if not problem:
        raise HTTPException(status_code=404, detail="Coding problem record not found")
    return problem


@router.patch("/{problem_id}", response_model=CodingResponse)
async def update_coding_problem(
    problem_id: str,
    coding_update: CodingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CodingProblem).where(CodingProblem.id == problem_id, CodingProblem.user_id == current_user.id)
    )
    problem = result.scalars().first()
    if not problem:
        raise HTTPException(status_code=404, detail="Coding problem record not found")

    for field, val in coding_update.model_dump(exclude_unset=True).items():
        setattr(problem, field, val)

    db.add(problem)
    await db.commit()
    await db.refresh(problem)
    return problem


@router.delete("/{problem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coding_problem(
    problem_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CodingProblem).where(CodingProblem.id == problem_id, CodingProblem.user_id == current_user.id)
    )
    problem = result.scalars().first()
    if not problem:
        raise HTTPException(status_code=404, detail="Coding problem record not found")

    await db.delete(problem)
    await db.commit()
    return None
