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
from app.models import User, CarbonActivity, ActivityCategory, Streak, UserXP, Goal, GoalStatus, Difficulty
import random
import uuid
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
    description="Injects massive amounts of realistic mock data for the first registered user to populate the dashboard.",
)
async def seed_database(db: AsyncSession = Depends(get_db_session)):
    """Seeds the database with vibrant mock data for UI visualization."""
    # 1. Find the first user
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    
    if not user:
        return JSONResponse(status_code=400, content={"error": "No user found in the database. Please sign up on the frontend first."})

    now = datetime.now(UTC)
    
    # 2. Seed Streak
    streak_result = await db.execute(select(Streak).where(Streak.user_id == user.id))
    streak = streak_result.scalar_one_or_none()
    if not streak:
        streak = Streak(user_id=user.id, current_streak=15, longest_streak=21, last_activity_date=now)
        db.add(streak)
    else:
        streak.current_streak = 15
        streak.last_activity_date = now

    # 3. Seed UserXP
    xp_result = await db.execute(select(UserXP).where(UserXP.user_id == user.id))
    user_xp = xp_result.scalar_one_or_none()
    if not user_xp:
        user_xp = UserXP(user_id=user.id, level=5, current_xp=2450, total_xp_earned=2450)
        db.add(user_xp)

    # 4. Seed Goals
    goal_result = await db.execute(select(Goal).where(Goal.user_id == user.id))
    if not goal_result.scalars().first():
        goals = [
            Goal(user_id=user.id, title="Zero Waste Week", description="No plastic waste", category=ActivityCategory.WASTE, difficulty=Difficulty.MEDIUM, target_value=0, current_value=0, unit="kg", status=GoalStatus.ACTIVE, end_date=now + timedelta(days=7)),
            Goal(user_id=user.id, title="Cycle to Work", description="100km cycling", category=ActivityCategory.TRANSPORT, difficulty=Difficulty.EASY, target_value=100, current_value=65, unit="km", status=GoalStatus.ACTIVE, end_date=now + timedelta(days=14)),
            Goal(user_id=user.id, title="Vegan Month", description="Plant based diet", category=ActivityCategory.FOOD, difficulty=Difficulty.HARD, target_value=30, current_value=30, unit="days", status=GoalStatus.COMPLETED, end_date=now - timedelta(days=1))
        ]
        db.add_all(goals)

    # 5. Seed Activities (Generate ~60 activities over the last 30 days)
    # Clear existing activities for clean seeding
    await db.execute(text(f"DELETE FROM carbon_activities WHERE user_id = '{user.id}'"))
    
    activities = []
    categories = [
        (ActivityCategory.TRANSPORT, 2.5, "Cycled to work"),
        (ActivityCategory.TRANSPORT, 5.0, "Took the train"),
        (ActivityCategory.FOOD, 4.0, "Vegan lunch"),
        (ActivityCategory.ENERGY, 8.0, "Used solar power"),
        (ActivityCategory.WASTE, 1.5, "Composted food waste"),
        (ActivityCategory.TRANSPORT, 12.0, "Carpooling"),
        (ActivityCategory.SHOPPING, 15.0, "Bought second-hand clothes")
    ]
    
    # Generate a realistic trend (higher in the past, lower recently to show a downward trend)
    for i in range(60):
        days_ago = random.randint(0, 29)
        activity_date = now - timedelta(days=days_ago)
        
        # Select random category
        cat, base_co2e, title = random.choice(categories)
        
        # Add some random variance
        variance = random.uniform(0.5, 1.5)
        co2e = base_co2e * variance
        
        # If it's more recent, make it slightly lower to show improvement
        if days_ago < 7:
            co2e = co2e * 0.8
            
        activities.append(
            CarbonActivity(
                user_id=user.id,
                category=cat,
                title=title,
                co2e=round(co2e, 2),
                activity_date=activity_date
            )
        )
    
    db.add_all(activities)
    await db.commit()
    
    return JSONResponse(status_code=201, content={"status": "success", "message": f"Successfully seeded data for user {user.email}"})
