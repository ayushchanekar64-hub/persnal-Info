import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.base import Base


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
    
    # Mistake Log Fields
    mistake_learning = Column(Text, nullable=True)    # Combined or freeform mistake / learning
    mistake = Column(Text, nullable=True)             # "What went wrong?"
    correct_approach = Column(Text, nullable=True)    # "Correct approach"
    what_to_remember = Column(Text, nullable=True)    # "What should I remember?"
    
    tags = Column(Text, default="[]")  # JSON array
    solved_date = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="coding_problems")
