"""
EcoSphere AI - Onboarding Router
Handles the onboarding questionnaire and baseline footprint calculation.
Uses scientific emission factors from IPCC, DEFRA, and EPA.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db_session
from app.core.security import get_current_user_id
from app.models import Profile, User, UserStatus
from app.schemas import APIResponse, OnboardingRequest, OnboardingResponse
from app.services.emission_engine import EmissionEngine

router = APIRouter()
settings = get_settings()


@router.post(
    "/complete",
    response_model=APIResponse[OnboardingResponse],
    status_code=status.HTTP_200_OK,
    summary="Complete onboarding questionnaire",
)
async def complete_onboarding(
    request: OnboardingRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Process the onboarding questionnaire and calculate baseline carbon footprint.

    The baseline is calculated using scientifically-backed emission factors from
    IPCC AR6, DEFRA 2025, and EPA data. Each category (transport, energy, food,
    waste) contributes to the annual footprint estimate.
    """
    uid = uuid.UUID(user_id)

    # Retrieve profile
    result = await db.execute(select(Profile).where(Profile.user_id == uid))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please register first.",
        )

    if profile.onboarding_completed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Onboarding has already been completed.",
        )

    # Calculate baseline footprint
    engine = EmissionEngine()
    baseline = engine.calculate_baseline(
        country=request.country,
        diet_type=request.diet_type.value,
        vehicle_type=request.vehicle_type.value,
        daily_commute_km=request.daily_commute_km,
        flights_per_year=request.flights_per_year,
        monthly_electricity_kwh=request.monthly_electricity_kwh,
        has_solar=request.has_solar,
        heating_type=request.heating_type,
        household_size=request.household_size,
    )

    # Update profile
    profile.age = request.age
    profile.country = request.country
    profile.state = request.state
    profile.city = request.city
    profile.gender = request.gender
    profile.household_size = request.household_size
    profile.diet_type = request.diet_type.value
    profile.vehicle_type = request.vehicle_type.value
    profile.occupation = request.occupation
    profile.baseline_co2e_kg = baseline["total_annual"]
    profile.onboarding_completed = True

    # Update user status
    user_result = await db.execute(select(User).where(User.id == uid))
    user = user_result.scalar_one()
    user.status = UserStatus.ACTIVE

    await db.flush()

    # Compare with averages
    comparison = engine.get_comparison(
        user_annual_co2e=baseline["total_annual"],
        country=request.country,
    )

    # Generate initial recommendations
    top_recommendations = engine.get_top_recommendations(
        breakdown=baseline["breakdown"],
        diet_type=request.diet_type.value,
        vehicle_type=request.vehicle_type.value,
    )

    return APIResponse(
        success=True,
        message="Onboarding completed successfully",
        data=OnboardingResponse(
            user_id=uid,
            baseline_co2e_kg_annual=baseline["total_annual"],
            baseline_co2e_kg_monthly=baseline["total_annual"] / 12,
            breakdown=baseline["breakdown"],
            comparison=comparison,
            top_recommendations=top_recommendations,
        ),
        timestamp=datetime.now(UTC),
    )
