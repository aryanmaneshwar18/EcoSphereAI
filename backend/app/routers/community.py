from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas import APIResponse
from app.services.community import CommunityService

router = APIRouter()

@router.get("/leaderboard")
async def get_global_leaderboard(
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get the top users ranked by XP and impact score.
    """
    community = CommunityService(db)
    leaderboard = await community.get_global_leaderboard(limit)
    return APIResponse(data=leaderboard)

@router.get("/feed")
async def get_community_feed(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Get the latest community milestones and achievements.
    """
    community = CommunityService(db)
    feed = await community.get_community_feed(limit)
    return APIResponse(data=feed)
