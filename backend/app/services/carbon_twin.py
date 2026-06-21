"""
EcoSphere AI - Carbon Twin & Forecasting Service
Simulates future environmental impact using predictive modeling, 
scenario analysis, and historical trend extrapolation.
"""

from typing import Dict, Any, List
from datetime import datetime, UTC
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.gamification import CarbonActivity
from sqlalchemy import select, and_

class CarbonTwinService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_current_trajectory(self, user_id: str) -> Dict[str, Any]:
        """
        Analyzes past activities to project the baseline annual trajectory.
        """
        # In a full implementation, we'd use moving averages and seasonality.
        # This is a simplified projection model for the architecture.
        stmt = select(CarbonActivity).where(
            and_(
                CarbonActivity.user_id == user_id,
                CarbonActivity.deleted_at.is_(None)
            )
        )
        result = await self.db.execute(stmt)
        activities = result.scalars().all()

        if not activities:
            return {"annual_projected_co2e": 0, "confidence": "low"}

        total_co2e = sum(a.co2e for a in activities)
        # Assume activities span the last 30 days for this simple projection
        # Annualized = total_co2e * (365/30)
        annualized = total_co2e * 12.16

        return {
            "annual_projected_co2e": round(annualized, 2),
            "historical_total": round(total_co2e, 2),
            "confidence": "medium"
        }

    def simulate_scenarios(self, base_annual_co2e: float, scenarios: List[str]) -> Dict[str, Any]:
        """
        Applies behavioral modifiers to the base trajectory.
        """
        savings_total = 0.0
        applied_scenarios = []

        # Scientific estimates for scenario impact
        SCENARIO_IMPACTS = {
            "solar": 1200.0,
            "ev": 2100.0,
            "diet": 950.0,
            "commute": 600.0
        }

        for s in scenarios:
            if s in SCENARIO_IMPACTS:
                savings_total += SCENARIO_IMPACTS[s]
                applied_scenarios.append(s)

        projected = max(0, base_annual_co2e - savings_total)

        # Generate a 5-year forecast array
        forecast = []
        for year in range(6):
            if year == 0:
                forecast.append({"year": f"Year {year}", "co2e": base_annual_co2e})
            else:
                # Include a slight natural degradation/improvement factor (e.g. 2% efficiency gain per year)
                efficiency_factor = 1.0 - (0.02 * year)
                forecast.append({
                    "year": f"Year {year}", 
                    "co2e": projected * efficiency_factor
                })

        return {
            "base_annual_co2e": base_annual_co2e,
            "projected_annual_co2e": projected,
            "total_savings": savings_total,
            "applied_scenarios": applied_scenarios,
            "five_year_forecast": forecast
        }
