from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TransactionBase(BaseModel):
    type: str  # Income, Expense
    amount: float
    category: str
    date: str
    payment_method: Optional[str] = "Card"
    description: Optional[str] = None
    is_recurring: Optional[bool] = False
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class BudgetBase(BaseModel):
    category: str
    budget_amount: float
    period: Optional[str] = "Monthly"


class BudgetCreate(BudgetBase):
    pass


class BudgetResponse(BudgetBase):
    id: str
    user_id: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
