import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, utc_now


class InboxItem(Base):
    __tablename__ = "inbox_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    raw_content = Column(Text, nullable=False)
    title = Column(String(255), nullable=True)
    source = Column(String(50), default="desktop_hud")  # "desktop_hud", "mobile_widget", "voice", "quick_pill"
    suggested_type = Column(String(50), default="Idea")  # "Task", "Note", "Goal", "Learning", "Habit", "Idea"
    tags = Column(Text, default="[]")  # JSON array string
    priority = Column(String(20), default="Medium")
    is_processed = Column(Boolean, default=False, index=True)
    processed_as = Column(String(50), nullable=True)  # "task", "note", "goal", "learning", "archived"
    target_entity_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="inbox_items")
