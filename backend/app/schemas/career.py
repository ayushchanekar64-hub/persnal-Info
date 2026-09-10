from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class InterviewBase(BaseModel):
    company: str
    role: str
    interview_date: str
    round_name: Optional[str] = "Technical Round"
    questions: Optional[str] = None
    preparation: Optional[str] = None
    performance: Optional[str] = None
    feedback: Optional[str] = None
    notes: Optional[str] = None


class InterviewCreate(InterviewBase):
    application_id: str


class InterviewResponse(InterviewBase):
    id: str
    application_id: str
    user_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ApplicationBase(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    job_url: Optional[str] = None
    applied_date: Optional[str] = None
    status: Optional[str] = "Applied"
    salary: Optional[str] = None
    contact: Optional[str] = None
    notes: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    job_url: Optional[str] = None
    applied_date: Optional[str] = None
    status: Optional[str] = None
    salary: Optional[str] = None
    contact: Optional[str] = None
    notes: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    interviews: List[InterviewResponse] = []
    model_config = ConfigDict(from_attributes=True)


class CareerProfileUpdate(BaseModel):
    target_role: Optional[str] = None
    skills: Optional[str] = None
    target_skills: Optional[str] = None
    education: Optional[str] = None
    certifications: Optional[str] = None
    projects: Optional[str] = None
    experience: Optional[str] = None


class CareerProfileResponse(BaseModel):
    id: str
    user_id: str
    target_role: Optional[str] = None
    skills: Optional[str] = "[]"
    target_skills: Optional[str] = "[]"
    education: Optional[str] = None
    certifications: Optional[str] = None
    projects: Optional[str] = None
    experience: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
