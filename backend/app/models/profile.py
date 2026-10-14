import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, utc_now


class UserProfile(Base):
    """1. Basic Profile Information"""
    __tablename__ = "user_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    
    full_name = Column(String(255), nullable=True)
    profile_photo = Column(Text, nullable=True) # URL or Base64
    dob = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    phone_number = Column(String(50), nullable=True)
    primary_email = Column(String(255), nullable=True)
    alternate_email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    zip_code = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")


class UserEducation(Base):
    """2A. Education Records"""
    __tablename__ = "user_educations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    institution = Column(String(255), nullable=False) # College / University
    degree = Column(String(150), nullable=False) # Degree (B.Tech, B.S., M.S., etc.)
    field_of_study = Column(String(150), nullable=True) # Branch / Specialization
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    grade_or_gpa = Column(String(50), nullable=True) # CGPA / Percentage
    result_status = Column(String(50), nullable=True) # Grade / Result e.g. First Class with Distinction
    description = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="educations")


class UserCertification(Base):
    """2B. Certification Records"""
    __tablename__ = "user_certifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    name = Column(String(255), nullable=False) # Certification Name
    issuing_organization = Column(String(255), nullable=False)
    issue_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    credential_id = Column(String(150), nullable=True)
    credential_url = Column(String(500), nullable=True)
    file_url = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="certifications")


class UserExperience(Base):
    """3A. Work Experience Records"""
    __tablename__ = "user_experiences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    employment_type = Column(String(100), default="Full-time") # Full-time, Part-time, Internship, Contract
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    location = Column(String(150), nullable=True) # e.g. Remote, San Francisco, CA
    description = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="experiences")


class UserCareerPreference(Base):
    """3B. Career / Professional Targets & Preferences"""
    __tablename__ = "user_career_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    
    current_role = Column(String(255), nullable=True)
    current_company = Column(String(255), nullable=True)
    employment_type = Column(String(100), nullable=True)
    work_location = Column(String(150), nullable=True)
    years_of_experience = Column(String(50), nullable=True)
    skills_summary = Column(Text, nullable=True)
    target_role = Column(String(255), nullable=True)
    target_companies = Column(Text, nullable=True)
    expected_salary = Column(String(100), nullable=True)
    notice_period = Column(String(100), nullable=True)
    professional_summary = Column(Text, nullable=True)
    resume_url = Column(Text, nullable=True)
    projects_summary = Column(Text, nullable=True)
    achievements_summary = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="career_preference")


class UserSkill(Base):
    """4. Skill Records"""
    __tablename__ = "user_skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    name = Column(String(150), nullable=False)
    category = Column(String(100), default="Technical") # Technical, Languages, Frameworks, Tools, Soft Skills, Cloud/DevOps
    proficiency = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced, Expert
    years_of_experience = Column(Float, default=1.0)
    last_used = Column(String(50), nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_url = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="skills")


class UserLinks(Base):
    """5. Professional Links"""
    __tablename__ = "user_links"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    
    linkedin = Column(String(500), nullable=True)
    github = Column(String(500), nullable=True)
    portfolio = Column(String(500), nullable=True)
    leetcode = Column(String(500), nullable=True)
    hackerrank = Column(String(500), nullable=True)
    stackoverflow = Column(String(500), nullable=True)
    twitter_x = Column(String(500), nullable=True)
    other_links = Column(Text, nullable=True) # JSON or newline separated
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="links")


class UserPreferences(Base):
    """6. Personal Preferences"""
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    
    interests = Column(Text, nullable=True)
    hobbies = Column(Text, nullable=True)
    favorite_technologies = Column(Text, nullable=True)
    favorite_languages = Column(Text, nullable=True)
    learning_preferences = Column(Text, nullable=True)
    preferred_work_environment = Column(Text, nullable=True)
    goals_aspirations = Column(Text, nullable=True)
    personal_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="preferences")


class UserDocument(Base):
    """7. Secure Document Manager"""
    __tablename__ = "user_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    file_name = Column(String(255), nullable=False)
    document_type = Column(String(100), default="Important File") # Resume, Certificate, ID Document, Academic, Offer Letter, Important File, Other
    file_url = Column(Text, nullable=True)
    file_size = Column(String(50), nullable=True) # e.g. 2.4 MB
    description = Column(Text, nullable=True)
    upload_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="documents")


class UserContact(Base):
    """8. Important & Emergency Contacts"""
    __tablename__ = "user_contacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    full_name = Column(String(255), nullable=False)
    relationship_type = Column(String(100), nullable=True) # Family, Mentor, Emergency, Colleague, Friend
    phone = Column(String(50), nullable=True)
    alternate_phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="contacts")
