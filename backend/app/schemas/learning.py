from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LearningSessionBase(BaseModel):
    hours: float = 1.0
    date: str
    notes: Optional[str] = None


class LearningSessionCreate(LearningSessionBase):
    pass


class LearningSessionResponse(LearningSessionBase):
    id: str
    learning_id: str
    user_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


from pydantic import BaseModel, ConfigDict, field_validator


class LearningBase(BaseModel):
    skill: str
    topic: Optional[str] = None
    course: Optional[str] = None
    resource_url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = "Technical"
    difficulty: Optional[str] = "Intermediate"
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    learning_date: Optional[str] = None
    duration: Optional[str] = None
    notes: Optional[str] = None
    progress: Optional[int] = 0
    status: Optional[str] = "Learning"
    confidence_level: Optional[str] = "Intermediate"

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("Progress must be between 0 and 100")
        return v


class LearningCreate(LearningBase):
    pass


class LearningUpdate(BaseModel):
    skill: Optional[str] = None
    topic: Optional[str] = None
    course: Optional[str] = None
    resource_url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    learning_date: Optional[str] = None
    duration: Optional[str] = None
    notes: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None
    confidence_level: Optional[str] = None
    last_revised: Optional[str] = None
    next_revision: Optional[str] = None

    @field_validator("progress")
    @classmethod
    def validate_progress(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("Progress must be between 0 and 100")
        return v



class LearningResponse(LearningBase):
    id: str
    user_id: str
    total_hours: float
    last_revised: Optional[str] = None
    next_revision: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    sessions: List[LearningSessionResponse] = []
    model_config = ConfigDict(from_attributes=True)
