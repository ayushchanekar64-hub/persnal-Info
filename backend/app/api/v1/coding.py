from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.coding import CodingProblem
from backend.app.models.activity import Activity
from backend.app.schemas.coding import (
    CodingCreate, CodingUpdate, CodingResponse,
    CodingSessionCreate, CodingSessionResponse,
    CodingMistakeCreate, CodingMistakeUpdate, CodingMistakeResponse,
    CodingAchievementResponse
)
from backend.app.schemas.sandbox import (
    CodeExecuteRequest, CodeExecuteResponse,
    CodeEvaluateRequest, CodeEvaluateResponse
)
from backend.app.services.code_evaluator import execute_code_sandboxed, evaluate_code_with_ai
from backend.app.api.deps import get_current_user, get_current_user_optional

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


# --- Coding Sessions ---

@router.get("/sessions", response_model=List[CodingSessionResponse])
async def list_coding_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from backend.app.models.coding import CodingSession
    query = select(CodingSession).where(CodingSession.user_id == current_user.id).order_by(CodingSession.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/sessions", response_model=CodingSessionResponse, status_code=status.HTTP_201_CREATED)
async def log_coding_session(
    session_in: CodingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from backend.app.models.coding import CodingSession
    session = CodingSession(
        user_id=current_user.id,
        date=session_in.date,
        start_time=session_in.start_time,
        end_time=session_in.end_time,
        duration_minutes=session_in.duration_minutes,
        problems_solved=session_in.problems_solved,
        topics_practiced=session_in.topics_practiced,
        notes=session_in.notes,
    )
    db.add(session)
    
    activity = Activity(
        user_id=current_user.id,
        type="coding_session",
        title=f"Completed a {session.duration_minutes}m coding session",
        time_label="Just now",
        color="var(--primary-600)",
    )
    db.add(activity)
    
    await db.commit()
    await db.refresh(session)
    return session


# --- Coding Mistakes ---

@router.get("/mistakes", response_model=List[CodingMistakeResponse])
async def list_coding_mistakes(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from backend.app.models.coding import CodingMistake
    query = select(CodingMistake).where(CodingMistake.user_id == current_user.id).order_by(CodingMistake.created_at.desc())
    if status:
        query = query.where(CodingMistake.review_status == status)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/mistakes", response_model=CodingMistakeResponse, status_code=status.HTTP_201_CREATED)
async def log_coding_mistake(
    mistake_in: CodingMistakeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from backend.app.models.coding import CodingMistake
    mistake = CodingMistake(
        user_id=current_user.id,
        problem_id=mistake_in.problem_id,
        problem_title=mistake_in.problem_title,
        topic=mistake_in.topic,
        why_failed=mistake_in.why_failed,
        correct_approach=mistake_in.correct_approach,
        what_to_remember=mistake_in.what_to_remember,
        review_status=mistake_in.review_status or "Needs Review",
    )
    db.add(mistake)
    await db.commit()
    await db.refresh(mistake)
    return mistake


@router.patch("/mistakes/{mistake_id}", response_model=CodingMistakeResponse)
async def update_coding_mistake(
    mistake_id: str,
    mistake_update: CodingMistakeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from backend.app.models.coding import CodingMistake
    result = await db.execute(
        select(CodingMistake).where(CodingMistake.id == mistake_id, CodingMistake.user_id == current_user.id)
    )
    mistake = result.scalars().first()
    if not mistake:
        raise HTTPException(status_code=404, detail="Coding mistake not found")

    for field, val in mistake_update.model_dump(exclude_unset=True).items():
        setattr(mistake, field, val)

    db.add(mistake)
    await db.commit()
    await db.refresh(mistake)
    return mistake


@router.delete("/mistakes/{mistake_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coding_mistake(
    mistake_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from backend.app.models.coding import CodingMistake
    result = await db.execute(
        select(CodingMistake).where(CodingMistake.id == mistake_id, CodingMistake.user_id == current_user.id)
    )
    mistake = result.scalars().first()
    if not mistake:
        raise HTTPException(status_code=404, detail="Coding mistake not found")

    await db.delete(mistake)
    await db.commit()
    return None


# --- Coding Achievements ---

@router.get("/achievements", response_model=List[CodingAchievementResponse])
async def list_coding_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from backend.app.models.coding import CodingAchievement
    query = select(CodingAchievement).where(CodingAchievement.user_id == current_user.id).order_by(CodingAchievement.unlocked_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


# --- Specific Problem by ID (Parameterized route at bottom) ---

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


# --- Safe Code Execution & AI Judge Sandbox ---

@router.post("/execute", response_model=CodeExecuteResponse)
async def execute_code(
    payload: CodeExecuteRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Executes Python or JavaScript safely in an isolated sandbox subprocess.
    Captures stdout, stderr, exit code, and execution time.
    """
    return await execute_code_sandboxed(payload)


@router.post("/evaluate", response_model=CodeEvaluateResponse)
async def evaluate_code(
    payload: CodeEvaluateRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    The Brain / AI Judge:
    Evaluates whether code ran properly, whether the answer is correct ('answer right de rha hai kya'),
    diagnoses logic errors, off-by-one bugs, complexity, and provides an actionable diff fix.
    """
    return await evaluate_code_with_ai(payload)


