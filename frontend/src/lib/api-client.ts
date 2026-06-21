/**
 * EcoSphere AI - API Client
 * Type-safe HTTP client with interceptors, error handling, and token management.
 */

import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import type {
  APIResponse,
  ActivityCreateRequest,
  Activity,
  ActivitySummary,
  AuthResponse,
  DashboardData,
  LoginRequest,
  OnboardingRequest,
  OnboardingResponse,
  PaginatedResponse,
  Profile,
  ProfileUpdateRequest,
  RegisterRequest,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Configure exponential backoff retry for idempotent requests
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx status codes
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 502;
      },
    });

    // Request interceptor — attach auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor — extract data and handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ error?: { message: string; code: string } }>) => {
        const message =
          error.response?.data?.error?.message ||
          error.message ||
          "An unexpected error occurred";

        const code = error.response?.data?.error?.code || "UNKNOWN_ERROR";

        return Promise.reject({
          message,
          code,
          status: error.response?.status,
        });
      }
    );
  }

  setToken(token: string | null): void {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("ecosphere_token", token);
      } else {
        localStorage.removeItem("ecosphere_token");
      }
    }
  }

  loadToken(): void {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("ecosphere_token");
    }
  }

  // ── Auth ────────────────────────────────────────────────────
  async register(data: RegisterRequest): Promise<APIResponse<AuthResponse>> {
    const response = await this.client.post<APIResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    if (response.data.data?.access_token) {
      this.setToken(response.data.data.access_token);
    }
    return response.data;
  }

  async login(data: LoginRequest): Promise<APIResponse<AuthResponse>> {
    const response = await this.client.post<APIResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    if (response.data.data?.access_token) {
      this.setToken(response.data.data.access_token);
    }
    return response.data;
  }

  async getCurrentUser(): Promise<APIResponse<AuthResponse>> {
    const response = await this.client.get<APIResponse<AuthResponse>>("/auth/me");
    return response.data;
  }

  logout(): void {
    this.setToken(null);
  }

  // ── Profile ─────────────────────────────────────────────────
  async getProfile(): Promise<APIResponse<Profile>> {
    const response = await this.client.get<APIResponse<Profile>>("/profiles/me");
    return response.data;
  }

  async updateProfile(data: ProfileUpdateRequest): Promise<APIResponse<Profile>> {
    const response = await this.client.patch<APIResponse<Profile>>(
      "/profiles/me",
      data
    );
    return response.data;
  }

  // ── Onboarding ──────────────────────────────────────────────
  async completeOnboarding(
    data: OnboardingRequest
  ): Promise<APIResponse<OnboardingResponse>> {
    const response = await this.client.post<APIResponse<OnboardingResponse>>(
      "/onboarding/complete",
      data
    );
    return response.data;
  }

  // ── Activities ──────────────────────────────────────────────
  async createActivity(
    data: ActivityCreateRequest
  ): Promise<APIResponse<Activity>> {
    const response = await this.client.post<APIResponse<Activity>>(
      "/activities",
      data
    );
    return response.data;
  }

  async listActivities(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<Activity>> {
    const response = await this.client.get<PaginatedResponse<Activity>>(
      "/activities",
      { params }
    );
    return response.data;
  }

  async getActivitySummary(
    period: "week" | "month" | "year" = "month"
  ): Promise<APIResponse<ActivitySummary>> {
    const response = await this.client.get<APIResponse<ActivitySummary>>(
      "/activities/summary",
      { params: { period } }
    );
    return response.data;
  }

  async deleteActivity(activityId: string): Promise<APIResponse> {
    const response = await this.client.delete<APIResponse>(
      `/activities/${activityId}`
    );
    return response.data;
  }

  // ── Onboarding ────────────────────────────────────────────────
  async calculateBaseline(payload: Record<string, unknown>) {
    return this.client.post("/onboarding/baseline", payload);
  }

  // ── Dashboard ────────────────────────────────────────────────
  async getDashboard(): Promise<APIResponse<DashboardData>> {
    const response = await this.client.get<APIResponse<DashboardData>>(
      "/dashboard"
    );
    return response.data;
  }

  // ── Gamification ──────────────────────────────────────────────
  async getGamificationState(): Promise<APIResponse<unknown>> {
    const response = await this.client.get<APIResponse<unknown>>("/gamification/state");
    return response.data;
  }

  // ── Carbon Twin ─────────────────────────────────────────────
  async getTwinTrajectory(): Promise<APIResponse<unknown>> {
    const response = await this.client.get<APIResponse<unknown>>("/twin/trajectory");
    return response.data;
  }

  async simulateTwinScenarios(scenarios: string[]): Promise<APIResponse<unknown>> {
    const response = await this.client.post<APIResponse<unknown>>("/twin/simulate", { scenarios });
    return response.data;
  }

  // ── Community ───────────────────────────────────────────────
  async getCommunityLeaderboard(limit: number = 100): Promise<APIResponse<unknown[]>> {
    const response = await this.client.get<APIResponse<unknown[]>>("/community/leaderboard", {
      params: { limit }
    });
    return response.data;
  }

  async getCommunityFeed(limit: number = 50): Promise<APIResponse<unknown[]>> {
    const response = await this.client.get<APIResponse<unknown[]>>("/community/feed", {
      params: { limit }
    });
    return response.data;
  }

  // ── AI Coach ────────────────────────────────────────────────
  async getWeeklyInsight(): Promise<APIResponse<{ insight: string }>> {
    const response = await this.client.post<APIResponse<{ insight: string }>>("/coach/insight");
    return response.data;
  }

  async queryCoach(query: string): Promise<APIResponse<{ response: string }>> {
    const response = await this.client.post<APIResponse<{ response: string }>>("/coach/query", { query });
    return response.data;
  }
}

// Singleton API client
export const apiClient = new ApiClient();

// Initialize token from storage on module load
if (typeof window !== "undefined") {
  apiClient.loadToken();
}
