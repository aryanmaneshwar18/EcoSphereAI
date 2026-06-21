from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db_session
from app.routers.auth import get_current_user
from app.models import User
from app.schemas import APIResponse
from app.services.reports import ReportService
import datetime

router = APIRouter()

@router.get("/monthly")
async def get_monthly_report(
    month: int = datetime.datetime.now().month,
    year: int = datetime.datetime.now().year,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
) -> Any:
    """
    Get a comprehensive monthly carbon footprint report.
    """
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Invalid month")
        
    report_service = ReportService(db)
    report = await report_service.generate_monthly_report(str(current_user.id), month, year)
    
    return APIResponse(
        success=True,
        message=f"Report generated for {year}-{month:02d}",
        data=report
    )
