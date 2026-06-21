"""
EcoSphere AI - Notification Service
Manages push notifications, in-app alerts, and email dispatches.
"""

from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.workers.tasks import send_email
from app.models import Notification, NotificationType
import uuid

class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def send_in_app_notification(self, user_id: str, title: str, message: str, type: str):
        """
        Saves a notification to the database for the user to see in-app.
        """
        uid = uuid.UUID(user_id)
        
        try:
            notif_type = NotificationType(type)
        except ValueError:
            notif_type = NotificationType.SYSTEM
            
        notification = Notification(
            user_id=uid,
            title=title,
            message=message,
            type=notif_type,
            is_read=False
        )
        self.db.add(notification)
        await self.db.flush()
        return notification

    async def dispatch_weekly_summary(self, user_id: str, report_data: Dict[str, Any]):
        """
        Formats and dispatches the weekly email summary using the Celery worker.
        """
        # Format email body (in reality, use Jinja2 templates)
        body = f"Your weekly EcoSphere report is here. You emitted {report_data.get('total_co2e')} kg CO2e."
        
        # Dispatch to Celery queue
        # send_email.delay("user@example.com", "Your Weekly EcoSphere Impact", body)
        pass

    async def notify_streak_risk(self, user_id: str):
        """
        Alerts the user if their daily activity streak is at risk of breaking.
        """
        await self.send_in_app_notification(
            user_id,
            title="Streak at Risk! 🔥",
            message="Log an activity today to keep your streak alive.",
            type="warning"
        )
