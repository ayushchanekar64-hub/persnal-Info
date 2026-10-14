from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CodingBase(BaseModel):
    title: str
    platform: Optional[str] = "LeetCode"
    problem_url: Optional[str] = None
    topic: Optional[str] = "Arrays & Strings"
    difficulty: Optional[str] = "Medium"
    status: Optional[str] = "Solved"
    time_taken: Optional[str] = None
    time_taken_minutes: Optional[int] = 30
    attempts: Optional[int] = 1
    programming_language: Optional[str] = "Python"
    solution_notes: Optional[str] = None
    solution_code: Optional[str] = None
    mistake_learning: Optional[str] = None
    mistake: Optional[str] = None
    correct_approach: Optional[str] = None
    what_to_remember: Optional[str] = None
    tags: Optional[str] = "[]"
    solved_date: Optional[str] = None


class CodingCreate(CodingBase):
    pass


class CodingUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    problem_url: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    status: Optional[str] = None
    time_taken: Optional[str] = None
    time_taken_minutes: Optional[int] = None
    attempts: Optional[int] = None
    programming_language: Optional[str] = None
    solution_notes: Optional[str] = None
    solution_code: Optional[str] = None
    mistake_learning: Optional[str] = None
    mistake: Optional[str] = None
    correct_approach: Optional[str] = None
    what_to_remember: Optional[str] = None
    tags: Optional[str] = None
    solved_date: Optional[str] = None


class CodingResponse(CodingBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CodingSessionBase(BaseModel):
    date: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_minutes: Optional[int] = 0
    problems_solved: Optional[int] = 0
    topics_practiced: Optional[str] = None
    notes: Optional[str] = None

class CodingSessionCreate(CodingSessionBase):
    pass

class CodingSessionResponse(CodingSessionBase):
    id: str
    user_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CodingMistakeBase(BaseModel):
    problem_id: Optional[str] = None
    problem_title: Optional[str] = None
    topic: Optional[str] = None
    why_failed: Optional[str] = None
    correct_approach: Optional[str] = None
    what_to_remember: Optional[str] = None
    review_status: Optional[str] = "Needs Review"

class CodingMistakeCreate(CodingMistakeBase):
    pass

class CodingMistakeUpdate(BaseModel):
    problem_title: Optional[str] = None
    topic: Optional[str] = None
    why_failed: Optional[str] = None
    correct_approach: Optional[str] = None
    what_to_remember: Optional[str] = None
    review_status: Optional[str] = None

class CodingMistakeResponse(CodingMistakeBase):
    id: str
    user_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CodingAchievementResponse(BaseModel):
    id: str
    achievement_id: str
    unlocked_at: datetime
    model_config = ConfigDict(from_attributes=True)
