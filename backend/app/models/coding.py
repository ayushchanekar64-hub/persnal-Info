import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, utc_now


class CodingProblem(Base):
    __tablename__ = "coding_problems"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    platform = Column(String(100), default="LeetCode")
    problem_url = Column(String(500), nullable=True)
    topic = Column(String(100), default="Arrays & Strings")
    difficulty = Column(String(50), default="Medium")  # Easy, Medium, Hard
    status = Column(String(50), default="Solved")      # Attempted, Solved, Revisit, Mastered
    time_taken = Column(String(50), nullable=True)
    time_taken_minutes = Column(Integer, default=30)
    attempts = Column(Integer, default=1)
    programming_language = Column(String(50), default="Python")
    solution_code = Column(Text, nullable=True)
    solution_notes = Column(Text, nullable=True)
    
    # Mistake Log Fields (legacy/inline, now we can use CodingMistake for rich logging)
    mistake_learning = Column(Text, nullable=True)    
    mistake = Column(Text, nullable=True)             
    correct_approach = Column(Text, nullable=True)    
    what_to_remember = Column(Text, nullable=True)    
    
    tags = Column(Text, default="[]")  # JSON array
    solved_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="coding_problems")


class CodingSession(Base):
    __tablename__ = "coding_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(50), nullable=False) # YYYY-MM-DD
    start_time = Column(String(20), nullable=True)
    end_time = Column(String(20), nullable=True)
    duration_minutes = Column(Integer, default=0)
    problems_solved = Column(Integer, default=0)
    topics_practiced = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=utc_now)
    
    user = relationship("User")


class CodingMistake(Base):
    __tablename__ = "coding_mistakes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(String(36), ForeignKey("coding_problems.id", ondelete="CASCADE"), nullable=True)
    problem_title = Column(String(255), nullable=True)
    topic = Column(String(100), nullable=True)
    why_failed = Column(Text, nullable=True)
    correct_approach = Column(Text, nullable=True)
    what_to_remember = Column(Text, nullable=True)
    review_status = Column(String(50), default="Needs Review") # Needs Review, Reviewed
    
    created_at = Column(DateTime, default=utc_now)
    
    user = relationship("User")


class CodingAchievement(Base):
    __tablename__ = "coding_achievements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(String(100), nullable=False) # e.g. "first_problem", "7_day_streak"
    unlocked_at = Column(DateTime, default=utc_now)
    
    user = relationship("User")
