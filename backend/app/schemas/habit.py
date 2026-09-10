from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class HabitLogBase(BaseModel):
    date: str  # YYYY-MM-DD
    completed: Optional[bool] = True
    count: Optional[int] = 1
    notes: Optional[str] = None


class HabitLogCreate(HabitLogBase):
    pass


class HabitLogResponse(HabitLogBase):
    id: str
    habit_id: str
    user_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class HabitBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = "Productivity"
    frequency: Optional[str] = "Daily"
    target_count: Optional[int] = 1
    reminder_time: Optional[str] = None
    start_date: Optional[str] = None


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    frequency: Optional[str] = None
    target_count: Optional[int] = None
    reminder_time: Optional[str] = None
    is_archived: Optional[bool] = None


class HabitResponse(HabitBase):
    id: str
    user_id: str
    current_streak: int
    best_streak: int
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    logs: List[HabitLogResponse] = []
    model_config = ConfigDict(from_attributes=True)
