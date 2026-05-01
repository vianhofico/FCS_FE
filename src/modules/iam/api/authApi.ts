/**
 * Authentication API service
 * Handles login, register, token refresh, password management
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/contracts/commonContract";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  LogoutResponse,
} from "@/shared/contracts/authContract";

export const authApi = {
  /**
   * Login with email/username and password
   */
  login: async (payload: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await http.post<ApiResponse<LoginResponse>>(
      `${endpoints.auth}/login`,
      payload
    );
    return response.data;
  },

  /**
   * Register new user account
   */
  register: async (payload: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const response = await http.post<ApiResponse<RegisterResponse>>(
      `${endpoints.auth}/register`,
      payload
    );
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (payload: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
    const response = await http.post<ApiResponse<RefreshTokenResponse>>(
      `${endpoints.auth}/refresh`,
      payload
    );
    return response.data;
  },

  /**
   * Logout (clears backend session)
   */
  logout: async (): Promise<ApiResponse<LogoutResponse>> => {
    const response = await http.post<ApiResponse<LogoutResponse>>(
      `${endpoints.auth}/logout`,
      {}
    );
    return response.data;
  },

  /**
   * Request password reset link via email
   */
  forgotPassword: async (payload: ForgotPasswordRequest): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.post<ApiResponse<Record<string, unknown>>>(
      `${endpoints.auth}/forgot-password`,
      payload
    );
    return response.data;
  },

  /**
   * Reset password with token from email link
   */
  resetPassword: async (payload: ResetPasswordRequest): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.post<ApiResponse<Record<string, unknown>>>(
      `${endpoints.auth}/reset-password`,
      payload
    );
    return response.data;
  },

  /**
   * Change password for authenticated user
   */
  changePassword: async (
    userId: string,
    payload: ChangePasswordRequest
  ): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.patch<ApiResponse<Record<string, unknown>>>(
      `${endpoints.iamUsers}/${userId}/password`,
      payload
    );
    return response.data;
  },
};
