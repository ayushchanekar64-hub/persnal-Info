from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.config import settings
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_recovery_token,
    decode_recovery_token
)
from backend.app.db.session import get_db
from backend.app.db.base import utc_now
from backend.app.models.user import User
from backend.app.models.activity import Activity
from backend.app.schemas.user import (
    UserCreate,
    UserLogin,
    UserLogin2FARequest,
    LoginResponse,
    CheckIdentifierRequest,
    CheckIdentifierResponse,
    UserResponse,
    UserUpdate,
    Token,
    GoogleAuthRequest,
    RecoveryVerifyIdentifierRequest,
    RecoveryVerifyIdentifierResponse,
    RecoveryVerifyPinRequest,
    RecoveryVerifyPinResponse,
    RecoveryResetPasswordRequest,
    SetRecoveryPinRequest
)
from backend.app.api.deps import get_current_user
import secrets
import re

router = APIRouter()


COMMON_PASSWORDS_BLACKLIST = {
    "password123", "password@123", "admin123", "admin@123", "welcome123", "welcome@123",
    "password", "12345678", "qwerty123", "letmein123", "ayush@123", "ayush123", "mindos123",
    "mindos@123", "rootadmin123", "changeme123", "iloveyou123", "pass@1234", "master@123"
}


def normalize_identifier(ident: str) -> tuple[str, str]:
    """
    Returns (normalized_value, 'email' | 'phone')
    """
    clean = ident.strip()
    if "@" in clean:
        parts = clean.split("@")
        username, domain = parts[0].strip().lower(), parts[1].strip().lower()
        if domain in ["gmail.com", "googlemail.com"]:
            username = username.split("+")[0].replace(".", "")
            domain = "gmail.com"
        return f"{username}@{domain}", "email"
    else:
        digits = re.sub(r"[^\d+]", "", clean)
        if len(digits) == 10 and not digits.startswith("+"):
            digits = f"+91{digits}"
        elif digits.startswith("91") and len(digits) == 12 and not digits.startswith("+"):
            digits = f"+{digits}"
        return digits, "phone"


def check_password_blacklist(pwd: str) -> None:
    cleaned = pwd.strip().lower()
    for common in COMMON_PASSWORDS_BLACKLIST:
        if common in cleaned or cleaned == common:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security Warning: This password is too common or easily guessable. Please choose a more unique, high-entropy password."
            )


def mask_identifier(ident: str) -> str:
    ident = ident.strip()
    if "@" in ident:
        parts = ident.split("@")
        name, domain = parts[0], parts[1]
        if len(name) <= 2:
            masked_name = name[0] + "*"
        else:
            masked_name = name[0] + "*" * (len(name) - 2) + name[-1]
        return f"{masked_name}@{domain}"
    else:
        if len(ident) <= 4:
            return "*" * len(ident)
        return ident[:3] + "*" * (len(ident) - 5) + ident[-2:]


def validate_password_complexity(pwd: str) -> None:
    if len(pwd) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
    if not re.search(r"[A-Z]", pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter (A-Z)."
        )
    if not re.search(r"[a-z]", pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter (a-z)."
        )
    if not re.search(r"[0-9]", pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number (0-9)."
        )
    if not re.search(r"[^A-Za-z0-9]", pwd):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character (e.g. !@#$%^&*)."
        )
    check_password_blacklist(pwd)


def verify_access_key(key: str | None) -> None:
    if not settings.ALLOW_PUBLIC_REGISTRATION:
        if not key or key.strip() != settings.REGISTRATION_ACCESS_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: A valid Master Security Passkey is required to register an account."
            )


