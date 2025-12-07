from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from app.core.database import get_db
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserResponse,
    Token,
    LoginRequest,
    PasswordResetRequest,
    PasswordReset,
    PasswordChange,
    UserUpdate
)
from app.utils.email import send_password_reset_email, generate_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_create: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user with email/password"""

    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_create.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user = User(
        email=user_create.email,
        name=user_create.name,
        hashed_password=get_password_hash(user_create.password),
        is_oauth=False
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email/password"""

    result = await db.execute(select(User).where(
        User.email == login_data.email,
        User.deleted_at.is_(None)
    ))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect"
        )

    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect"
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login/form", response_model=Token)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login with OAuth2 password flow (for Swagger UI)"""

    result = await db.execute(select(User).where(
        User.email == form_data.username,
        User.deleted_at.is_(None)
    ))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user profile"""

    if user_update.name:
        current_user.name = user_update.name
    if user_update.profile_image is not None:
        current_user.profile_image = user_update.profile_image

    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.post("/change-password")
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change password for logged-in user"""

    # Check if user has password (not OAuth only)
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change password for OAuth-only users"
        )

    # Verify current password
    if not verify_password(password_change.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Check new password confirmation
    if password_change.new_password != password_change.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password confirmation does not match"
        )

    # Update password
    current_user.hashed_password = get_password_hash(password_change.new_password)
    await db.commit()

    return {"message": "Password changed successfully"}


@router.post("/password-reset/request")
async def request_password_reset(
    reset_request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    """Request password reset email"""

    result = await db.execute(select(User).where(
        User.email == reset_request.email,
        User.deleted_at.is_(None)
    ))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if user and user.hashed_password:
        token = generate_token()
        # In production, store token in database with expiration
        # For simplicity, we'll just send it
        await send_password_reset_email(user.email, token)

    return {"message": "If the email exists, a reset link has been sent"}


@router.delete("/me")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete user account (soft delete)"""
    from datetime import datetime

    # Check if user owns any teams
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalar_one()

    # Simple check - in production, verify team ownership
    # If user owns teams, prevent deletion

    user.deleted_at = datetime.utcnow()
    await db.commit()

    return {"message": "Account deleted successfully"}


# ============ GOOGLE OAUTH ============
from pydantic import BaseModel

class GoogleTokenRequest(BaseModel):
    credential: str  # Google ID token from frontend

@router.post("/google", response_model=Token)
async def google_login(
    token_request: GoogleTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login or register via Google OAuth ID token"""
    import httpx
    
    # Verify the Google ID token
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={token_request.credential}"
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            google_data = response.json()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to verify Google token"
        )
    
    email = google_data.get("email")
    name = google_data.get("name", email.split("@")[0])
    picture = google_data.get("picture")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by Google"
        )
    
    # Check if user exists
    result = await db.execute(select(User).where(
        User.email == email,
        User.deleted_at.is_(None)
    ))
    user = result.scalar_one_or_none()
    
    if user:
        # Update profile image if available
        if picture and not user.profile_image:
            user.profile_image = picture
            await db.commit()
    else:
        # Create new user
        user = User(
            email=email,
            name=name,
            hashed_password=None,  # OAuth users don't have password
            is_oauth=True,
            profile_image=picture
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
