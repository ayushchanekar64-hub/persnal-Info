import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.base import Base, utc_now


class FinanceTransaction(Base):
    __tablename__ = "finance_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(20), nullable=False)  # Income, Expense
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=False)
    date = Column(String(50), nullable=False)
    payment_method = Column(String(50), default="Card")
    description = Column(String(255), nullable=True)
    is_recurring = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="transactions")


class FinanceBudget(Base):
    __tablename__ = "finance_budgets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    budget_amount = Column(Float, nullable=False)
    period = Column(String(50), default="Monthly")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="budgets")