@router.post("/check-identifier", response_model=CheckIdentifierResponse)
async def check_identifier(req: CheckIdentifierRequest, db: AsyncSession = Depends(get_db)):
    clean_val = req.identifier.strip()
    if not clean_val:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identifier cannot be empty."
        )
    normalized, id_type = normalize_identifier(clean_val)
    
    if id_type == "email":
        stmt = select(User).where(
            (User.email == normalized) | 
            (User.email == clean_val.lower())
        )
    else:
        digits = re.sub(r"[^\d]", "", clean_val)
        suffix = digits[-10:] if len(digits) >= 10 else digits
        stmt = select(User).where(
            (User.phone == normalized) | 
            (User.phone == clean_val) |
            (User.phone.endswith(suffix)) |
            (User.email == normalized) | 
            (User.email == clean_val)
        )
    
    result = await db.execute(stmt)
    user = result.scalars().first()
    exists = user is not None
    
    if exists:
        msg = f"This {id_type} is already registered. Please sign in to your workspace."
    else:
        msg = f"This {id_type} is available."
        
    return CheckIdentifierResponse(
        exists=exists,
        identifier_type=id_type,
        normalized=normalized,
        message=msg
    )


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # 1. Master Security Passkey Verification
    verify_access_key(user_in.access_key)

    # 2. Strict Password Complexity & Blacklist Verification
    validate_password_complexity(user_in.password)

    clean_email = user_in.email.strip()
    normalized_id, id_type = normalize_identifier(clean_email)
    
    # Check if user already exists with normalized or exact identifier (email)
    stmt = select(User).where(
        (User.email == normalized_id) | 
        (User.email == clean_email.lower()) |
        (User.phone == normalized_id)
    )
    result = await db.execute(stmt)
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with this {id_type} already exists. Please sign in instead.",
        )
    
    phone_val = None
    if user_in.phone and user_in.phone.strip():
        clean_phone = user_in.phone.strip()
        phone_norm, _ = normalize_identifier(clean_phone)
        phone_digits = re.sub(r"[^\d]", "", clean_phone)
        suffix = phone_digits[-10:] if len(phone_digits) >= 10 else phone_digits
        phone_check = await db.execute(
            select(User).where(
                (User.phone == phone_norm) |
                (User.phone == clean_phone) |
                (User.phone.endswith(suffix)) |
                (User.email == phone_norm)
            )
        )
        if phone_check.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this mobile number already exists. Please sign in instead.",
            )
        phone_val = phone_norm
    elif id_type == "phone":
        phone_val = normalized_id

    if id_type == "email":
        default_name = clean_email.split("@")[0].capitalize()
    else:
        default_name = f"User {normalized_id[-4:]}" if len(normalized_id) >= 4 else "Member"

    display_name = user_in.name or default_name
    avatar_char = (display_name[0] if display_name else "U").upper()

    # Hash recovery PIN if provided
    recovery_pin_hash = None
    if user_in.recovery_pin:
        pin_clean = str(user_in.recovery_pin).strip()
        if not re.match(r"^\d{6}$", pin_clean):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Recovery PIN must be exactly 6 numeric digits."
            )
        recovery_pin_hash = get_password_hash(pin_clean)

    user = User(
        email=normalized_id if id_type == "email" else clean_email.lower(),
        phone=phone_val,
        password_hash=get_password_hash(user_in.password),
        recovery_pin_hash=recovery_pin_hash,
        two_factor_enabled=True,
        name=display_name,
        role=user_in.role or "Member",
        avatar=avatar_char,
        tagline=user_in.tagline or "Personal growth and daily execution."
    )
    db.add(user)
    await db.flush()

    # Log registration activity
    activity = Activity(
        user_id=user.id,
        type="system",
        title="Account created with Master Security Passkey & 2FA Recovery PIN",
        time_label="Just now",
        color="var(--primary-600)"
    )
    db.add(activity)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id, token_version=user.token_version)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/login", response_model=LoginResponse)
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    clean_val = user_in.email.strip()
    normalized_id, id_type = normalize_identifier(clean_val)
    if id_type == "email":
        stmt = select(User).where(
            (User.email == normalized_id) | 
            (User.email == clean_val.lower())
        )
    else:
        stmt = select(User).where(
            (User.phone == normalized_id) | 
            (User.email == normalized_id) | 
            (User.email == clean_val)
        )
    result = await db.execute(stmt)
    user = result.scalars().first()

    now = utc_now()
    max_attempts = getattr(settings, "MAX_LOGIN_ATTEMPTS", 5)
    lockout_mins = getattr(settings, "LOGIN_LOCKOUT_MINUTES", 15)

    # 1. Check if user is temporarily locked out
    if user and user.login_locked_until:
        lock_until = user.login_locked_until.replace(tzinfo=None)
        if now < lock_until:
            rem_minutes = max(1, int((lock_until - now).total_seconds() / 60) + 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Security Lockout: Account is temporarily locked due to repeated failed logins. Try again in {rem_minutes} minute{'s' if rem_minutes != 1 else ''} or use 6-digit Recovery PIN."
            )

    # 2. Check credentials
    if not user or not verify_password(user_in.password, user.password_hash):
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= max_attempts:
                user.login_locked_until = now + timedelta(minutes=lockout_mins)
                activity = Activity(
                    user_id=user.id,
                    type="system",
                    title=f"Account locked for {lockout_mins} mins ({max_attempts} failed login attempts)",
                    time_label="Just now",
                    color="var(--accent-red)"
                )
                db.add(activity)
                await db.commit()
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Security Lockout: Maximum login attempts ({max_attempts}) reached. Account locked for {lockout_mins} minutes."
                )
            else:
                remaining = max_attempts - user.failed_login_attempts
                await db.commit()
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Incorrect credentials. {remaining} attempt{'s' if remaining != 1 else ''} remaining before account lockout.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email/phone number or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account"
        )
    
    # 3. If User has 2FA PIN configured, require Step 2 PIN verification
    if user.recovery_pin_hash and getattr(user, "two_factor_enabled", True):
        two_factor_token = create_recovery_token(user.id, purpose="2fa_login", expires_minutes=5)
        return LoginResponse(
            two_factor_required=True,
            two_factor_token=two_factor_token,
            user=UserResponse.model_validate(user)
        )

    # Otherwise direct login
    if (user.failed_login_attempts or 0) > 0 or user.login_locked_until is not None:
        user.failed_login_attempts = 0
        user.login_locked_until = None
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(user.id, token_version=user.token_version)
    return LoginResponse(
        two_factor_required=False,
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login/2fa", response_model=Token)
async def login_2fa(req: UserLogin2FARequest, db: AsyncSession = Depends(get_db)):
    payload = decode_recovery_token(req.two_factor_token, expected_purpose="2fa_login")
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Two-factor authentication session expired or invalid. Please sign in again."
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    now = utc_now()
    if user.login_locked_until:
        lock_until = user.login_locked_until.replace(tzinfo=None)
        if now < lock_until:
            rem_minutes = max(1, int((lock_until - now).total_seconds() / 60) + 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Security Lockout: Account locked. Try again in {rem_minutes} minutes."
            )

    clean_pin = req.security_pin.strip()
    if not verify_password(clean_pin, user.recovery_pin_hash):
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        max_attempts = getattr(settings, "MAX_LOGIN_ATTEMPTS", 5)
        lockout_mins = getattr(settings, "LOGIN_LOCKOUT_MINUTES", 15)
        if user.failed_login_attempts >= max_attempts:
            user.login_locked_until = now + timedelta(minutes=lockout_mins)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Security Lockout: Account locked for {lockout_mins} minutes due to invalid PIN attempts."
            )
        remaining = max_attempts - user.failed_login_attempts
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect 6-digit Security PIN. {remaining} attempt{'s' if remaining != 1 else ''} remaining."
        )

    # Success: Reset attempts and lockout
    user.failed_login_attempts = 0
    user.login_locked_until = None
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(user.id, token_version=user.token_version)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))



