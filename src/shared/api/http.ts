import axios from "axios";
import { env } from "@/app/config/env";
import type { ApiErrorCode } from "@/shared/contracts/commonContract";

export type ApiError = {
  message: string;
  status?: number;
  errorCode?: ApiErrorCode | null;
  errors?: Record<string, string> | null;
  details?: unknown;
};

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  return localStorage.getItem("fcs_access_token");
}

/**
 * Clear auth session from localStorage
 */
function clearAuthSession(): void {
  localStorage.removeItem("fcs_access_token");
  localStorage.removeItem("fcs_refresh_token");
  localStorage.removeItem("fcs_user_profile");
}

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
});

/**
 * Request interceptor - attach auth token
 */
http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor - handle errors
 */
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status: number | undefined = error?.response?.status;
    const details: unknown = error?.response?.data;

    const parsed =
      typeof details === "object" && details
        ? (details as {
            message?: unknown;
            errorCode?: ApiErrorCode | null;
            errors?: Record<string, string> | null;
          })
        : undefined;

    // Handle 401 - clear session and redirect to login
    if (status === 401) {
      clearAuthSession();
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }

    // Handle 403 - redirect to forbidden page
    if (status === 403 && window.location.pathname !== "/forbidden") {
      window.location.href = "/forbidden";
    }

    const apiError: ApiError = {
      message: typeof parsed?.message === "string" ? parsed.message : error?.message || "Request failed",
      status,
      errorCode: parsed?.errorCode ?? null,
      errors: parsed?.errors ?? null,
      details,
    };

    return Promise.reject(apiError);
  },
);
