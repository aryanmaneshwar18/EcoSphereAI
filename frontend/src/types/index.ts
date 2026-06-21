/**
 * EcoSphere AI - TypeScript Type Definitions
 * Shared types matching the backend Pydantic schemas.
 * Strict typing across the entire frontend.
 */

// ── Enums ──────────────────────────────────────────────────────
export enum ActivityCategory {
  TRANSPORT = "transport",
  ENERGY = "energy",
  FOOD = "food",
  WASTE = "waste",
  WATER = "water",
  SHOPPING = "shopping",
  DIGITAL = "digital",
}

export enum DietType {
  OMNIVORE = "omnivore",
  VEGETARIAN = "vegetarian",
  VEGAN = "vegan",
  PESCATARIAN = "pescatarian",
  FLEXITARIAN = "flexitarian",
}

export enum VehicleType {
  PETROL = "petrol",
  DIESEL = "diesel",
  HYBRID = "hybrid",
  ELECTRIC = "electric",
  MOTORCYCLE = "motorcycle",
  NONE = "none",
}

export enum GoalStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  FAILED = "failed",
  PAUSED = "paused",
}

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}

// ── API Response Types ─────────────────────────────────────────
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  timestamp: string;
}

export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
  };
  timestamp: string;
}

// ── Auth Types ─────────────────────────────────────────────────
export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user_id: string;
  email: string;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  created_at: string;
}

// ── Profile Types ──────────────────────────────────────────────
export interface Profile {
  id: string;
  user_id: string;
  age: number | null;
  gender: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  household_size: number | null;
  diet_type: string | null;
  vehicle_type: string | null;
  income_group: string | null;
  occupation: string | null;
  sustainability_level: string | null;
  onboarding_completed: boolean;
  baseline_co2e_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateRequest {
  age?: number;
  gender?: string;
  country?: string;
  state?: string;
  city?: string;
  household_size?: number;
  diet_type?: DietType;
  vehicle_type?: VehicleType;
  income_group?: string;
  occupation?: string;
  sustainability_level?: string;
}

// ── Onboarding Types ───────────────────────────────────────────
export interface OnboardingRequest {
  age: number;
  country: string;
  household_size: number;
  diet_type: DietType;
  vehicle_type: VehicleType;
  daily_commute_km: number;
  flights_per_year: number;
  monthly_electricity_kwh: number;
  has_solar: boolean;
  heating_type: string;
  state?: string;
  city?: string;
  gender?: string;
  occupation?: string;
}

export interface OnboardingResponse {
  user_id: string;
  baseline_co2e_kg_annual: number;
  baseline_co2e_kg_monthly: number;
  breakdown: Record<string, number>;
  comparison: ComparisonData;
  top_recommendations: string[];
  onboarding_completed: boolean;
}

export interface ComparisonData {
  user_tonnes: number;
  country_average_tonnes: number;
  global_average_tonnes: number;
  ipcc_target_tonnes: number;
  vs_country_percentage: number;
  vs_global_percentage: number;
  vs_ipcc_percentage: number;
  country: string;
}

// ── Activity Types ─────────────────────────────────────────────
export interface ActivityCreateRequest {
  category: ActivityCategory;
  subcategory: string;
  activity_name: string;
  amount: number;
  unit: string;
  activity_date: string;
  metadata_json?: Record<string, unknown>;
}

export interface Activity {
  id: string;
  user_id: string;
  category: string;
  subcategory: string;
  activity_name: string;
  amount: number;
  unit: string;
  emission_factor: number;
  co2e: number;
  source: string;
  confidence_score: number;
  activity_date: string;
  created_at: string;
}

export interface ActivitySummary {
  total_co2e: number;
  category_breakdown: Record<string, number>;
  activity_count: number;
  period_start: string;
  period_end: string;
  trend_percentage: number | null;
}

// ── Dashboard Types ────────────────────────────────────────────
export interface DashboardData {
  user_id: string;
  total_co2e_month: number;
  total_co2e_week: number;
  total_co2e_today: number;
  carbon_budget_remaining: number;
  carbon_budget_total: number;
  budget_percentage_used: number;
  category_breakdown: Record<string, number>;
  daily_emissions: DailyEmission[];
  weekly_trend: WeeklyTrend[];
  streak: number;
  level: number;
  xp: number;
  recent_activities: Activity[];
  active_challenges: number;
  badges_earned: number;
  impact_equivalencies: ImpactEquivalency;
}

export interface DailyEmission {
  date: string;
  co2e: number;
}

export interface WeeklyTrend {
  week_start: string;
  co2e: number;
}

export interface ImpactEquivalency {
  trees_needed: number;
  cars_removed_days: number;
  phone_charges: number;
  led_bulb_hours: number;
  homes_powered_hours: number;
}

// ── Goal Types ─────────────────────────────────────────────────
export interface GoalCreateRequest {
  goal_type: string;
  title: string;
  description?: string;
  target_value: number;
  unit?: string;
  start_date: string;
  end_date: string;
}

export interface Goal {
  id: string;
  user_id: string;
  goal_type: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  status: GoalStatus;
  progress_percentage: number;
  start_date: string;
  end_date: string;
  created_at: string;
}

// ── Recommendation Types ───────────────────────────────────────
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  impact_kg: number;
  difficulty: Difficulty;
  priority_score: number;
  accepted: boolean;
  completed: boolean;
  source: string;
  confidence_score: number;
  scientific_reference: string | null;
  created_at: string;
}

// ── Gamification Types ─────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  earned_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  difficulty: Difficulty;
  target_co2e_reduction: number;
  reward_xp: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_participants: number | null;
  progress?: number;
  completed?: boolean;
}

// ── Forecast Types ─────────────────────────────────────────────
export interface Forecast {
  scenario: string;
  current_annual_co2e: number;
  projected_annual_co2e: number;
  savings_annual_co2e: number;
  savings_percentage: number;
  explanation: string;
  projections: {
    "30_days": number;
    "90_days": number;
    "1_year": number;
    "5_years": number;
  };
}

// ── Theme Types ────────────────────────────────────────────────
export type Theme = "dark" | "light" | "system";

// ── Category Metadata ──────────────────────────────────────────
export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  [ActivityCategory.TRANSPORT]: "#3B82F6",
  [ActivityCategory.ENERGY]: "#F59E0B",
  [ActivityCategory.FOOD]: "#10B981",
  [ActivityCategory.WASTE]: "#8B5CF6",
  [ActivityCategory.WATER]: "#06B6D4",
  [ActivityCategory.SHOPPING]: "#EC4899",
  [ActivityCategory.DIGITAL]: "#6366F1",
};

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  [ActivityCategory.TRANSPORT]: "Transport",
  [ActivityCategory.ENERGY]: "Energy",
  [ActivityCategory.FOOD]: "Food",
  [ActivityCategory.WASTE]: "Waste",
  [ActivityCategory.WATER]: "Water",
  [ActivityCategory.SHOPPING]: "Shopping",
  [ActivityCategory.DIGITAL]: "Digital",
};

export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  [ActivityCategory.TRANSPORT]: "Car",
  [ActivityCategory.ENERGY]: "Zap",
  [ActivityCategory.FOOD]: "Utensils",
  [ActivityCategory.WASTE]: "Trash2",
  [ActivityCategory.WATER]: "Droplets",
  [ActivityCategory.SHOPPING]: "ShoppingBag",
  [ActivityCategory.DIGITAL]: "Monitor",
};
