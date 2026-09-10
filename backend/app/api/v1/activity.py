from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.activity import Activity
from backend.app.schemas.activity import ActivityResponse
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[ActivityResponse])
async def list_recent_activity(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity)
        .where(Activity.user_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
