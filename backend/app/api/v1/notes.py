from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.note import Note
from backend.app.models.activity import Activity
from backend.app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[NoteResponse])
async def list_notes(
    category: Optional[str] = Query(None),
    favorites_only: Optional[bool] = Query(False),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Note).where(Note.user_id == current_user.id).order_by(Note.is_pinned.desc(), Note.updated_at.desc())
    if category:
        query = query.where(Note.category == category)
    if favorites_only:
        query = query.where(Note.is_favorite == True)

    result = await db.execute(query)
    notes = result.scalars().all()

    if search:
        s = search.lower()
        notes = [n for n in notes if s in n.title.lower() or s in n.content.lower()]

    return notes


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    note = Note(
        user_id=current_user.id,
        title=note_in.title,
        content=note_in.content,
        category=note_in.category or "General",
        tags=note_in.tags or "[]",
        goal_id=note_in.goal_id,
        learning_id=note_in.learning_id,
        is_favorite=note_in.is_favorite or False,
        is_pinned=note_in.is_pinned or False,
    )
    db.add(note)
    await db.flush()

    activity = Activity(
        user_id=current_user.id,
        type="note",
        title=f'Created note "{note.title}"',
        time_label="Just now",
        color="var(--warning-600)",
    )
    db.add(activity)
    await db.commit()
    await db.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_update: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    for field, val in note_update.model_dump(exclude_unset=True).items():
        setattr(note, field, val)

    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.user_id == current_user.id)
    )
    note = result.scalars().first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    await db.delete(note)
    await db.commit()
    return None
