from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Education Schemas
# ---------------------------------------------------------------------------
class FamilyMemberEducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    grade_or_percentage: Optional[str] = None
    certifications: Optional[str] = None
    description: Optional[str] = None


class FamilyMemberEducationCreate(FamilyMemberEducationBase):
    pass


class FamilyMemberEducationUpdate(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    grade_or_percentage: Optional[str] = None
    certifications: Optional[str] = None
    description: Optional[str] = None


class FamilyMemberEducationResponse(FamilyMemberEducationBase):
    id: str
    family_member_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Career Schemas
# ---------------------------------------------------------------------------
class FamilyMemberCareerBase(BaseModel):
    company: str
    role: str
    employment_type: Optional[str] = "Full-time"
    experience_years: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    skills: Optional[str] = None
    previous_employment: Optional[str] = None
    projects: Optional[str] = None
    description: Optional[str] = None


class FamilyMemberCareerCreate(FamilyMemberCareerBase):
    pass


class FamilyMemberCareerUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    employment_type: Optional[str] = None
    experience_years: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = None
    skills: Optional[str] = None
    previous_employment: Optional[str] = None
    projects: Optional[str] = None
    description: Optional[str] = None


class FamilyMemberCareerResponse(FamilyMemberCareerBase):
    id: str
    family_member_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Document Schemas
# ---------------------------------------------------------------------------
class FamilyMemberDocumentBase(BaseModel):
    file_name: str
    document_type: str = "Important File"
    file_url: Optional[str] = None
    file_size: Optional[str] = None
    description: Optional[str] = None
    upload_date: Optional[str] = None
    expiry_date: Optional[str] = None


class FamilyMemberDocumentCreate(FamilyMemberDocumentBase):
    pass


class FamilyMemberDocumentResponse(FamilyMemberDocumentBase):
    id: str
    family_member_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Contact Schemas
# ---------------------------------------------------------------------------
class FamilyMemberContactBase(BaseModel):
    contact_name: str
    relationship: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None


class FamilyMemberContactCreate(FamilyMemberContactBase):
    pass


class FamilyMemberContactResponse(FamilyMemberContactBase):
    id: str
    family_member_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Family Member Core Schemas
# ---------------------------------------------------------------------------
class FamilyMemberCreate(BaseModel):
    full_name: str
    relationship_type: str  # Father, Mother, Spouse, Son, Daughter, Brother, Sister, etc.
    profile_photo: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    bio: Optional[str] = None

    # Links
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    other_links: Optional[str] = None

    # Important Info & Preferences
    important_notes: Optional[str] = None
    preferences: Optional[str] = None
    custom_info: Optional[str] = None

    # Emergency Details
    emergency_contact_name: Optional[str] = None
    emergency_relationship: Optional[str] = None
    emergency_phone: Optional[str] = None
    emergency_email: Optional[str] = None

    # Additional Notes
    additional_notes: Optional[str] = None


class FamilyMemberUpdate(BaseModel):
    full_name: Optional[str] = None
    relationship_type: Optional[str] = None
    profile_photo: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    bio: Optional[str] = None

    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    other_links: Optional[str] = None

    important_notes: Optional[str] = None
    preferences: Optional[str] = None
    custom_info: Optional[str] = None

    emergency_contact_name: Optional[str] = None
    emergency_relationship: Optional[str] = None
    emergency_phone: Optional[str] = None
    emergency_email: Optional[str] = None

    additional_notes: Optional[str] = None


class FamilyMemberListResponse(BaseModel):
    id: str
    full_name: str
    relationship_type: str
    profile_photo: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    education_count: int = 0
    career_count: int = 0
    document_count: int = 0
    emergency_contact_name: Optional[str] = None
    emergency_phone: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class FamilyMemberDetailResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    relationship_type: str
    profile_photo: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    bio: Optional[str] = None

    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    other_links: Optional[str] = None

    important_notes: Optional[str] = None
    preferences: Optional[str] = None
    custom_info: Optional[str] = None

    emergency_contact_name: Optional[str] = None
    emergency_relationship: Optional[str] = None
    emergency_phone: Optional[str] = None
    emergency_email: Optional[str] = None

    additional_notes: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    educations: List[FamilyMemberEducationResponse] = []
    careers: List[FamilyMemberCareerResponse] = []
    documents: List[FamilyMemberDocumentResponse] = []
    contacts: List[FamilyMemberContactResponse] = []

    model_config = ConfigDict(from_attributes=True)
