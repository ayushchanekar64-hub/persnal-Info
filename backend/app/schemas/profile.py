from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# 1. Basic Profile
class BasicProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_photo: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    primary_email: Optional[str] = None
    alternate_email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    bio: Optional[str] = None


class BasicProfileResponse(BasicProfileUpdate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# 2. Education
class EducationCreate(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = False
    grade_or_gpa: Optional[str] = None
    result_status: Optional[str] = None
    description: Optional[str] = None


class EducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    grade_or_gpa: Optional[str] = None
    result_status: Optional[str] = None
    description: Optional[str] = None


class EducationResponse(EducationCreate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# 3. Certifications
class CertificationCreate(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    file_url: Optional[str] = None


class CertificationUpdate(BaseModel):
    name: Optional[str] = None
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    file_url: Optional[str] = None


class CertificationResponse(CertificationCreate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# 4. Experience
class ExperienceCreate(BaseModel):
    company: str
    role: str
    employment_type: Optional[str] = "Full-time"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = False
    location: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    achievements: Optional[str] = None


class ExperienceUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    employment_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    location: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    achievements: Optional[str] = None


class ExperienceResponse(ExperienceCreate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# 5. Career Preferences
class CareerPreferenceUpdate(BaseModel):
    current_role: Optional[str] = None
    current_company: Optional[str] = None
    employment_type: Optional[str] = None
    work_location: Optional[str] = None
    years_of_experience: Optional[str] = None
    skills_summary: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[str] = None
    expected_salary: Optional[str] = None
    notice_period: Optional[str] = None
    professional_summary: Optional[str] = None
    resume_url: Optional[str] = None
    projects_summary: Optional[str] = None
    achievements_summary: Optional[str] = None


class CareerPreferenceResponse(CareerPreferenceUpdate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# 6. Skills
class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = "Technical"
    proficiency: Optional[str] = "Intermediate"
    years_of_experience: Optional[float] = 1.0
    last_used: Optional[str] = None
    is_verified: Optional[bool] = False
    verification_url: Optional[str] = None


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[str] = None
    years_of_experience: Optional[float] = None
    last_used: Optional[str] = None
    is_verified: Optional[bool] = None
    verification_url: Optional[str] = None


class SkillResponse(SkillCreate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# 7. Professional Links
class LinksUpdate(BaseModel):
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    leetcode: Optional[str] = None
    hackerrank: Optional[str] = None
    stackoverflow: Optional[str] = None
    twitter_x: Optional[str] = None
    other_links: Optional[str] = None


class LinksResponse(LinksUpdate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# 8. Preferences
class PreferencesUpdate(BaseModel):
    interests: Optional[str] = None
    hobbies: Optional[str] = None
    favorite_technologies: Optional[str] = None
    favorite_languages: Optional[str] = None
    learning_preferences: Optional[str] = None
    preferred_work_environment: Optional[str] = None
    goals_aspirations: Optional[str] = None
    personal_notes: Optional[str] = None


class PreferencesResponse(PreferencesUpdate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# 9. Documents
class DocumentCreate(BaseModel):
    file_name: str
    document_type: Optional[str] = "Important File"
    file_url: Optional[str] = None
    file_size: Optional[str] = None
    description: Optional[str] = None
    upload_date: Optional[str] = None
    expiry_date: Optional[str] = None


class DocumentUpdate(BaseModel):
    file_name: Optional[str] = None
    document_type: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[str] = None
    description: Optional[str] = None
    upload_date: Optional[str] = None
    expiry_date: Optional[str] = None


class DocumentResponse(DocumentCreate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# 10. Contacts
class ContactCreate(BaseModel):
    full_name: str
    relationship_type: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class ContactUpdate(BaseModel):
    full_name: Optional[str] = None
    relationship_type: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None


class ContactResponse(ContactCreate):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# Aggregated Personal Database Profile Response
class PersonalDatabaseResponse(BaseModel):
    basic: Optional[BasicProfileResponse] = None
    educations: List[EducationResponse] = []
    certifications: List[CertificationResponse] = []
    experiences: List[ExperienceResponse] = []
    career_preference: Optional[CareerPreferenceResponse] = None
    skills: List[SkillResponse] = []
    links: Optional[LinksResponse] = None
    preferences: Optional[PreferencesResponse] = None
    documents: List[DocumentResponse] = []
    contacts: List[ContactResponse] = []
    
    # System info
    system_profile: Dict[str, Any] = {}
    completion_score: int = 0
    section_completion: Dict[str, int] = {}
