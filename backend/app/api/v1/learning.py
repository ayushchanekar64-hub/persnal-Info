from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.learning import LearningItem, LearningSession
from backend.app.models.activity import Activity
from backend.app.schemas.learning import (
    LearningCreate,
    LearningUpdate,
    LearningResponse,
    LearningSessionCreate,
    LearningSessionResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[LearningResponse])
async def list_learning_items(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningItem)
        .options(selectinload(LearningItem.sessions))
        .where(LearningItem.user_id == current_user.id)
        .order_by(LearningItem.updated_at.desc())
    )
    return result.scalars().all()


import re


def parse_duration_hours(d_str: Optional[str]) -> float:
    if not d_str:
        return 1.0
    d_str = str(d_str).strip().lower()
    try:
        return float(d_str)
    except ValueError:
        pass
    h = 0.0
    m = 0.0
    h_match = re.search(r'(\d+(?:\.\d+)?)\s*h', d_str)
    if h_match:
        h = float(h_match.group(1))
    m_match = re.search(r'(\d+(?:\.\d+)?)\s*m', d_str)
    if m_match:
        m = float(m_match.group(1))
    total = h + (m / 60.0)
    return total if total > 0 else 1.0


@router.post("", response_model=LearningResponse, status_code=status.HTTP_201_CREATED)
async def create_learning_item(
    item_in: LearningCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    hours = parse_duration_hours(item_in.duration)
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    date_val = item_in.learning_date or item_in.start_date or today_str

    item = LearningItem(
        user_id=current_user.id,
        skill=item_in.skill,
        topic=item_in.topic,
        course=item_in.course,
        resource_url=item_in.resource_url,
        description=item_in.description,
        category=item_in.category or "Technical",
        difficulty=item_in.difficulty or "Intermediate",
        start_date=item_in.start_date or date_val,
        target_date=item_in.target_date,
        learning_date=date_val,
        duration=item_in.duration or f"{hours}h",
        notes=item_in.notes,
        total_hours=hours,
        progress=item_in.progress or 0,
        status=item_in.status or "Learning",
        confidence_level=item_in.confidence_level or "Intermediate",
    )
    db.add(item)
    await db.flush()

    # Record LearningSession telemetry
    session = LearningSession(
        learning_id=item.id,
        user_id=current_user.id,
        hours=hours,
        date=date_val,
        notes=item_in.notes,
    )
    db.add(session)

    activity = Activity(
        user_id=current_user.id,
        type="learning",
        title=f'Logged learning on "{item.skill}"' + (f' ({item.topic})' if item.topic else ''),
        time_label="Just now",
        color="var(--info-500)",
    )
    db.add(activity)
    await db.commit()

    result = await db.execute(
        select(LearningItem).options(selectinload(LearningItem.sessions)).where(LearningItem.id == item.id)
    )
    return result.scalars().first()


@router.post("/{item_id}/sessions", response_model=LearningSessionResponse)
async def log_learning_session(
    item_id: str,
    session_in: LearningSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningItem).where(LearningItem.id == item_id, LearningItem.user_id == current_user.id)
    )
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Learning item not found")

    session = LearningSession(
        learning_id=item.id,
        user_id=current_user.id,
        hours=session_in.hours,
        date=session_in.date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        notes=session_in.notes,
    )
    db.add(session)
    item.total_hours += session_in.hours
    item.last_revised = session.date

    activity = Activity(
        user_id=current_user.id,
        type="learning",
        title=f'Logged {session_in.hours}h on "{item.skill}"',
        time_label="Just now",
        color="var(--info-500)",
    )
    db.add(activity)
    await db.commit()
    await db.refresh(session)
    return session


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_learning_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearningItem).where(LearningItem.id == item_id, LearningItem.user_id == current_user.id)
    )
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Learning item not found")

    await db.delete(item)
    await db.commit()
    return None
