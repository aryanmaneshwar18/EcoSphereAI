/**
 * EcoSphere AI - Auth Store (Zustand)
 * Manages authentication state and user data.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";
import { apiClient } from "@/lib/api-client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login({ email, password });
          if (response.data) {
            set({
              user: {
                id: response.data.user_id,
                email: response.data.email,
                username: null,
                avatar_url: null,
                role: "user",
                status: "active",
                created_at: new Date().toISOString(),
              },
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (err: unknown) {
          const error = err as { message?: string };
          set({
            error: error.message || "Login failed",
            isLoading: false,
          });
        }
      },

      register: async (email: string, password: string, username?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register({ email, password, username });
          if (response.data) {
            set({
              user: {
                id: response.data.user_id,
                email: response.data.email,
                username: username || null,
                avatar_url: null,
                role: "user",
                status: "onboarding",
                created_at: new Date().toISOString(),
              },
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (err: unknown) {
          const error = err as { message?: string };
          set({
            error: error.message || "Registration failed",
            isLoading: false,
          });
        }
      },

      logout: () => {
        apiClient.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "ecosphere-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
