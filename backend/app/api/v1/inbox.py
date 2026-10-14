import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.inbox import InboxItem
from backend.app.models.task import Task
from backend.app.models.note import Note
from backend.app.models.goal import Goal
from backend.app.models.learning import LearningItem
from backend.app.models.activity import Activity
from backend.app.schemas.inbox import (
    InboxCaptureCreate,
    InboxItemUpdate,
    InboxConvertRequest,
    InboxItemResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter()


def detect_thought_nature(text: str) -> str:
    """Fast local classifier for instant zero-latency intelligence."""
    low = text.strip().lower()
    if any(low.startswith(w) for w in ["todo", "fix", "call", "buy", "send", "email", "submit", "check", "clean", "schedule"]):
        return "Task"
    if any(w in low for w in ["book", "read", "course", "watch", "podcast", "tutorial", "learn", "study"]):
        return "Learning"
    if any(w in low for w in ["goal", "target", "milestone", "achieve", "hit ", "launch "]):
        return "Goal"
    if any(w in low for w in ["habit", "daily", "every day", "morning", "routine"]):
        return "Habit"
    return "Idea"


@router.post("/capture", response_model=InboxItemResponse, status_code=status.HTTP_201_CREATED)
async def quick_capture(
    item_in: InboxCaptureCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sub-50ms instant thought dump endpoint."""
    content = item_in.raw_content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Cannot capture empty thought.")

    first_line = content.split("\n")[0].strip()
    derived_title = item_in.title or (first_line[:80] + ("..." if len(first_line) > 80 else ""))
    detected_type = item_in.suggested_type if item_in.suggested_type != "Idea" else detect_thought_nature(content)

    tags_json = json.dumps(item_in.tags) if item_in.tags else "[]"

    inbox_item = InboxItem(
        user_id=current_user.id,
        raw_content=content,
        title=derived_title,
        source=item_in.source or "desktop_hud",
        suggested_type=detected_type,
        tags=tags_json,
        priority=item_in.priority or "Medium",
        is_processed=False,
    )
    db.add(inbox_item)

    # Log activity for capture telemetry
    activity = Activity(
        user_id=current_user.id,
        type="inbox",
        title=f'Quick-captured "{derived_title[:50]}"',
        time_label="Just now",
        color="var(--accent-purple)",
    )
    db.add(activity)

    await db.commit()
    await db.refresh(inbox_item)
    return inbox_item


@router.get("", response_model=List[InboxItemResponse])
async def list_inbox_items(
    include_processed: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve inbox thoughts with unprocessed items prioritized."""
    query = select(InboxItem).where(InboxItem.user_id == current_user.id)
    if not include_processed:
        query = query.where(InboxItem.is_processed == False)
    query = query.order_by(InboxItem.created_at.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{item_id}", response_model=InboxItemResponse)
async def update_inbox_item(
    item_id: str,
    item_update: InboxItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InboxItem).where(InboxItem.id == item_id, InboxItem.user_id == current_user.id)
    )
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Inbox item not found.")

    update_dict = item_update.model_dump(exclude_unset=True)
    if "tags" in update_dict and isinstance(update_dict["tags"], list):
        update_dict["tags"] = json.dumps(update_dict["tags"])

    for field, val in update_dict.items():
        setattr(item, field, val)

    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inbox_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InboxItem).where(InboxItem.id == item_id, InboxItem.user_id == current_user.id)
    )
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Inbox item not found.")

    await db.delete(item)
    await db.commit()
    return None


@router.post("/{item_id}/convert", status_code=status.HTTP_200_OK)
async def convert_inbox_item(
    item_id: str,
    conv: InboxConvertRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """One-click conversion of a raw brain-dump into a Task, Note, Goal, or Learning item."""
    result = await db.execute(
        select(InboxItem).where(InboxItem.id == item_id, InboxItem.user_id == current_user.id)
    )
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Inbox item not found.")

    target_type = conv.target_type.lower()
    title = conv.title or item.title or item.raw_content[:80]
    category = conv.category or "General"
    created_id = None

    if target_type == "task":
        task = Task(
            user_id=current_user.id,
            title=title,
            description=conv.additional_notes or item.raw_content,
            category=category,
            priority=conv.priority or item.priority or "Medium",
            due_date=conv.due_date,
            status="In Progress",
            completed=False,
        )
        db.add(task)
        await db.flush()
        created_id = task.id

    elif target_type == "note":
        note = Note(
            user_id=current_user.id,
            title=title,
            content=f"{item.raw_content}\n\n---\n*Captured from Frictionless Inbox*",
            category=category,
            tags=item.tags or "[]",
        )
        db.add(note)
        await db.flush()
        created_id = note.id

    elif target_type == "goal":
        goal = Goal(
            user_id=current_user.id,
            name=title,
            description=conv.additional_notes or item.raw_content,
            category=category,
            status="In Progress",
            progress=0,
            priority=conv.priority or "Medium",
            target_date=conv.due_date or "Next Quarter",
        )
        db.add(goal)
        await db.flush()
        created_id = goal.id

    elif target_type == "learning":
        learn = LearningItem(
            user_id=current_user.id,
            skill=title,
            topic=category,
            status="Active",
            total_hours=0.5,
            notes=conv.additional_notes or item.raw_content,
        )
        db.add(learn)
        await db.flush()
        created_id = learn.id

    # Mark the inbox item as triaged
    item.is_processed = True
    item.processed_as = target_type
    item.target_entity_id = created_id
    db.add(item)

    activity = Activity(
        user_id=current_user.id,
        type="inbox_triaged",
        title=f'Triaged inbox thought into {target_type.title()}: "{title[:40]}"',
        time_label="Just now",
        color="var(--accent-purple)",
    )
    db.add(activity)

    await db.commit()
    return {
        "success": True,
        "item_id": item.id,
        "converted_to": target_type,
        "target_entity_id": created_id,
        "message": f"Successfully converted to {target_type.title()}!",
    }
