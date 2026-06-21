"""
EcoSphere AI - FastAPI Application Entry Point
Production-grade FastAPI application with middleware, CORS, health checks,
and lifecycle management.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import sentry_sdk
from prometheus_client import make_asgi_app
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import Environment, get_settings
from app.core.database import close_db, init_db
from app.routers import (
    health,
    auth,
    profiles,
    onboarding,
    activities,
    dashboard,
    gamification,
    twin,
    community,
    coach,
    reports,
    notifications
)

settings = get_settings()
logger = structlog.get_logger()

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Initialize Sentry
if settings.is_production:
    sentry_sdk.init(
        dsn=getattr(settings, "SENTRY_DSN", ""),
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
        environment=settings.ENVIRONMENT.value,
    )

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle manager. Handles startup and shutdown."""
    # ── Startup ────────────────────────────────────────────────
    logger.info(
        "starting_ecosphere_ai",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT.value,
    )

    if settings.ENVIRONMENT in (Environment.DEVELOPMENT, Environment.TESTING):
        await init_db()
        logger.info("database_tables_initialized")

    yield

    # ── Shutdown ───────────────────────────────────────────────
    await close_db()
    logger.info("ecosphere_ai_shutdown_complete")


def create_application() -> FastAPI:
    """Factory function to create and configure the FastAPI application."""

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "The world's most intelligent personal sustainability platform. "
            "Track, predict, and reduce your environmental impact through "
            "AI-driven insights and behavior change."
        ),
        docs_url="/api/docs" if settings.is_development else None,
        redoc_url="/api/redoc" if settings.is_development else None,
        openapi_url="/api/openapi.json" if settings.is_development else None,
        lifespan=lifespan,
    )
    
    app.state.limiter = limiter

    # ── Middleware Stack ───────────────────────────────────────
    # Order matters: outermost middleware processes first

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Process-Time"],
        max_age=86400,
    )

    # GZip compression for responses > 500 bytes
    app.add_middleware(GZipMiddleware, minimum_size=500)
    
    # Rate Limiting
    app.add_middleware(SlowAPIMiddleware)

    # Trusted host validation (production only)
    if settings.is_production:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["ecosphere.ai", "*.ecosphere.ai", "*.onrender.com"],
        )

    # ── Request Timing Middleware ──────────────────────────────
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        """Add processing time header to all responses."""
        import time
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Time"] = f"{process_time:.4f}"
        return response

    # ── Observability: Prometheus Metrics ─────────────────────
    metrics_app = make_asgi_app()
    app.mount("/metrics", metrics_app)

    # ── Exception Handlers ────────────────────────────────────
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Catch-all exception handler with structured logging."""
        logger.error(
            "unhandled_exception",
            error=str(exc),
            path=request.url.path,
            method=request.method,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred",
                },
                "timestamp": datetime.now(UTC).isoformat(),
            },
        )

    # ── Register Routers ──────────────────────────────────────
    api_prefix = settings.API_PREFIX

    app.include_router(health.router, tags=["Health"])
    app.include_router(auth.router, prefix=f"{api_prefix}/auth", tags=["Authentication"])
    app.include_router(
        profiles.router, prefix=f"{api_prefix}/profiles", tags=["Profiles"]
    )
    app.include_router(
        onboarding.router, prefix=f"{api_prefix}/onboarding", tags=["Onboarding"]
    )
    app.include_router(
        activities.router, prefix=f"{api_prefix}/activities", tags=["Activities"]
    )
    app.include_router(
        dashboard.router, prefix=f"{api_prefix}/dashboard", tags=["Dashboard"]
    )
    app.include_router(
        gamification.router, prefix=f"{api_prefix}/gamification", tags=["Gamification"]
    )
    app.include_router(
        twin.router, prefix=f"{api_prefix}/twin", tags=["Carbon Twin"]
    )
    app.include_router(
        community.router, prefix=f"{api_prefix}/community", tags=["Community"]
    )
    app.include_router(
        coach.router, prefix=f"{api_prefix}/coach", tags=["AI Coach"]
    )
    app.include_router(
        reports.router, prefix=f"{api_prefix}/reports", tags=["Reports"]
    )
    app.include_router(
        notifications.router, prefix=f"{api_prefix}/notifications", tags=["Notifications"]
    )

    return app


app = create_application()
