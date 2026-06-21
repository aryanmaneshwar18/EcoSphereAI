"""
EcoSphere AI - Activities Router
CRUD operations for carbon activity logging with automatic emission calculation.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.security import get_current_user_id
from app.models import CarbonActivity, Streak
from app.schemas import (
    APIResponse,
    ActivityCreateRequest,
    ActivityResponse,
    ActivitySummary,
    PaginatedResponse,
)
from app.services.emission_engine import EmissionEngine

router = APIRouter()


@router.post(
    "",
    response_model=APIResponse[ActivityResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Log a carbon activity",
)
async def create_activity(
    request: ActivityCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Log a new carbon activity.
    Automatically calculates CO₂e using the emission engine with
    IPCC/DEFRA/EPA emission factors.
    """
    uid = uuid.UUID(user_id)
    engine = EmissionEngine()

    # Calculate emissions
    emission_result = engine.calculate_emission(
        category=request.category.value,
        subcategory=request.subcategory,
        amount=request.amount,
        unit=request.unit,
    )

    activity = CarbonActivity(
        user_id=uid,
        category=request.category.value,
        subcategory=request.subcategory,
        activity_name=request.activity_name,
        amount=request.amount,
        unit=request.unit,
        emission_factor=emission_result["emission_factor"],
        co2e=emission_result["co2e"],
        source=emission_result["source"],
        confidence_score=emission_result["confidence_score"],
        activity_date=request.activity_date,
        metadata_json=request.metadata_json,
    )
    db.add(activity)
    await db.flush()

    # Update streak
    await _update_streak(uid, db)

    return APIResponse(
        success=True,
        message=f"Activity logged: {emission_result['co2e']:.2f} kg CO₂e",
        data=ActivityResponse.model_validate(activity),
        timestamp=datetime.now(UTC),
    )


@router.get(
    "",
    response_model=PaginatedResponse[ActivityResponse],
    summary="List user activities",
)
async def list_activities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: str | None = Query(None),
    start_date: datetime | None = Query(None),
    end_date: datetime | None = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    """List carbon activities with filtering and pagination."""
    uid = uuid.UUID(user_id)

    query = select(CarbonActivity).where(
        and_(
            CarbonActivity.user_id == uid,
            CarbonActivity.deleted_at.is_(None),
        )
    )

    if category:
        query = query.where(CarbonActivity.category == category)
    if start_date:
        query = query.where(CarbonActivity.activity_date >= start_date)
    if end_date:
        query = query.where(CarbonActivity.activity_date <= end_date)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = (
        query.order_by(CarbonActivity.activity_date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    result = await db.execute(query)
    activities = result.scalars().all()

    return PaginatedResponse(
        data=[ActivityResponse.model_validate(a) for a in activities],
        total=total,
        page=page,
        page_size=page_size,
        has_next=(page * page_size) < total,
        has_previous=page > 1,
        timestamp=datetime.now(UTC),
    )


@router.get(
    "/summary",
    response_model=APIResponse[ActivitySummary],
    summary="Get activity summary for a period",
)
async def get_activity_summary(
    period: str = Query("month", regex="^(week|month|year)$"),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Get aggregated activity summary with category breakdown."""
    uid = uuid.UUID(user_id)
    now = datetime.now(UTC)

    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=365)

    # Get activities in period
    result = await db.execute(
        select(CarbonActivity).where(
            and_(
                CarbonActivity.user_id == uid,
                CarbonActivity.activity_date >= start_date,
                CarbonActivity.deleted_at.is_(None),
            )
        )
    )
    activities = result.scalars().all()

    # Calculate breakdown
    breakdown: dict[str, float] = {}
    total_co2e = 0.0
    for activity in activities:
        cat = activity.category.value if hasattr(activity.category, "value") else activity.category
        breakdown[cat] = breakdown.get(cat, 0.0) + activity.co2e
        total_co2e += activity.co2e

    return APIResponse(
        success=True,
        message="Activity summary retrieved",
        data=ActivitySummary(
            total_co2e=round(total_co2e, 2),
            category_breakdown={k: round(v, 2) for k, v in breakdown.items()},
            activity_count=len(activities),
            period_start=start_date,
            period_end=now,
        ),
        timestamp=datetime.now(UTC),
    )


@router.delete(
    "/{activity_id}",
    response_model=APIResponse,
    summary="Soft delete an activity",
)
async def delete_activity(
    activity_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Soft delete a carbon activity."""
    uid = uuid.UUID(user_id)

    result = await db.execute(
        select(CarbonActivity).where(
            and_(
                CarbonActivity.id == activity_id,
                CarbonActivity.user_id == uid,
                CarbonActivity.deleted_at.is_(None),
            )
        )
    )
    activity = result.scalar_one_or_none()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found",
        )

    activity.deleted_at = datetime.now(UTC)
    await db.flush()

    return APIResponse(
        success=True,
        message="Activity deleted successfully",
        timestamp=datetime.now(UTC),
    )


async def _update_streak(user_id: uuid.UUID, db: AsyncSession) -> None:
    """Update user's activity streak after logging an activity."""
    result = await db.execute(select(Streak).where(Streak.user_id == user_id))
    streak = result.scalar_one_or_none()

    if not streak:
        return

    today = datetime.now(UTC).date()
    last_date = streak.last_activity_date.date() if streak.last_activity_date else None

    if last_date == today:
        return  # Already logged today
    elif last_date == today - timedelta(days=1):
        streak.current_streak += 1
    else:
        streak.current_streak = 1

    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak

    streak.last_activity_date = datetime.now(UTC)
    await db.flush()
