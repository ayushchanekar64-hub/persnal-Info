from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class InboxCaptureCreate(BaseModel):
    raw_content: str
    title: Optional[str] = None
    source: Optional[str] = "desktop_hud"
    suggested_type: Optional[str] = "Idea"
    tags: Optional[List[str]] = []
    priority: Optional[str] = "Medium"


class InboxItemUpdate(BaseModel):
    raw_content: Optional[str] = None
    title: Optional[str] = None
    suggested_type: Optional[str] = None
    tags: Optional[List[str]] = None
    priority: Optional[str] = None
    is_processed: Optional[bool] = None
    processed_as: Optional[str] = None


class InboxConvertRequest(BaseModel):
    target_type: str  # 'task' | 'note' | 'goal' | 'learning' | 'archive'
    title: Optional[str] = None
    category: Optional[str] = None
    additional_notes: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None


class InboxItemResponse(BaseModel):
    id: str
    user_id: str
    raw_content: str
    title: Optional[str] = None
    source: str
    suggested_type: str
    tags: str
    priority: str
    is_processed: bool
    processed_as: Optional[str] = None
    target_entity_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
