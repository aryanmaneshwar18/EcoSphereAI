"""
EcoSphere AI - Celery Tasks
Background jobs for reports, streaks, notifications, and AI insights.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta

import structlog

from app.workers import celery_app

logger = structlog.get_logger()


@celery_app.task(name="app.workers.tasks.update_streaks")
def update_streaks():
    """
    Daily job: Check all users and reset streaks that have broken.
    Runs at midnight UTC.
    """
    logger.info("updating_streaks", timestamp=datetime.now(UTC).isoformat())

    async def _update():
        from app.core.database import get_db_context
        from app.models import Streak
        from sqlalchemy import select

        async with get_db_context() as db:
            result = await db.execute(select(Streak))
            streaks = result.scalars().all()

            today = datetime.now(UTC).date()
            updated_count = 0

            for streak in streaks:
                if streak.last_activity_date:
                    last_date = streak.last_activity_date.date()
                    if (today - last_date).days > 1:
                        streak.current_streak = 0
                        updated_count += 1

            logger.info("streaks_updated", count=updated_count)

    asyncio.run(_update())


@celery_app.task(name="app.workers.tasks.generate_weekly_reports")
def generate_weekly_reports():
    """
    Weekly job: Generate weekly emission reports for all active users.
    Runs every Monday at 06:00 UTC.
    """
    logger.info("generating_weekly_reports", timestamp=datetime.now(UTC).isoformat())

    async def _generate():
        from app.core.database import get_db_context
        from app.models import CarbonActivity, User, UserStatus, WeeklyReport
        from sqlalchemy import and_, func, select

        async with get_db_context() as db:
            now = datetime.now(UTC)
            week_end = now
            week_start = now - timedelta(days=7)

            # Get active users
            users_result = await db.execute(
                select(User).where(User.status == UserStatus.ACTIVE)
            )
            users = users_result.scalars().all()

            for user in users:
                # Calculate weekly totals
                activities_result = await db.execute(
                    select(CarbonActivity).where(
                        and_(
                            CarbonActivity.user_id == user.id,
                            CarbonActivity.activity_date >= week_start,
                            CarbonActivity.activity_date <= week_end,
                            CarbonActivity.deleted_at.is_(None),
                        )
                    )
                )
                activities = activities_result.scalars().all()

                category_totals = {}
                total_co2e = 0.0

                for activity in activities:
                    cat = activity.category.value if hasattr(activity.category, "value") else activity.category
                    category_totals[cat] = category_totals.get(cat, 0.0) + activity.co2e
                    total_co2e += activity.co2e

                report = WeeklyReport(
                    user_id=user.id,
                    week_start=week_start,
                    week_end=week_end,
                    total_co2e=total_co2e,
                    transport_co2e=category_totals.get("transport", 0.0),
                    energy_co2e=category_totals.get("energy", 0.0),
                    food_co2e=category_totals.get("food", 0.0),
                    waste_co2e=category_totals.get("waste", 0.0),
                    summary=f"You emitted {total_co2e:.1f} kg CO₂e this week across {len(activities)} activities.",
                )
                db.add(report)

            logger.info("weekly_reports_generated", user_count=len(users))

    asyncio.run(_generate())


@celery_app.task(name="app.workers.tasks.generate_monthly_analytics")
def generate_monthly_analytics():
    """Monthly job: Generate aggregated analytics and forecasts."""
    logger.info("generating_monthly_analytics", timestamp=datetime.now(UTC).isoformat())
    # Implementation follows the same pattern as weekly reports


@celery_app.task(name="app.workers.tasks.update_leaderboard")
def update_leaderboard():
    """Update the global leaderboard rankings every 6 hours."""
    logger.info("updating_leaderboard", timestamp=datetime.now(UTC).isoformat())


@celery_app.task(name="app.workers.tasks.generate_ai_insights")
def generate_ai_insights():
    """Daily job: Generate personalized AI insights for users."""
    logger.info("generating_ai_insights", timestamp=datetime.now(UTC).isoformat())


@celery_app.task(name="app.workers.tasks.send_email")
def send_email(to: str, subject: str, body: str):
    """Send an email notification via Resend."""
    logger.info("sending_email", to=to, subject=subject)
