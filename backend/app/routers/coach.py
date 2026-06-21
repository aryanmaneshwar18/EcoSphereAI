from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.routers.auth import get_current_user
from app.models.user import User
from app.schemas import APIResponse
from app.services.ai_coach import AICoachService
from app.services.multi_agent import MultiAgentSystem
from pydantic import BaseModel
from sqlalchemy import select, func, and_
from app.models import CarbonActivity, Profile
from datetime import datetime, timedelta, UTC

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

@router.post("/insight")
async def generate_weekly_insight(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Any:
    """
    Generate a personalized weekly insight via GPT-4o.
    """
    coach = AICoachService()
    
    # Fetch real user profile
    profile_result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()
    
    user_profile_data = {
        "country": profile.country if profile else "unknown",
        "diet_type": profile.diet_preference if profile else "omnivore",
        "user_id": str(current_user.id)
    }

    # Fetch real emission data for the last 30 days
    thirty_days_ago = datetime.now(UTC) - timedelta(days=30)
    activities_result = await db.execute(
        select(CarbonActivity).where(
            and_(
                CarbonActivity.user_id == current_user.id,
                CarbonActivity.activity_date >= thirty_days_ago,
                CarbonActivity.deleted_at.is_(None)
            )
        )
    )
    activities = activities_result.scalars().all()
    
    total_co2e = sum(a.co2e for a in activities)
    transport_co2e = sum(a.co2e for a in activities if a.category == "transport")
    energy_co2e = sum(a.co2e for a in activities if a.category == "energy")
    food_co2e = sum(a.co2e for a in activities if a.category == "food")
    
    user_emission_data = {
        "total_co2e": round(total_co2e, 2),
        "transport": round(transport_co2e, 2),
        "energy": round(energy_co2e, 2),
        "food": round(food_co2e, 2)
    }
    
    insight = await coach.generate_weekly_insight(user_profile_data, user_emission_data)
    return APIResponse(data={"insight": insight})

@router.post("/query")
async def query_coach(
    request: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Any:
    """
    Ask EcoSphere AI a specific environmental question using the Multi-Agent system.
    """
    agent_system = MultiAgentSystem()
    user_context = {"user_id": str(current_user.id), "level": getattr(current_user.xp, "current_level", 1) if current_user.xp else 1}
    
    response = await agent_system.process_user_query(request.query, user_context)
    return APIResponse(data={"response": response})
