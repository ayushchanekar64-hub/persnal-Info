import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from backend.app.db.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Engineering")
    priority = Column(String(50), default="High")  # Low, Medium, High, Critical
    status = Column(String(50), default="To Do")   # To Do, In Progress, Completed, Cancelled
    completed = Column(Boolean, default=False)
    start_date = Column(String(50), nullable=True)
    due_date = Column(String(100), nullable=True)
    due_time = Column(String(50), nullable=True)
    estimated_time = Column(String(50), nullable=True)
    estimated_duration = Column(String(50), nullable=True)
    reminder = Column(String(100), nullable=True)
    recurring_schedule = Column(String(100), nullable=True)
    goal_id = Column(String(36), ForeignKey("goals.id", ondelete="SET NULL"), nullable=True, index=True)
    goal_title = Column(String(255), nullable=True)
    tags = Column(Text, default="[]")  # JSON string
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="tasks")
    goal = relationship("Goal", back_populates="tasks")
    subtasks = relationship("Subtask", back_populates="task", cascade="all, delete-orphan")


class Subtask(Base):
    __tablename__ = "subtasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(String(36), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    task = relationship("Task", back_populates="subtasks")
