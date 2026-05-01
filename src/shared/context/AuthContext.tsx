/**
 * Authentication Context
 * Manages global auth state, tokens, and user session
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi } from "@/modules/iam/api/authApi";
import type { UserProfile } from "@/shared/contracts/authContract";
import type { UserRole } from "@/shared/contracts/commonContract";

/**
 * Auth state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
}

/**
 * Auth context interface
 */
interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  updateProfile: (profile: UserProfile) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  clearError: () => void;
}

/**
 * Create auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth storage keys
 */
const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "fcs_access_token",
  REFRESH_TOKEN: "fcs_refresh_token",
  USER: "fcs_user_profile",
} as const;

/**
 * Auth Provider component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Initialize from localStorage
    const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    const userJson = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    const user = userJson ? JSON.parse(userJson) : null;

    return {
      isAuthenticated: !!accessToken,
      isLoading: false,
      user,
      accessToken,
      refreshToken,
      error: null,
    };
  });

  /**
   * Login with credentials
   */
  const login = useCallback(async (identifier: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await authApi.login({ identifier, password });

      if (response.success && response.data) {
        const { accessToken, refreshToken, userId, username, email, roles } = response.data;
        const userProfile: UserProfile = {
          id: userId,
          username,
          email,
          roles,
          status: "ACTIVE",
        };

        // Update state
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: userProfile,
          accessToken,
          refreshToken,
          error: null,
        });

        // Persist to localStorage
        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(userProfile));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
        isAuthenticated: false,
      }));
      throw err;
    }
  }, []);

  /**
   * Logout and clear session
   */
  const logout = useCallback(() => {
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    });

    // Clear localStorage
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  }, []);

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = useCallback(async () => {
    if (!state.refreshToken) {
      logout();
      return;
    }

    try {
      const response = await authApi.refreshToken({ refreshToken: state.refreshToken });

      if (response.success && response.data) {
        const { accessToken, refreshToken } = response.data;

        setState((prev) => ({
          ...prev,
          accessToken,
          refreshToken,
        }));

        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } catch (err) {
      // Token refresh failed - logout
      logout();
      throw err;
    }
  }, [state.refreshToken, logout])

  /**
   * Update user profile in context
   */
  const updateProfile = useCallback((profile: UserProfile) => {
    setState((prev) => ({
      ...prev,
      user: profile,
    }));

    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(profile));
  }, []);

  /**
   * Check if user has specific role(s)
   */
  const hasRole = useCallback(
    (role: UserRole | UserRole[]) => {
      if (!state.user) return false;

      const roles = Array.isArray(role) ? role : [role];
      return state.user.roles.some((userRole) => roles.includes(userRole));
    },
    [state.user]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Token refresh effect - refresh token 1 minute before expiry
   * Assumes JWT exp claim is standard (seconds since epoch)
   */
  useEffect(() => {
    if (!state.accessToken) return;

    // Parse JWT to get expiry (simple parse, not secure for production)
    try {
      const payload = JSON.parse(atob(state.accessToken.split(".")[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      if (timeUntilExpiry <= 0) {
        refreshAccessToken();
        return;
      }

      // Schedule refresh 1 minute before expiry
      const refreshTime = timeUntilExpiry - 60000;
      const timer = setTimeout(() => {
        refreshAccessToken();
      }, Math.max(refreshTime, 0));

      return () => clearTimeout(timer);
    } catch {
      // Invalid token, skip auto-refresh
    }
  }, [state.accessToken, refreshAccessToken]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshAccessToken,
    updateProfile,
    hasRole,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
