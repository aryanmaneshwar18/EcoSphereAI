"""
EcoSphere AI - Profile Router
User profile management including retrieval and updates.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.security import get_current_user_id
from app.models import Profile
from app.schemas import APIResponse, ProfileResponse, ProfileUpdateRequest

router = APIRouter()


@router.get(
    "/me",
    response_model=APIResponse[ProfileResponse],
    summary="Get current user's profile",
)
async def get_my_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Retrieve the authenticated user's profile."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return APIResponse(
        success=True,
        message="Profile retrieved successfully",
        data=ProfileResponse.model_validate(profile),
        timestamp=datetime.now(UTC),
    )


@router.patch(
    "/me",
    response_model=APIResponse[ProfileResponse],
    summary="Update current user's profile",
)
async def update_my_profile(
    request: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Update the authenticated user's profile. Only provided fields are updated."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    # Apply only provided fields (exclude unset)
    update_data = request.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(profile, field):
            setattr(profile, field, value.value if hasattr(value, "value") else value)

    await db.flush()

    return APIResponse(
        success=True,
        message="Profile updated successfully",
        data=ProfileResponse.model_validate(profile),
        timestamp=datetime.now(UTC),
    )
