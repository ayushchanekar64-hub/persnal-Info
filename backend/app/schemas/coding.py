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
