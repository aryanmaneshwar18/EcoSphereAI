"""
EcoSphere AI - Application Configuration
Centralized configuration using Pydantic Settings with environment variable support.
Follows 12-Factor App methodology.
"""

from __future__ import annotations

from enum import Enum
from functools import lru_cache
from typing import Any

from pydantic import Field, PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    """Application deployment environments."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TESTING = "testing"


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Validates all configuration at startup to fail fast on misconfig.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────────
    APP_NAME: str = "EcoSphere AI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    DEBUG: bool = Field(default=False)
    API_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: list[str] | str = Field(
        default=["http://localhost:3000", "http://localhost:3001"]
    )
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = Field(
        default="ecosphere-dev-secret-change-in-production",
        description="Secret key for signing tokens and sessions",
    )

    # ── Database ───────────────────────────────────────────────────
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/ecosphere_ai",
        description="PostgreSQL connection string (async driver)",
    )
    DATABASE_SYNC_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/ecosphere_ai",
        description="PostgreSQL connection string (sync driver for Alembic)",
    )
    DATABASE_POOL_SIZE: int = Field(default=20, ge=5, le=100)
    DATABASE_MAX_OVERFLOW: int = Field(default=10, ge=0, le=50)
    DATABASE_POOL_TIMEOUT: int = Field(default=30, ge=10, le=120)
    DATABASE_ECHO: bool = False

    # ── Supabase ───────────────────────────────────────────────────
    SUPABASE_URL: str = Field(default="", description="Supabase project URL")
    SUPABASE_ANON_KEY: str = Field(default="", description="Supabase anon/public key")
    SUPABASE_SERVICE_KEY: str = Field(
        default="", description="Supabase service role key"
    )

    # ── Redis ──────────────────────────────────────────────────────
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL",
    )
    REDIS_CACHE_TTL: int = Field(default=3600, description="Default cache TTL seconds")

    # ── Clerk Authentication ───────────────────────────────────────
    CLERK_SECRET_KEY: str = Field(default="", description="Clerk secret key")
    CLERK_PUBLISHABLE_KEY: str = Field(default="", description="Clerk publishable key")
    CLERK_WEBHOOK_SECRET: str = Field(
        default="", description="Clerk webhook signing secret"
    )
    CLERK_JWT_ISSUER: str = Field(default="", description="Clerk JWT issuer URL")

    # ── AI Providers ───────────────────────────────────────────────
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")
    OPENAI_MODEL: str = Field(default="gpt-4o", description="Default OpenAI model")
    OPENAI_EMBEDDING_MODEL: str = Field(
        default="text-embedding-3-small",
        description="OpenAI embedding model",
    )
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API key")

    # ── Celery ─────────────────────────────────────────────────────
    CELERY_BROKER_URL: str = Field(
        default="redis://localhost:6379/1",
        description="Celery message broker URL",
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://localhost:6379/2",
        description="Celery result backend URL",
    )

    # ── Email (Resend) ─────────────────────────────────────────────
    RESEND_API_KEY: str = Field(default="", description="Resend API key")
    EMAIL_FROM: str = Field(
        default="noreply@ecosphere.ai",
        description="Default from email address",
    )

    # ── Monitoring ─────────────────────────────────────────────────
    SENTRY_DSN: str = Field(default="", description="Sentry DSN for error tracking")
    POSTHOG_API_KEY: str = Field(default="", description="PostHog analytics key")

    # ── Rate Limiting ──────────────────────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, ge=10, le=1000)
    RATE_LIMIT_PER_HOUR: int = Field(default=1000, ge=100, le=10000)

    # ── Carbon Science ─────────────────────────────────────────────
    DEFAULT_CARBON_BUDGET_KG_ANNUAL: float = Field(
        default=2000.0,
        description="Annual carbon budget per person in kg CO₂e (IPCC target: 2 tonnes)",
    )
    EMISSION_FACTOR_UPDATE_INTERVAL_DAYS: int = Field(
        default=90,
        description="Days between emission factor dataset updates",
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def enforce_async_driver(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == Environment.PRODUCTION

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == Environment.DEVELOPMENT

    @property
    def monthly_carbon_budget_kg(self) -> float:
        return self.DEFAULT_CARBON_BUDGET_KG_ANNUAL / 12


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Get cached application settings singleton.
    Settings are loaded once and cached for the lifetime of the process.
    """
    return Settings()
