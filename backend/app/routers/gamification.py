from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.routers.auth import get_current_user
from app.models import User
from app.schemas import APIResponse
from app.services.gamification import GamificationService

router = APIRouter()

@router.get("/state")
async def get_gamification_state(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> APIResponse[Any]:
    """
    Retrieve the current gamification state (XP, Level, Streak, Badges) for the user.
    """
    gamification = GamificationService(db)
    try:
        state = await gamification.get_user_gamification_state(current_user.id)
        return APIResponse(data=state)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve gamification state: {str(e)}"
        )
