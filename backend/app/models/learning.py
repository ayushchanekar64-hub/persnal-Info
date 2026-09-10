import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.base import Base


class LearningItem(Base):
    __tablename__ = "learning_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill = Column(String(100), nullable=False)
    topic = Column(String(255), nullable=True)
    course = Column(String(255), nullable=True)
    resource_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Technical")
    difficulty = Column(String(50), default="Intermediate")
    start_date = Column(String(50), nullable=True)
    target_date = Column(String(50), nullable=True)
    learning_date = Column(String(50), nullable=True)
    duration = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    progress = Column(Integer, default=0)
    status = Column(String(50), default="Learning")  # Learning, Practicing, Completed
    confidence_level = Column(String(50), default="Intermediate")
    total_hours = Column(Float, default=0.0)
    last_revised = Column(String(50), nullable=True)
    next_revision = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="learning_items")
    sessions = relationship("LearningSession", back_populates="learning_item", cascade="all, delete-orphan")


class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    learning_id = Column(String(36), ForeignKey("learning_items.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    hours = Column(Float, nullable=False, default=1.0)
    date = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    learning_item = relationship("LearningItem", back_populates="sessions")
