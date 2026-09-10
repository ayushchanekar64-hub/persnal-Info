from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NoteBase(BaseModel):
    title: str
    content: str
    category: Optional[str] = "General"
    tags: Optional[str] = "[]"
    goal_id: Optional[str] = None
    learning_id: Optional[str] = None
    is_favorite: Optional[bool] = False
    is_pinned: Optional[bool] = False


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    goal_id: Optional[str] = None
    learning_id: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_pinned: Optional[bool] = None


class NoteResponse(NoteBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
