"""
EcoSphere AI - Health Check Router
Provides liveness and readiness endpoints for monitoring and orchestration.
"""

from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db_session
from app.models import User, CarbonActivity, ActivityCategory, Streak, UserXP, Goal, GoalStatus
import random
from datetime import timedelta

router = APIRouter()
settings = get_settings()


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Returns the health status of the API.",
)
async def health_check():
    """Liveness probe — indicates the service is running."""
    return JSONResponse(
        content={
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT.value,
            "timestamp": datetime.now(UTC).isoformat(),
        }
    )


@router.get(
    "/ready",
    status_code=status.HTTP_200_OK,
    summary="Readiness check",
    description="Returns whether the service is ready to accept traffic.",
)
async def readiness_check(db: AsyncSession = Depends(get_db_session)):
    """Readiness probe — checks if all dependencies are available."""
    checks = {
        "database": False,
        "redis": True, # Redis is optional / deferred for Celery
    }

    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception as e:
        checks["database"] = False

    all_ready = all(checks.values())
    status_code = status.HTTP_200_OK if all_ready else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={
            "ready": all_ready,
            "checks": checks,
            "timestamp": datetime.now(UTC).isoformat(),
        },
    )


@router.post(
    "/seed",
    status_code=status.HTTP_201_CREATED,
    summary="Seed Database",
    description="Injects realistic mock data for the first registered user.",
)
async def seed_database(db: AsyncSession = Depends(get_db_session)):
    """Seeds the database with vibrant mock data for UI visualization."""
    # 1. Find the first user
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()

    if not user:
        return JSONResponse(status_code=400, content={"error": "No user found. Sign up on the frontend first."})

    now = datetime.now(UTC)

    # 2. Seed Streak
    streak_result = await db.execute(select(Streak).where(Streak.user_id == user.id))
    streak = streak_result.scalar_one_or_none()
    if not streak:
        streak = Streak(user_id=user.id, current_streak=15, longest_streak=21, last_activity_date=now)
        db.add(streak)
    else:
        streak.current_streak = 15
        streak.longest_streak = max(streak.longest_streak, 21)
        streak.last_activity_date = now

    # 3. Seed UserXP
    xp_result = await db.execute(select(UserXP).where(UserXP.user_id == user.id))
    user_xp = xp_result.scalar_one_or_none()
    if not user_xp:
        user_xp = UserXP(user_id=user.id, level=5, current_xp=2450, total_xp_earned=2450)
        db.add(user_xp)
    else:
        user_xp.level = 5
        user_xp.current_xp = 2450
        user_xp.total_xp_earned = 2450

    # 4. Seed Goals
    goal_result = await db.execute(select(Goal).where(Goal.user_id == user.id))
    existing_goals = goal_result.scalars().all()
    if not existing_goals:
        goals = [
            Goal(
                user_id=user.id,
                goal_type="reduction",
                title="Zero Waste Week",
                description="Eliminate all plastic waste for an entire week",
                target_value=0,
                current_value=0.3,
                unit="kg",
                status=GoalStatus.ACTIVE,
                start_date=now - timedelta(days=3),
                end_date=now + timedelta(days=7),
            ),
            Goal(
                user_id=user.id,
                goal_type="activity",
                title="Cycle to Work",
                description="Cycle 100km total commuting distance",
                target_value=100,
                current_value=65,
                unit="km",
                status=GoalStatus.ACTIVE,
                start_date=now - timedelta(days=10),
                end_date=now + timedelta(days=14),
            ),
            Goal(
                user_id=user.id,
                goal_type="diet",
                title="Vegan Month",
                description="Maintain a fully plant-based diet for 30 days",
                target_value=30,
                current_value=30,
                unit="days",
                status=GoalStatus.COMPLETED,
                start_date=now - timedelta(days=35),
                end_date=now - timedelta(days=5),
            ),
        ]
        db.add_all(goals)

    # 5. Clear existing activities for clean seeding
    await db.execute(text(f"DELETE FROM carbon_activities WHERE user_id = '{user.id}'"))

    # 6. Seed Activities (~90 activities over the last 30 days)
    activity_templates = [
        (ActivityCategory.TRANSPORT, "commute", "Cycled to work", 12, "km", 0.021, 0.25),
        (ActivityCategory.TRANSPORT, "commute", "Took the bus", 15, "km", 0.089, 1.34),
        (ActivityCategory.TRANSPORT, "commute", "Drove to office", 20, "km", 0.171, 3.42),
        (ActivityCategory.TRANSPORT, "commute", "Train commute", 30, "km", 0.041, 1.23),
        (ActivityCategory.TRANSPORT, "ride_share", "Carpooling", 25, "km", 0.085, 2.13),
        (ActivityCategory.FOOD, "meal", "Vegan lunch", 1, "meal", 0.5, 0.5),
        (ActivityCategory.FOOD, "meal", "Vegetarian dinner", 1, "meal", 1.2, 1.2),
        (ActivityCategory.FOOD, "meal", "Chicken dinner", 1, "meal", 3.5, 3.5),
        (ActivityCategory.FOOD, "grocery", "Organic grocery shopping", 5, "kg", 0.8, 4.0),
        (ActivityCategory.ENERGY, "electricity", "Home electricity", 8, "kWh", 0.233, 1.86),
        (ActivityCategory.ENERGY, "electricity", "Used solar power", 10, "kWh", 0.05, 0.5),
        (ActivityCategory.ENERGY, "heating", "Gas heating", 5, "kWh", 0.184, 0.92),
        (ActivityCategory.WASTE, "recycling", "Recycled paper & plastic", 2, "kg", 0.021, 0.04),
        (ActivityCategory.WASTE, "composting", "Composted food waste", 3, "kg", 0.01, 0.03),
        (ActivityCategory.WASTE, "landfill", "General waste", 1.5, "kg", 0.587, 0.88),
        (ActivityCategory.SHOPPING, "clothing", "Bought second-hand clothes", 2, "items", 3.0, 6.0),
        (ActivityCategory.SHOPPING, "electronics", "New phone charger", 1, "item", 8.0, 8.0),
        (ActivityCategory.WATER, "usage", "Daily water usage", 120, "liters", 0.001, 0.12),
    ]

    activities = []
    for i in range(90):
        days_ago = random.randint(0, 29)
        activity_date = now - timedelta(days=days_ago, hours=random.randint(6, 22), minutes=random.randint(0, 59))

        cat, subcat, name, base_amount, unit, ef, base_co2e = random.choice(activity_templates)

        # Add variance
        variance = random.uniform(0.6, 1.4)
        amount = round(base_amount * variance, 1)
        co2e = round(base_co2e * variance, 2)

        # Recent activities are lower (showing improvement)
        if days_ago < 7:
            co2e = round(co2e * 0.7, 2)

        activities.append(
            CarbonActivity(
                user_id=user.id,
                category=cat,
                subcategory=subcat,
                activity_name=name,
                amount=amount,
                unit=unit,
                emission_factor=ef,
                co2e=co2e,
                source="DEFRA",
                confidence_score=round(random.uniform(80.0, 98.0), 1),
                activity_date=activity_date,
            )
        )

    db.add_all(activities)
    await db.commit()

    return JSONResponse(
        status_code=201,
        content={
            "status": "success",
            "message": f"Seeded 90 activities, 3 goals, streak & XP for {user.email}",
        },
    )
