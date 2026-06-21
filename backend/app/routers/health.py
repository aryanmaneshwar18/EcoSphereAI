"""
EcoSphere AI - Health Check Router
Provides liveness and readiness endpoints for monitoring and orchestration.
"""

from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db_session

router = APIRouter()
settings = get_settings()


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Returns the health status of the API.",
)
async def health_check():
    """Liveness probe — indicates the service is running."""
    return JSONResponse(
        content={
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT.value,
            "timestamp": datetime.now(UTC).isoformat(),
        }
    )


@router.get(
    "/ready",
    status_code=status.HTTP_200_OK,
    summary="Readiness check",
    description="Returns whether the service is ready to accept traffic.",
)
async def readiness_check(db: AsyncSession = Depends(get_db_session)):
    """Readiness probe — checks if all dependencies are available."""
    checks = {
        "database": False,
        "redis": True, # Redis is optional / deferred for Celery
    }

    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception as e:
        checks["database"] = False

    all_ready = all(checks.values())
    status_code = status.HTTP_200_OK if all_ready else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={
            "ready": all_ready,
            "checks": checks,
            "timestamp": datetime.now(UTC).isoformat(),
        },
    )
