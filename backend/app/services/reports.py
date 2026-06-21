"""
EcoSphere AI - Report Generation Service
Generates PDF and JSON data reports for user impact analysis.
"""

from typing import Dict, Any
from datetime import datetime, UTC
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, extract, and_
from app.models import CarbonActivity
import uuid

class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_monthly_report(self, user_id: str, month: int, year: int) -> Dict[str, Any]:
        """
        Aggregates a user's monthly data into a standardized report structure.
        In a production environment, this data would be passed to a PDF generation
        library like ReportLab or WeasyPrint.
        """
        uid = uuid.UUID(user_id)
        
        # Query for this month
        result = await self.db.execute(
            select(CarbonActivity)
            .where(CarbonActivity.user_id == uid)
            .where(extract('month', CarbonActivity.activity_date) == month)
            .where(extract('year', CarbonActivity.activity_date) == year)
            .where(CarbonActivity.deleted_at.is_(None))
        )
        current_activities = result.scalars().all()
        
        # Query for previous month
        prev_month = month - 1 if month > 1 else 12
        prev_year = year if month > 1 else year - 1
        
        prev_result = await self.db.execute(
            select(CarbonActivity)
            .where(CarbonActivity.user_id == uid)
            .where(extract('month', CarbonActivity.activity_date) == prev_month)
            .where(extract('year', CarbonActivity.activity_date) == prev_year)
            .where(CarbonActivity.deleted_at.is_(None))
        )
        prev_activities = prev_result.scalars().all()
        
        # Calculate totals
        total_co2e = sum(a.co2e for a in current_activities)
        prev_total = sum(a.co2e for a in prev_activities)
        
        if prev_total > 0:
            vs_previous = ((total_co2e - prev_total) / prev_total) * 100
        else:
            vs_previous = 0.0
            
        # Category breakdown
        breakdown = {}
        for a in current_activities:
            cat = a.category.value if hasattr(a.category, 'value') else a.category
            breakdown[cat] = breakdown.get(cat, 0.0) + a.co2e
            
        top_category = max(breakdown.items(), key=lambda x: x[1])[0] if breakdown else "none"
        
        # Simple heuristic insights based on data
        ai_insights = []
        if vs_previous < 0:
            ai_insights.append(f"Great job! Your emissions dropped by {abs(vs_previous):.1f}% compared to last month.")
        elif vs_previous > 0:
            ai_insights.append(f"Your emissions increased by {vs_previous:.1f}% this month. Let's look for ways to reduce impact.")
            
        if breakdown:
            ai_insights.append(f"Your highest emission source was '{top_category}' ({breakdown[top_category]:.1f} kg CO2e). Focus on optimizing this area next month.")
        else:
            ai_insights.append("No activities logged this month. Start tracking to get personalized insights!")
        
        return {
            "user_id": user_id,
            "report_period": f"{year}-{month:02d}",
            "generated_at": datetime.now(UTC).isoformat(),
            "summary": {
                "total_co2e": round(total_co2e, 2),
                "vs_previous_month": round(vs_previous, 1),
                "top_category": top_category
            },
            "category_breakdown": {k: round(v, 2) for k, v in breakdown.items()},
            "achievements": [],
            "ai_insights": ai_insights
        }
