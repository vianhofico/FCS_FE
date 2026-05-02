/**
 * Identity and Access Management (IAM) contract types
 * Includes users, roles, permissions, addresses
 */

import type { UserStatus, UserRole, AddressType } from "@/shared/contracts/commonContract";

/**
 * User summary (for lists)
 */
export type IamUserSummary = {
  id: string;
  username: string;
  email: string;
  phone?: string;
  status: UserStatus;
  roles?: UserRole[];
  createdAt?: string;
};

/**
 * User detailed info
 */
export type IamUserDetail = IamUserSummary & {
  lastLoginAt?: string;
  updatedAt?: string;
};

/**
 * User update request
 */
export type IamUserUpdateRequest = {
  username?: string;
  email?: string;
  phone?: string;
};

/**
 * User status update request
 */
export type IamUserStatusRequest = {
  status: UserStatus;
};

/**
 * User role assignment request
 */
export type IamUserRoleRequest = {
  roleIds: string[];
};

/**
 * User query filters
 */
export type IamUserQuery = {
  keyword?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  size?: number;
};

/**
 * Role summary
 */
export type IamRoleSummary = {
  id: string;
  name: string;
  description?: string;
  permissionCount?: number;
  userCount?: number;
  createdAt?: string;
};

/**
 * Role detail with permissions
 */
export type IamRoleDetail = IamRoleSummary & {
  permissions: IamPermissionSummary[];
};

/**
 * Role create/update request
 */
export type IamRoleRequest = {
  name: string;
  description?: string;
};

/**
 * Role permission assignment request
 */
export type IamRolePermissionRequest = {
  permissionIds: string[];
};

/**
 * Permission summary
 */
export type IamPermissionSummary = {
  id: string;
  code: string;
  name: string;
  description?: string;
  module?: string;
  createdAt?: string;
};

/**
 * Permission detail
 */
export type IamPermissionDetail = IamPermissionSummary & {
  roleCount?: number;
};

/**
 * Permission create/update request
 */
export type IamPermissionRequest = {
  code: string;
  name: string;
  description?: string;
  module?: string;
};

/**
 * Address entity
 */
export type IamAddress = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
  type: AddressType;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Address create/update request
 */
export type IamAddressRequest = {
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
  type: AddressType;
};

/**
 * Token preview request (admin utility)
 */
export type IamTokenPreviewRequest = {
  userId: string;
};

/**
 * Token preview response (admin utility)
 */
export type IamTokenPreviewResponse = {
  token: string;
  decodedToken: Record<string, unknown>;
  expiresAt: string;
};