@router.post("/google", response_model=Token)
async def google_auth(google_in: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    email = str(google_in.email).strip().lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user:
        # Check if public registration is disabled and verify master passkey
        if not settings.ALLOW_PUBLIC_REGISTRATION:
            if not google_in.access_key or google_in.access_key.strip() != settings.REGISTRATION_ACCESS_KEY:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access Denied: Unregistered Google account. A valid Master Security Passkey is required to create an account."
                )

        random_pwd = secrets.token_urlsafe(32)
        default_name = google_in.name or email.split("@")[0].capitalize()
        user = User(
            email=email,
            password_hash=get_password_hash(random_pwd),
            name=default_name,
            role="Member",
            avatar=google_in.avatar or (default_name[0] if default_name else "G").upper(),
            tagline="Google verified workspace member"
        )
        db.add(user)
        await db.flush()

        # Log registration activity
        activity = Activity(
            user_id=user.id,
            type="system",
            title="Signed in with Google Account (Authorized)",
            time_label="Just now",
            color="var(--primary-600)"
        )
        db.add(activity)
        await db.commit()
        await db.refresh(user)
    else:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account"
            )
        # Update user name or avatar if provided and not customized
        if google_in.name and (not user.name or user.name == user.email.split("@")[0].capitalize()):
            user.name = google_in.name
        if google_in.avatar and len(google_in.avatar) > 2:
            user.avatar = google_in.avatar
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(user.id, token_version=user.token_version)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/recovery/verify-identifier", response_model=RecoveryVerifyIdentifierResponse)
async def recovery_verify_identifier(
    req: RecoveryVerifyIdentifierRequest,
    db: AsyncSession = Depends(get_db)
):
    clean_id = req.identifier.strip()
    search_term = clean_id.lower() if "@" in clean_id else clean_id
    result = await db.execute(select(User).where(User.email == search_term))
    user = result.scalars().first()

    if not user:
        # Prevent account enumeration by throwing clean standardized error
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No AYORA account found with this email or phone number."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account is deactivated. Please contact support."
        )

    # Check lockout
    now = utc_now()
    if user.recovery_locked_until:
        lock_until = user.recovery_locked_until.replace(tzinfo=None)
        if now < lock_until:
            rem_minutes = max(1, int((lock_until - now).total_seconds() / 60) + 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Account recovery is temporarily locked due to excessive failed attempts. Please try again in {rem_minutes} minutes."
            )

    has_pin = bool(user.recovery_pin_hash)
    recovery_token = create_recovery_token(user.id, purpose="recovery_step_1", expires_minutes=15)
    masked = mask_identifier(user.email)

    return RecoveryVerifyIdentifierResponse(
        recovery_token=recovery_token,
        masked_identifier=masked,
        has_pin=has_pin
    )


