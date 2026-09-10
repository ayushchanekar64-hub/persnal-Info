from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SubtaskBase(BaseModel):
    title: str
    completed: Optional[bool] = False


class SubtaskCreate(SubtaskBase):
    pass


class SubtaskResponse(SubtaskBase):
    id: str
    task_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "Engineering"
    priority: Optional[str] = "High"
    status: Optional[str] = "To Do"
    completed: Optional[bool] = False
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    estimated_time: Optional[str] = None
    estimated_duration: Optional[str] = None
    reminder: Optional[str] = None
    recurring_schedule: Optional[str] = None
    goal_id: Optional[str] = None
    goal_title: Optional[str] = None
    tags: Optional[str] = "[]"
    notes: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    completed: Optional[bool] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    estimated_time: Optional[str] = None
    estimated_duration: Optional[str] = None
    reminder: Optional[str] = None
    recurring_schedule: Optional[str] = None
    goal_id: Optional[str] = None
    goal_title: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None


class TaskResponse(TaskBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    subtasks: List[SubtaskResponse] = []
    model_config = ConfigDict(from_attributes=True)
