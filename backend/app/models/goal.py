import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, utc_now


class Goal(Base):
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Career")
    priority = Column(String(50), default="High")
    start_date = Column(String(50), nullable=True)
    target_date = Column(String(100), nullable=True)
    deadline = Column(String(100), nullable=True)
    progress = Column(Integer, default=0)
    status = Column(String(50), default="In Progress")  # Not Started, In Progress, Completed, Paused, Cancelled
    color = Column(String(50), default="primary")
    tags = Column(Text, default="[]")  # JSON string
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    user = relationship("User", back_populates="goals")
    tasks = relationship("Task", back_populates="goal")
    milestones = relationship("Milestone", back_populates="goal", cascade="all, delete-orphan")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    goal_id = Column(String(36), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    target_date = Column(String(100), nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    goal = relationship("Goal", back_populates="milestones")
