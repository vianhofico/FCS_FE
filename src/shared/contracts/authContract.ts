/**
 * Authentication and authorization contract types
 */

import type { UserRole, UserStatus } from "@/shared/contracts/commonContract";

/**
 * Login request
 */
export type LoginRequest = {
  identifier: string; // email or username
  password: string;
};

/**
 * Login response
 */
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  email: string;
  roles: UserRole[];
};

/**
 * Register request
 */
export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
};

/**
 * Register response (same as login)
 */
export type RegisterResponse = LoginResponse;

/**
 * Refresh token request
 */
export type RefreshTokenRequest = {
  refreshToken: string;
};

/**
 * Refresh token response
 */
export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Forgot password request
 */
export type ForgotPasswordRequest = {
  email: string;
};

/**
 * Reset password request
 */
export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

/**
 * Change password request
 */
export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

/**
 * User profile with minimal info for session
 */
export type UserProfile = {
  id: string;
  username: string;
  email: string;
  phone?: string;
  status: UserStatus;
  roles: UserRole[];
  createdAt?: string;
  lastLoginAt?: string;
};

/**
 * Logout response (usually empty)
 */
export type LogoutResponse = Record<string, unknown>;
