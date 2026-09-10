from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MilestoneBase(BaseModel):
    title: str
    target_date: Optional[str] = None
    completed: Optional[bool] = False


class MilestoneCreate(MilestoneBase):
    pass


class MilestoneResponse(MilestoneBase):
    id: str
    goal_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


from pydantic import BaseModel, ConfigDict, field_validator, model_validator


class GoalBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = "Career"
    priority: Optional[str] = "High"
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    deadline: Optional[str] = None
    progress: Optional[int] = 0
    status: Optional[str] = "In Progress"
    color: Optional[str] = "primary"
    tags: Optional[str] = "[]"

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("Progress must be between 0 and 100")
        return v

    @model_validator(mode="after")
    def validate_dates(self):
        start = self.start_date
        target = self.target_date or self.deadline
        if start and target:
            if len(start) == 10 and len(target) == 10 and target < start:
                raise ValueError("Target date cannot be before start date")
        return self


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    deadline: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None
    color: Optional[str] = None
    tags: Optional[str] = None

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("Progress must be between 0 and 100")
        return v



class GoalResponse(GoalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    milestones: List[MilestoneResponse] = []
    model_config = ConfigDict(from_attributes=True)
