from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: Optional[str] = None
    type: str
    link: Optional[str] = None
    read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
