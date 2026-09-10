from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ActivityCreate(BaseModel):
    type: str
    title: str
    time_label: Optional[str] = "Just now"
    color: Optional[str] = "var(--primary-600)"
    metadata_json: Optional[str] = "{}"


class ActivityResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    time_label: str
    color: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
