"""
EcoSphere AI - Authentication Router
Handles user registration, login, token refresh, and user retrieval.
Supports both internal JWT and Clerk-delegated authentication.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from svix.webhooks import Webhook, WebhookVerificationError

from app.core.config import get_settings

from app.core.database import get_db_session
from app.core.security import (
    create_access_token,
    get_current_user_id,
    hash_password,
    verify_password,
)
from app.models import Profile, Streak, User, UserPreference, UserStatus, UserXP
from app.schemas import (
    APIResponse,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)

router = APIRouter()
settings = get_settings()


@router.post(
    "/register",
    response_model=APIResponse[AuthResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db_session),
):
    """
    Register a new user account.
    Creates user, profile, preferences, streak, and XP records atomically.
    """
    # Check for existing user
    existing = await db.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    if request.username:
        existing_username = await db.execute(
            select(User).where(User.username == request.username)
        )
        if existing_username.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This username is already taken",
            )

    # Create user
    user = User(
        email=request.email,
        username=request.username,
        password_hash=hash_password(request.password),
        status=UserStatus.ONBOARDING,
    )
    db.add(user)
    await db.flush()

    # Create associated records
    profile = Profile(user_id=user.id)
    preferences = UserPreference(user_id=user.id)
    streak = Streak(user_id=user.id)
    xp = UserXP(user_id=user.id)

    db.add_all([profile, preferences, streak, xp])
    await db.flush()

    # Generate access token
    access_token = create_access_token(data={"sub": str(user.id)})

    return APIResponse(
        success=True,
        message="Account created successfully",
        data=AuthResponse(
            user_id=user.id,
            email=user.email,
            access_token=access_token,
        ),
        timestamp=datetime.now(UTC),
    )


@router.post(
    "/login",
    response_model=APIResponse[AuthResponse],
    summary="Login with email and password",
)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db_session),
):
    """Authenticate user with email and password."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return APIResponse(
        success=True,
        message="Login successful",
        data=AuthResponse(
            user_id=user.id,
            email=user.email,
            access_token=access_token,
        ),
        timestamp=datetime.now(UTC),
    )


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Get current user",
)
async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Get the currently authenticated user's information."""
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return APIResponse(
        success=True,
        message="User retrieved successfully",
        data=UserResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            avatar_url=user.avatar_url,
            role=user.role.value,
            status=user.status.value,
            created_at=user.created_at,
        ),
        timestamp=datetime.now(UTC),
    )

@router.post("/webhook/clerk", status_code=status.HTTP_200_OK)
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db_session)):
    """
    Handle Clerk webhooks to synchronize user creation/updates.
    Requires CLERK_WEBHOOK_SECRET environment variable.
    """
    webhook_secret = getattr(settings, "CLERK_WEBHOOK_SECRET", None)
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Clerk webhook secret not configured")

    headers = request.headers
    payload = await request.body()

    try:
        wh = Webhook(webhook_secret)
        evt = wh.verify(payload, headers)
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid svix signature")

    event_type = evt.get("type")
    data = evt.get("data", {})

    if event_type == "user.created":
        email_addresses = data.get("email_addresses", [])
        email = email_addresses[0]["email_address"] if email_addresses else "unknown@clerk.dev"
        
        # Check if exists
        existing = await db.execute(select(User).where(User.email == email))
        if not existing.scalar_one_or_none():
            user = User(
                email=email,
                username=data.get("username") or email.split("@")[0],
                status=UserStatus.ONBOARDING,
            )
            db.add(user)
            await db.flush()
            
            # Create sub-records
            db.add_all([
                Profile(user_id=user.id),
                UserPreference(user_id=user.id),
                Streak(user_id=user.id),
                UserXP(user_id=user.id)
            ])
            await db.commit()

    return {"success": True}

