import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, utc_now


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Productivity")
    frequency = Column(String(50), default="Daily")  # Daily, Weekly, Specific days, Custom
    target_count = Column(Integer, default=1)
    reminder_time = Column(String(50), nullable=True)
    start_date = Column(String(50), nullable=True)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_id = Column(String(36), ForeignKey("habits.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(50), nullable=False, index=True)  # YYYY-MM-DD
    completed = Column(Boolean, default=True)
    count = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    habit = relationship("Habit", back_populates="logs")
