from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    profile_image: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str


class UserResponse(UserBase):
    id: int
    profile_image: Optional[str] = None
    is_oauth: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


# Login schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Password reset schemas
class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)
