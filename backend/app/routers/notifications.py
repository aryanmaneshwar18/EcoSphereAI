from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.models.user import User
from app.models import Notification
from app.schemas import APIResponse
from app.services.notifications import NotificationService
import uuid

router = APIRouter()

@router.get("")
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Any:
    """
    Get all unread notifications for the user.
    """
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .where(Notification.is_read == False)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    notifications = result.scalars().all()
    
    return APIResponse(
        success=True,
        message="Notifications retrieved",
        data=[
            {
                "id": str(n.id),
                "title": n.title,
                "message": n.message,
                "type": n.type.value,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            }
            for n in notifications
        ]
    )

@router.post("/read/{notification_id}")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Any:
    """
    Mark a specific notification as read.
    """
    try:
        notif_id = uuid.UUID(notification_id)
    except ValueError:
        return APIResponse(success=False, message="Invalid notification ID", data=None)

    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .where(Notification.id == notif_id)
    )
    notif = result.scalar_one_or_none()
    
    if notif:
        notif.is_read = True
        await db.flush()

    return APIResponse(
        success=True,
        message="Notification marked as read",
        data={"id": notification_id, "read": True}
    )
