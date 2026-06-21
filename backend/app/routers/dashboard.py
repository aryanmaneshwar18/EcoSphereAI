"""
EcoSphere AI - Dashboard Router
Aggregated dashboard data combining emissions, streaks, gamification, and insights.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db_session
from app.core.security import get_current_user_id
from app.models import (
    CarbonActivity,
    Streak,
    UserBadge,
    UserChallenge,
    UserXP,
)
from app.schemas import (
    APIResponse,
    ActivityResponse,
    DashboardResponse,
    ImpactEquivalency,
)
from app.services.emission_engine import EmissionEngine

router = APIRouter()
settings = get_settings()


@router.get(
    "",
    response_model=APIResponse[DashboardResponse],
    summary="Get dashboard data",
)
async def get_dashboard(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Retrieve comprehensive dashboard data including:
    - Current period emissions (day/week/month)
    - Category breakdown
    - Daily emission timeline
    - Weekly trend data
    - Streak & gamification stats
    - Recent activities
    - Impact equivalencies
    """
    uid = uuid.UUID(user_id)
    now = datetime.now(UTC)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)

    # ── Fetch activities for the month ─────────────────────────
    result = await db.execute(
        select(CarbonActivity).where(
            and_(
                CarbonActivity.user_id == uid,
                CarbonActivity.activity_date >= month_start,
                CarbonActivity.deleted_at.is_(None),
            )
        ).order_by(CarbonActivity.activity_date.desc())
    )
    month_activities = result.scalars().all()

    # ── Calculate period totals ────────────────────────────────
    total_month = sum(a.co2e for a in month_activities)
    total_week = sum(
        a.co2e for a in month_activities
        if a.activity_date >= week_start
    )
    total_today = sum(
        a.co2e for a in month_activities
        if a.activity_date >= today_start
    )

    # ── Category breakdown ─────────────────────────────────────
    breakdown: dict[str, float] = {}
    for activity in month_activities:
        cat = activity.category.value if hasattr(activity.category, "value") else activity.category
        breakdown[cat] = breakdown.get(cat, 0.0) + activity.co2e

    # ── Daily emissions (last 30 days) ─────────────────────────
    daily_emissions: list[dict] = []
    for days_ago in range(29, -1, -1):
        date = (today_start - timedelta(days=days_ago)).date()
        day_total = sum(
            a.co2e for a in month_activities
            if a.activity_date.date() == date
        )
        daily_emissions.append({
            "date": date.isoformat(),
            "co2e": round(day_total, 2),
        })

    # ── Weekly trend (last 12 weeks) ───────────────────────────
    trend_start = week_start - timedelta(weeks=11)
    
    # Execute a single aggregated query grouped by week
    trend_result = await db.execute(
        select(
            func.date_trunc('week', CarbonActivity.activity_date).label('week'),
            func.sum(CarbonActivity.co2e).label('total')
        ).where(
            and_(
                CarbonActivity.user_id == uid,
                CarbonActivity.activity_date >= trend_start,
                CarbonActivity.deleted_at.is_(None)
            )
        ).group_by(
            func.date_trunc('week', CarbonActivity.activity_date)
        )
    )
    
    # Build lookup dictionary from results
    weekly_data = {row.week.date(): float(row.total) for row in trend_result.all()}
    
    # Pad the last 12 weeks sequentially
    weekly_trend: list[dict] = []
    for weeks_ago in range(11, -1, -1):
        w_start = (week_start - timedelta(weeks=weeks_ago)).date()
        weekly_trend.append({
            "week_start": w_start.isoformat(),
            "co2e": round(weekly_data.get(w_start, 0.0), 2)
        })

    # ── Carbon budget ──────────────────────────────────────────
    monthly_budget = settings.monthly_carbon_budget_kg
    budget_remaining = max(0, monthly_budget - total_month)
    budget_used_pct = min(100, (total_month / monthly_budget) * 100) if monthly_budget > 0 else 0

    # ── Streak & XP ────────────────────────────────────────────
    streak_result = await db.execute(
        select(Streak).where(Streak.user_id == uid)
    )
    streak = streak_result.scalar_one_or_none()

    xp_result = await db.execute(
        select(UserXP).where(UserXP.user_id == uid)
    )
    xp = xp_result.scalar_one_or_none()

    # ── Badges count ───────────────────────────────────────────
    badges_result = await db.execute(
        select(func.count()).select_from(UserBadge).where(
            UserBadge.user_id == uid
        )
    )
    badges_count = badges_result.scalar() or 0

    # ── Active challenges ──────────────────────────────────────
    challenges_result = await db.execute(
        select(func.count()).select_from(UserChallenge).where(
            and_(
                UserChallenge.user_id == uid,
                UserChallenge.completed.is_(False),
            )
        )
    )
    active_challenges = challenges_result.scalar() or 0

    # ── Recent activities ──────────────────────────────────────
    recent = month_activities[:5]

    # ── Impact equivalencies ───────────────────────────────────
    engine = EmissionEngine()
    equivalencies = engine.calculate_equivalencies(total_month)

    return APIResponse(
        success=True,
        message="Dashboard data retrieved",
        data=DashboardResponse(
            user_id=uid,
            total_co2e_month=round(total_month, 2),
            total_co2e_week=round(total_week, 2),
            total_co2e_today=round(total_today, 2),
            carbon_budget_remaining=round(budget_remaining, 2),
            carbon_budget_total=round(monthly_budget, 2),
            budget_percentage_used=round(budget_used_pct, 1),
            category_breakdown={k: round(v, 2) for k, v in breakdown.items()},
            daily_emissions=daily_emissions,
            weekly_trend=weekly_trend,
            streak=streak.current_streak if streak else 0,
            level=xp.current_level if xp else 1,
            xp=xp.total_xp if xp else 0,
            recent_activities=[
                ActivityResponse.model_validate(a) for a in recent
            ],
            active_challenges=active_challenges,
            badges_earned=badges_count,
            impact_equivalencies=equivalencies,
        ),
        timestamp=datetime.now(UTC),
    )


@router.get(
    "/impact",
    response_model=APIResponse[ImpactEquivalency],
    summary="Get impact equivalencies",
)
async def get_impact_equivalencies(
    co2e_kg: float = 0.0,
    user_id: str = Depends(get_current_user_id),
):
    """Convert CO₂e into tangible impact equivalencies."""
    engine = EmissionEngine()
    equivalencies = engine.calculate_equivalencies(co2e_kg)

    return APIResponse(
        success=True,
        message="Impact equivalencies calculated",
        data=ImpactEquivalency(**equivalencies),
        timestamp=datetime.now(UTC),
    )
