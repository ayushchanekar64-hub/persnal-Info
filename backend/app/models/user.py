import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, utc_now


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    recovery_pin_hash = Column(String(255), nullable=True)
    recovery_attempts = Column(Integer, default=0, nullable=False)
    recovery_locked_until = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    login_locked_until = Column(DateTime, nullable=True)
    two_factor_enabled = Column(Boolean, default=True, nullable=False)
    token_version = Column(Integer, default=1, nullable=False)
    name = Column(String(255), nullable=True)
    role = Column(String(100), default="Member")
    avatar = Column(String(50), default="U")
    tagline = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    @property
    def has_recovery_pin(self) -> bool:
        return bool(self.recovery_pin_hash)

    # Relationships
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    learning_items = relationship("LearningItem", back_populates="user", cascade="all, delete-orphan")
    coding_problems = relationship("CodingProblem", back_populates="user", cascade="all, delete-orphan")
    job_applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("FinanceTransaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("FinanceBudget", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    # Personal Database / Profile Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    educations = relationship("UserEducation", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("UserCertification", back_populates="user", cascade="all, delete-orphan")
    experiences = relationship("UserExperience", back_populates="user", cascade="all, delete-orphan")
    career_preference = relationship("UserCareerPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    links = relationship("UserLinks", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    documents = relationship("UserDocument", back_populates="user", cascade="all, delete-orphan")
    contacts = relationship("UserContact", back_populates="user", cascade="all, delete-orphan")
    inbox_items = relationship("InboxItem", back_populates="user", cascade="all, delete-orphan")
