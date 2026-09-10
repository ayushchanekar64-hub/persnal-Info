from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.config import settings
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.activity import Activity
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate, Token
from backend.app.api.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )
    
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        name=user_in.name or user_in.email.split("@")[0].capitalize(),
        role=user_in.role or "Member",
        avatar=(user_in.name[0] if user_in.name else user_in.email[0]).upper(),
        tagline=user_in.tagline or "Personal growth and daily execution."
    )
    db.add(user)
    await db.flush()

    # Log registration activity
    activity = Activity(
        user_id=user.id,
        type="system",
        title="Account created and workspace initialized",
        time_label="Just now",
        color="var(--primary-600)"
    )
    db.add(activity)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account"
        )
    
    access_token = create_access_token(user.id)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.role is not None:
        current_user.role = user_update.role
    if user_update.avatar is not None:
        current_user.avatar = user_update.avatar
    if user_update.tagline is not None:
        current_user.tagline = user_update.tagline
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
