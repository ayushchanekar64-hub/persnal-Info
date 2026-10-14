from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: str
    phone: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = "Member"
    avatar: Optional[str] = "U"
    tagline: Optional[str] = None


class UserCreate(UserBase):
    password: str
    recovery_pin: Optional[str] = None
    access_key: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserLogin2FARequest(BaseModel):
    two_factor_token: str
    security_pin: str


class CheckIdentifierRequest(BaseModel):
    identifier: str


class CheckIdentifierResponse(BaseModel):
    exists: bool
    identifier_type: str  # 'email' | 'phone'
    normalized: str
    message: str


class GoogleAuthRequest(BaseModel):
    email: str
    name: Optional[str] = None
    avatar: Optional[str] = None
    google_id: Optional[str] = None
    credential: Optional[str] = None
    access_key: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None
    tagline: Optional[str] = None


class UserResponse(UserBase):
    id: str
    is_active: bool
    has_recovery_pin: bool = False
    two_factor_enabled: bool = True
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class LoginResponse(BaseModel):
    two_factor_required: bool = False
    two_factor_token: Optional[str] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
    user: Optional[UserResponse] = None


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    v: Optional[int] = None
    purpose: Optional[str] = None


class RecoveryVerifyIdentifierRequest(BaseModel):
    identifier: str


class RecoveryVerifyIdentifierResponse(BaseModel):
    recovery_token: str
    masked_identifier: str
    has_pin: bool = True


class RecoveryVerifyPinRequest(BaseModel):
    recovery_token: str
    recovery_pin: str


class RecoveryVerifyPinResponse(BaseModel):
    reset_token: str
    message: str = "Recovery PIN verified successfully"


class RecoveryResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str


class SetRecoveryPinRequest(BaseModel):
    recovery_pin: str
