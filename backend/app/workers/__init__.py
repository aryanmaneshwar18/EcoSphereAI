"""
EcoSphere AI - Celery Application Configuration
Configures Celery workers, beat scheduler, and task routing.
"""

from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "ecosphere_ai",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minute hard limit
    task_soft_time_limit=240,  # 4 minute soft limit
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
)

# ── Beat Schedule ─────────────────────────────────────────────
celery_app.conf.beat_schedule = {
    "update-daily-streaks": {
        "task": "app.workers.tasks.update_streaks",
        "schedule": crontab(hour=0, minute=5),  # Daily at 00:05 UTC
    },
    "generate-weekly-reports": {
        "task": "app.workers.tasks.generate_weekly_reports",
        "schedule": crontab(hour=6, minute=0, day_of_week=1),  # Monday 06:00 UTC
    },
    "generate-monthly-analytics": {
        "task": "app.workers.tasks.generate_monthly_analytics",
        "schedule": crontab(hour=3, minute=0, day_of_month=1),  # 1st of month 03:00 UTC
    },
    "update-leaderboard": {
        "task": "app.workers.tasks.update_leaderboard",
        "schedule": crontab(hour="*/6"),  # Every 6 hours
    },
    "generate-ai-insights": {
        "task": "app.workers.tasks.generate_ai_insights",
        "schedule": crontab(hour=8, minute=0),  # Daily at 08:00 UTC
    },
}

# ── Task Routing ──────────────────────────────────────────────
celery_app.conf.task_routes = {
    "app.workers.tasks.generate_ai_insights": {"queue": "ai"},
    "app.workers.tasks.send_email": {"queue": "email"},
    "app.workers.tasks.update_leaderboard": {"queue": "default"},
    "app.workers.tasks.generate_weekly_reports": {"queue": "reports"},
    "app.workers.tasks.generate_monthly_analytics": {"queue": "reports"},
}

# Auto-discover tasks in the workers package
celery_app.autodiscover_tasks(["app.workers"])
