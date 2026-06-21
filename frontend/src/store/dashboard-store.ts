/**
 * EcoSphere AI - Dashboard Store (Zustand)
 * Manages dashboard state, activity data, and emission summaries.
 */

import { create } from "zustand";
import type { DashboardData, Activity, ActivitySummary } from "@/types";
import { apiClient } from "@/lib/api-client";

interface DashboardState {
  dashboardData: DashboardData | null;
  activities: Activity[];
  summary: ActivitySummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchActivities: (params?: {
    page?: number;
    category?: string;
  }) => Promise<void>;
  fetchSummary: (period?: "week" | "month" | "year") => Promise<void>;
  logActivity: (data: {
    category: string;
    subcategory: string;
    activity_name: string;
    amount: number;
    unit: string;
    activity_date: string;
  }) => Promise<Activity | null>;
  deleteActivity: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  dashboardData: null,
  activities: [],
  summary: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getDashboard();
      if (response.data) {
        set({ dashboardData: response.data, isLoading: false });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || "Failed to load dashboard", isLoading: false });
    }
  },

  fetchActivities: async (params) => {
    try {
      const response = await apiClient.listActivities(params);
      set({ activities: response.data });
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || "Failed to load activities" });
    }
  },

  fetchSummary: async (period = "month") => {
    try {
      const response = await apiClient.getActivitySummary(period);
      if (response.data) {
        set({ summary: response.data });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || "Failed to load summary" });
    }
  },

  logActivity: async (data) => {
    try {
      const response = await apiClient.createActivity({
        ...data,
        category: data.category as unknown as import("@/types").ActivityCategory,
      });
      if (response.data) {
        // Refresh dashboard after logging
        get().fetchDashboard();
        return response.data;
      }
      return null;
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || "Failed to log activity" });
      return null;
    }
  },

  deleteActivity: async (id: string) => {
    try {
      await apiClient.deleteActivity(id);
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      }));
      get().fetchDashboard();
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message || "Failed to delete activity" });
    }
  },

  clearError: () => set({ error: null }),
}));
