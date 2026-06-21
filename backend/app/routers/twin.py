from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.core.security import get_current_user
from app.models.user import User
from app.schemas import APIResponse
from app.services.carbon_twin import CarbonTwinService
from pydantic import BaseModel

router = APIRouter()

class ScenarioRequest(BaseModel):
    scenarios: list[str]

@router.get("/trajectory")
async def get_current_trajectory(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Any:
    """
    Get the projected baseline carbon trajectory for the current user.
    """
    twin_service = CarbonTwinService(db)
    trajectory = await twin_service.get_current_trajectory(current_user.id)
    return APIResponse(data=trajectory)

@router.post("/simulate")
async def simulate_scenarios(
    request: ScenarioRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Any:
    """
    Simulate future trajectories based on proposed behavioral scenarios.
    """
    twin_service = CarbonTwinService(db)
    
    # Get current trajectory to establish baseline
    trajectory = await twin_service.get_current_trajectory(current_user.id)
    base_annual_co2e = trajectory.get("annual_projected_co2e", 5000.0) # Fallback to 5t if no data
    
    # Run simulation
    simulation_results = twin_service.simulate_scenarios(base_annual_co2e, request.scenarios)
    return APIResponse(data=simulation_results)