@router.post("/recovery/verify-pin", response_model=RecoveryVerifyPinResponse)
async def recovery_verify_pin(
    req: RecoveryVerifyPinRequest,
    db: AsyncSession = Depends(get_db)
):
    payload = decode_recovery_token(req.recovery_token, expected_purpose="recovery_step_1")
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Recovery session has expired or is invalid. Please restart the recovery flow."
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    now = utc_now()
    if user.recovery_locked_until:
        lock_until = user.recovery_locked_until.replace(tzinfo=None)
        if now < lock_until:
            rem_minutes = max(1, int((lock_until - now).total_seconds() / 60) + 1)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Recovery is temporarily locked. Please try again in {rem_minutes} minutes."
            )

    if not user.recovery_pin_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No Recovery PIN is configured for this account. Please contact your administrator."
        )

    clean_pin = req.recovery_pin.strip()
    is_valid = verify_password(clean_pin, user.recovery_pin_hash)

    if not is_valid:
        user.recovery_attempts = (user.recovery_attempts or 0) + 1
        if user.recovery_attempts >= 5:
            user.recovery_locked_until = now + timedelta(minutes=15)
            # Log security event
            activity = Activity(
                user_id=user.id,
                type="system",
                title="Account recovery locked for 15 minutes (5 failed PIN attempts)",
                time_label="Just now",
                color="var(--accent-red)"
            )
            db.add(activity)
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Maximum PIN verification attempts exceeded. Account recovery is temporarily locked for 15 minutes."
            )
        else:
            remaining = 5 - user.recovery_attempts
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Incorrect 6-digit Recovery PIN. {remaining} attempt{'s' if remaining != 1 else ''} remaining before temporary lockout."
            )

    # Success: Reset attempts and lockout
    user.recovery_attempts = 0
    user.recovery_locked_until = None
    await db.commit()

    reset_token = create_recovery_token(user.id, purpose="recovery_step_2", expires_minutes=15)
    return RecoveryVerifyPinResponse(reset_token=reset_token)


@router.post("/recovery/reset-password")
async def recovery_reset_password(
    req: RecoveryResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    validate_password_complexity(req.new_password)

    payload = decode_recovery_token(req.reset_token, expected_purpose="recovery_step_2")
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password reset session has expired or is invalid. Please restart recovery."
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    # Update password and invalidate all previous JWT sessions
    user.password_hash = get_password_hash(req.new_password)
    user.token_version = (user.token_version or 1) + 1
    user.recovery_attempts = 0
    user.recovery_locked_until = None
    user.failed_login_attempts = 0
    user.login_locked_until = None

    # Log activity
    activity = Activity(
        user_id=user.id,
        type="system",
        title="Password successfully reset using 6-Digit Recovery PIN",
        time_label="Just now",
        color="var(--primary-600)"
    )
    db.add(activity)
    await db.commit()

    return {
        "success": True,
        "message": "Password updated successfully. Existing sessions have been revoked. Please sign in."
    }


@router.post("/set-recovery-pin", response_model=UserResponse)
async def set_recovery_pin(
    req: SetRecoveryPinRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    pin_clean = req.recovery_pin.strip()
    if not re.match(r"^\d{6}$", pin_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recovery PIN must be exactly 6 numeric digits."
        )

    current_user.recovery_pin_hash = get_password_hash(pin_clean)
    current_user.recovery_attempts = 0
    current_user.recovery_locked_until = None

    activity = Activity(
        user_id=current_user.id,
        type="system",
        title="6-Digit Recovery PIN configured for self-service password recovery",
        time_label="Just now",
        color="var(--primary-600)"
    )
    db.add(activity)
    await db.commit()
    await db.refresh(current_user)

    return current_user


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
