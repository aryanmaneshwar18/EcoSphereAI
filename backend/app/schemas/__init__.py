"""
EcoSphere AI - Pydantic Schemas
Request/Response DTOs following the API contract specification.
All schemas use strict validation and clear documentation.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

T = TypeVar("T")


# ── Base Schemas ──────────────────────────────────────────────────
class BaseSchema(BaseModel):
    """Base schema with common configuration."""

    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
        validate_assignment=True,
    )


class TimestampSchema(BaseSchema):
    """Schema with timestamp fields."""

    created_at: datetime
    updated_at: datetime


# ── API Response Wrappers ─────────────────────────────────────────
class APIResponse(BaseModel, Generic[T]):
    """Standard API response envelope following RFC 7807 principles."""

    success: bool = True
    message: str = "Success"
    data: Optional[T] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class APIErrorDetail(BaseModel):
    """Error detail for API error responses."""

    code: str
    message: str
    field: Optional[str] = None


class APIErrorResponse(BaseModel):
    """Standard error response."""

    success: bool = False
    error: APIErrorDetail
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response with cursor-based pagination."""

    success: bool = True
    data: list[T] = []
    total: int = 0
    page: int = 1
    page_size: int = 20
    has_next: bool = False
    has_previous: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ── Enums ──────────────────────────────────────────────────────────
class ActivityCategoryEnum(str, Enum):
    TRANSPORT = "transport"
    ENERGY = "energy"
    FOOD = "food"
    WASTE = "waste"
    WATER = "water"
    SHOPPING = "shopping"
    DIGITAL = "digital"


class DietTypeEnum(str, Enum):
    OMNIVORE = "omnivore"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    PESCATARIAN = "pescatarian"
    FLEXITARIAN = "flexitarian"


class VehicleTypeEnum(str, Enum):
    PETROL = "petrol"
    DIESEL = "diesel"
    HYBRID = "hybrid"
    ELECTRIC = "electric"
    MOTORCYCLE = "motorcycle"
    NONE = "none"


