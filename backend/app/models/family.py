import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship as sa_relationship
from backend.app.db.base import Base, utc_now


class FamilyMember(Base):
    """Core Family Member Entity - strictly belonging to an authenticated user"""
    __tablename__ = "family_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    # 1. Basic Information
    full_name = Column(String(255), nullable=False)
    relationship_type = Column(String(100), nullable=False)  # Father, Mother, Spouse, Son, Daughter, Brother, Sister, etc.
    profile_photo = Column(Text, nullable=True)  # URL or Base64 data
    dob = Column(String(50), nullable=True)
    gender = Column(String(50), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    zip_code = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)

    # 4. Professional Links
    linkedin = Column(String(500), nullable=True)
    portfolio = Column(String(500), nullable=True)
    other_links = Column(Text, nullable=True)

    # 6. Important Information & Preferences
    important_notes = Column(Text, nullable=True)
    preferences = Column(Text, nullable=True)
    custom_info = Column(Text, nullable=True)

    # 7. Emergency Details
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_relationship = Column(String(100), nullable=True)
    emergency_phone = Column(String(50), nullable=True)
    emergency_email = Column(String(255), nullable=True)

    # 8. Additional Notes
    additional_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    user = sa_relationship("User", backref="family_members")
    educations = sa_relationship("FamilyMemberEducation", back_populates="member", cascade="all, delete-orphan")
    careers = sa_relationship("FamilyMemberCareer", back_populates="member", cascade="all, delete-orphan")
    documents = sa_relationship("FamilyMemberDocument", back_populates="member", cascade="all, delete-orphan")
    contacts = sa_relationship("FamilyMemberContact", back_populates="member", cascade="all, delete-orphan")


class FamilyMemberEducation(Base):
    """2. Education Records for a Family Member"""
    __tablename__ = "family_member_educations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    family_member_id = Column(String(36), ForeignKey("family_members.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    institution = Column(String(255), nullable=False)  # School/College/University
    degree = Column(String(150), nullable=False)        # Degree
    field_of_study = Column(String(150), nullable=True) # Branch/Specialization
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    grade_or_percentage = Column(String(50), nullable=True)  # CGPA/Percentage
    certifications = Column(Text, nullable=True)             # Certifications list
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    member = sa_relationship("FamilyMember", back_populates="educations")


class FamilyMemberCareer(Base):
    """3. Career Records for a Family Member"""
    __tablename__ = "family_member_careers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    family_member_id = Column(String(36), ForeignKey("family_members.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    employment_type = Column(String(100), default="Full-time")
    experience_years = Column(String(50), nullable=True)
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    skills = Column(Text, nullable=True)
    previous_employment = Column(Text, nullable=True)
    projects = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    member = sa_relationship("FamilyMember", back_populates="careers")


class FamilyMemberDocument(Base):
    """5. Document Vault for a Family Member"""
    __tablename__ = "family_member_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    family_member_id = Column(String(36), ForeignKey("family_members.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    file_name = Column(String(255), nullable=False)
    document_type = Column(String(100), default="Important File")  # ID Document, Certificate, Resume, Important File, Other
    file_url = Column(Text, nullable=True)
    file_size = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    upload_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    member = sa_relationship("FamilyMember", back_populates="documents")


class FamilyMemberContact(Base):
    """Emergency & Important Contacts related to Family Member"""
    __tablename__ = "family_member_contacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    family_member_id = Column(String(36), ForeignKey("family_members.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    contact_name = Column(String(255), nullable=False)
    relationship = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    member = sa_relationship("FamilyMember", back_populates="contacts")
