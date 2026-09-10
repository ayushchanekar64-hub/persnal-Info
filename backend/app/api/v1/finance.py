from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.finance import FinanceTransaction, FinanceBudget
from backend.app.models.activity import Activity
from backend.app.schemas.finance import (
    TransactionCreate,
    TransactionResponse,
    BudgetCreate,
    BudgetResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FinanceTransaction)
        .where(FinanceTransaction.user_id == current_user.id)
        .order_by(FinanceTransaction.date.desc())
    )
    return result.scalars().all()


@router.post("/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    tx_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = FinanceTransaction(
        user_id=current_user.id,
        type=tx_in.type,
        amount=tx_in.amount,
        category=tx_in.category,
        date=tx_in.date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        payment_method=tx_in.payment_method or "Card",
        description=tx_in.description,
        is_recurring=tx_in.is_recurring or False,
        notes=tx_in.notes,
    )
    db.add(tx)
    await db.flush()

    sign = "+" if tx.type == "Income" else "-"
    activity = Activity(
        user_id=current_user.id,
        type="finance",
        title=f'Logged {tx.type}: {sign}${tx.amount:.2f} ({tx.category})',
        time_label="Just now",
        color="var(--success-600)" if tx.type == "Income" else "var(--warning-600)",
    )
    db.add(activity)
    await db.commit()
    await db.refresh(tx)
    return tx


@router.delete("/transactions/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    tx_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FinanceTransaction).where(FinanceTransaction.id == tx_id, FinanceTransaction.user_id == current_user.id)
    )
    tx = result.scalars().first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    await db.delete(tx)
    await db.commit()
    return None


@router.get("/budgets", response_model=List[BudgetResponse])
async def list_budgets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FinanceBudget).where(FinanceBudget.user_id == current_user.id)
    )
    return result.scalars().all()


@router.post("/budgets", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    b_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    budget = FinanceBudget(
        user_id=current_user.id,
        category=b_in.category,
        budget_amount=b_in.budget_amount,
        period=b_in.period or "Monthly",
    )
    db.add(budget)
    await db.commit()
    await db.refresh(budget)
    return budget