class GoalStatusEnum(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


class DifficultyEnum(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


# ── Auth Schemas ──────────────────────────────────────────────────
class RegisterRequest(BaseSchema):
    """User registration request."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    username: Optional[str] = Field(None, min_length=3, max_length=50)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseSchema):
    """User login request."""

    email: EmailStr
    password: str


class AuthResponse(BaseSchema):
    """Authentication response with tokens."""

    user_id: uuid.UUID
    email: str
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400


class UserResponse(BaseSchema):
    """Public user data response."""

    id: uuid.UUID
    email: str
    username: Optional[str]
    avatar_url: Optional[str]
    role: str
    status: str
    created_at: datetime


# ── Profile Schemas ───────────────────────────────────────────────
class ProfileResponse(BaseSchema):
    """User profile response."""

    id: uuid.UUID
    user_id: uuid.UUID
    age: Optional[int]
    gender: Optional[str]
    country: Optional[str]
    state: Optional[str]
    city: Optional[str]
    household_size: Optional[int]
    diet_type: Optional[str]
    vehicle_type: Optional[str]
    income_group: Optional[str]
    occupation: Optional[str]
    sustainability_level: Optional[str]
    onboarding_completed: bool
    baseline_co2e_kg: Optional[float]
    created_at: datetime
    updated_at: datetime


class ProfileUpdateRequest(BaseSchema):
    """Profile update request (partial)."""

    age: Optional[int] = Field(None, ge=13, le=120)
    gender: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    household_size: Optional[int] = Field(None, ge=1, le=20)
    diet_type: Optional[DietTypeEnum] = None
    vehicle_type: Optional[VehicleTypeEnum] = None
    income_group: Optional[str] = Field(None, max_length=50)
    occupation: Optional[str] = Field(None, max_length=100)
    sustainability_level: Optional[str] = Field(None, max_length=20)


# ── Onboarding Schemas ────────────────────────────────────────────
class OnboardingRequest(BaseSchema):
    """Onboarding questionnaire submission."""

    # Demographics
    age: int = Field(..., ge=13, le=120)
    country: str = Field(..., max_length=100)
    household_size: int = Field(..., ge=1, le=20)

    # Lifestyle
    diet_type: DietTypeEnum
    vehicle_type: VehicleTypeEnum

    # Transport habits
    daily_commute_km: float = Field(default=0.0, ge=0, le=500)
    flights_per_year: int = Field(default=0, ge=0, le=100)

    # Home energy
    monthly_electricity_kwh: float = Field(default=0.0, ge=0, le=10000)
    has_solar: bool = False
    heating_type: str = Field(default="natural_gas", max_length=50)

    # Optional
    state: Optional[str] = None
    city: Optional[str] = None
    gender: Optional[str] = None
    occupation: Optional[str] = None


class OnboardingResponse(BaseSchema):
    """Onboarding result with baseline footprint calculation."""

    user_id: uuid.UUID
    baseline_co2e_kg_annual: float
    baseline_co2e_kg_monthly: float
    breakdown: dict[str, float]
    comparison: dict[str, Any]
    top_recommendations: list[str]
    onboarding_completed: bool = True


# ── Activity Schemas ──────────────────────────────────────────────
class ActivityCreateRequest(BaseSchema):
    """Create a new carbon activity log entry."""

    category: ActivityCategoryEnum
    subcategory: str = Field(..., min_length=1, max_length=100)
    activity_name: str = Field(..., min_length=1, max_length=200)
    amount: float = Field(..., gt=0)
    unit: str = Field(..., min_length=1, max_length=50)
    activity_date: datetime
    metadata_json: Optional[dict] = None


class ActivityResponse(BaseSchema):
    """Carbon activity response with calculated emissions."""

    id: uuid.UUID
    user_id: uuid.UUID
    category: str
    subcategory: str
    activity_name: str
    amount: float
    unit: str
    emission_factor: float
    co2e: float
    source: str
    confidence_score: float
    activity_date: datetime
    created_at: datetime


class ActivitySummary(BaseSchema):
    """Summary of activities for a period."""

    total_co2e: float
    category_breakdown: dict[str, float]
    activity_count: int
    period_start: datetime
    period_end: datetime
    trend_percentage: Optional[float] = None


# ── Dashboard Schemas ─────────────────────────────────────────────
class DashboardResponse(BaseSchema):
    """Main dashboard data response."""

    user_id: uuid.UUID
    total_co2e_month: float
    total_co2e_week: float
    total_co2e_today: float
    carbon_budget_remaining: float
    carbon_budget_total: float
    budget_percentage_used: float
    category_breakdown: dict[str, float]
    daily_emissions: list[dict[str, Any]]
    weekly_trend: list[dict[str, Any]]
    streak: int
    level: int
    xp: int
    recent_activities: list[ActivityResponse]
    active_challenges: int
    badges_earned: int
    impact_equivalencies: dict[str, Any]


class ImpactEquivalency(BaseSchema):
    """Impact equivalency for making emissions tangible."""

    trees_needed: float
    cars_removed_days: float
    phone_charges: float
    led_bulb_hours: float
    homes_powered_hours: float


# ── Goal Schemas ──────────────────────────────────────────────────
class GoalCreateRequest(BaseSchema):
    """Create a new carbon reduction goal."""

    goal_type: str = Field(..., max_length=50)
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    target_value: float = Field(..., gt=0)
    unit: str = Field(default="kg_co2e", max_length=50)
    start_date: datetime
    end_date: datetime


class GoalResponse(BaseSchema):
    """Goal response."""

    id: uuid.UUID
    user_id: uuid.UUID
    goal_type: str
    title: str
    description: Optional[str]
    target_value: float
    current_value: float
    unit: str
    status: str
    progress_percentage: float
    start_date: datetime
    end_date: datetime
    created_at: datetime


# ── Recommendation Schemas ────────────────────────────────────────
class RecommendationResponse(BaseSchema):
    """AI-powered recommendation response."""

    id: uuid.UUID
    title: str
    description: str
    category: str
    impact_kg: float
    difficulty: str
    priority_score: float
    accepted: bool
    completed: bool
    source: str
    confidence_score: float
    scientific_reference: Optional[str]
    created_at: datetime


# ── Emission Factor Schemas ───────────────────────────────────────
class EmissionFactorResponse(BaseSchema):
    """Emission factor data response."""

    id: uuid.UUID
    category: str
    subcategory: str
    name: str
    factor: float
    unit: str
    country: str
    source: str
    year: int
    confidence_score: float
    description: Optional[str]
