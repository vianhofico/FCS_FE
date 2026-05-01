/**
 * IAM (Identity and Access Management) API service
 * Handles users, roles, permissions, and addresses
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type {
  IamUserQuery,
  IamUserSummary,
  IamUserDetail,
  IamUserUpdateRequest,
  IamUserStatusRequest,
  IamUserRoleRequest,
  IamRoleSummary,
  IamRoleDetail,
  IamRoleRequest,
  IamRolePermissionRequest,
  IamPermissionSummary,
  IamPermissionDetail,
  IamPermissionRequest,
  IamAddress,
  IamAddressRequest,
  IamTokenPreviewRequest,
  IamTokenPreviewResponse,
} from "@/shared/contracts/iamContract";

export const iamApi = {
  // ==================== USERS ====================

  /**
   * Get paginated list of users with filters
   */
  getUsers: async (query: IamUserQuery = {}): Promise<ApiResponse<PageResponse<IamUserSummary>>> => {
    const response = await http.get<ApiResponse<PageResponse<IamUserSummary>>>(endpoints.iamUsers, {
      params: query,
    });
    return response.data;
  },

  /**
   * Get single user detail
   */
  getUserDetail: async (userId: string): Promise<ApiResponse<IamUserDetail>> => {
    const response = await http.get<ApiResponse<IamUserDetail>>(`${endpoints.iamUsers}/${userId}`);
    return response.data;
  },

  /**
   * Update user profile
   */
  updateUser: async (
    userId: string,
    payload: IamUserUpdateRequest
  ): Promise<ApiResponse<IamUserDetail>> => {
    const response = await http.put<ApiResponse<IamUserDetail>>(
      `${endpoints.iamUsers}/${userId}`,
      payload
    );
    return response.data;
  },

  /**
   * Update user status (suspend/activate)
   */
  updateUserStatus: async (
    userId: string,
    payload: IamUserStatusRequest
  ): Promise<ApiResponse<IamUserDetail>> => {
    const response = await http.put<ApiResponse<IamUserDetail>>(
      `${endpoints.iamUsers}/${userId}/status`,
      payload
    );
    return response.data;
  },

  // ==================== USER ROLES ====================

  /**
   * Assign roles to user
   */
  assignRolesToUser: async (
    userId: string,
    payload: IamUserRoleRequest
  ): Promise<ApiResponse<IamUserDetail>> => {
    const response = await http.post<ApiResponse<IamUserDetail>>(
      `${endpoints.iamUsers}/${userId}/roles`,
      payload
    );
    return response.data;
  },

  /**
   * Remove role from user
   */
  removeRoleFromUser: async (userId: string, roleId: string): Promise<ApiResponse<IamUserDetail>> => {
    const response = await http.delete<ApiResponse<IamUserDetail>>(
      `${endpoints.iamUsers}/${userId}/roles/${roleId}`
    );
    return response.data;
  },

  // ==================== ROLES ====================

  /**
   * Get all roles
   */
  getRoles: async (): Promise<ApiResponse<PageResponse<IamRoleSummary>>> => {
    const response = await http.get<ApiResponse<PageResponse<IamRoleSummary>>>(endpoints.iamRoles);
    return response.data;
  },

  /**
   * Get single role detail with permissions
   */
  getRoleDetail: async (roleId: string): Promise<ApiResponse<IamRoleDetail>> => {
    const response = await http.get<ApiResponse<IamRoleDetail>>(`${endpoints.iamRoles}/${roleId}`);
    return response.data;
  },

  /**
   * Create new role
   */
  createRole: async (payload: IamRoleRequest): Promise<ApiResponse<IamRoleSummary>> => {
    const response = await http.post<ApiResponse<IamRoleSummary>>(endpoints.iamRoles, payload);
    return response.data;
  },

  /**
   * Update role
   */
  updateRole: async (roleId: string, payload: IamRoleRequest): Promise<ApiResponse<IamRoleSummary>> => {
    const response = await http.put<ApiResponse<IamRoleSummary>>(
      `${endpoints.iamRoles}/${roleId}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete role
   */
  deleteRole: async (roleId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(
      `${endpoints.iamRoles}/${roleId}`
    );
    return response.data;
  },

  /**
   * Assign permissions to role
   */
  assignPermissionsToRole: async (
    roleId: string,
    payload: IamRolePermissionRequest
  ): Promise<ApiResponse<IamRoleDetail>> => {
    const response = await http.post<ApiResponse<IamRoleDetail>>(
      `${endpoints.iamRoles}/${roleId}/permissions`,
      payload
    );
    return response.data;
  },

  // ==================== PERMISSIONS ====================

  /**
   * Get all permissions
   */
  getPermissions: async (): Promise<ApiResponse<PageResponse<IamPermissionSummary>>> => {
    const response = await http.get<ApiResponse<PageResponse<IamPermissionSummary>>>(
      endpoints.iamPermissions
    );
    return response.data;
  },

  /**
   * Get single permission detail
   */
  getPermissionDetail: async (permissionId: string): Promise<ApiResponse<IamPermissionDetail>> => {
    const response = await http.get<ApiResponse<IamPermissionDetail>>(
      `${endpoints.iamPermissions}/${permissionId}`
    );
    return response.data;
  },

  /**
   * Create new permission
   */
  createPermission: async (payload: IamPermissionRequest): Promise<ApiResponse<IamPermissionSummary>> => {
    const response = await http.post<ApiResponse<IamPermissionSummary>>(
      endpoints.iamPermissions,
      payload
    );
    return response.data;
  },

  /**
   * Update permission
   */
  updatePermission: async (
    permissionId: string,
    payload: IamPermissionRequest
  ): Promise<ApiResponse<IamPermissionSummary>> => {
    const response = await http.put<ApiResponse<IamPermissionSummary>>(
      `${endpoints.iamPermissions}/${permissionId}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete permission
   */
  deletePermission: async (permissionId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(
      `${endpoints.iamPermissions}/${permissionId}`
    );
    return response.data;
  },

  // ==================== USER ADDRESSES ====================

  /**
   * Get all addresses for user
   */
  getUserAddresses: async (userId: string): Promise<ApiResponse<IamAddress[]>> => {
    const response = await http.get<ApiResponse<IamAddress[]>>(
      `${endpoints.iamUsers}/${userId}/addresses`
    );
    return response.data;
  },

  /**
   * Create new address
   */
  createAddress: async (
    userId: string,
    payload: IamAddressRequest
  ): Promise<ApiResponse<IamAddress>> => {
    const response = await http.post<ApiResponse<IamAddress>>(
      `${endpoints.iamUsers}/${userId}/addresses`,
      payload
    );
    return response.data;
  },

  /**
   * Update address
   */
  updateAddress: async (addressId: string, payload: IamAddressRequest): Promise<ApiResponse<IamAddress>> => {
    const response = await http.put<ApiResponse<IamAddress>>(
      `${endpoints.iamUsers}/addresses/${addressId}`,
      payload
    );
    return response.data;
  },

  /**
   * Delete address
   */
  deleteAddress: async (addressId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(
      `${endpoints.iamUsers}/addresses/${addressId}`
    );
    return response.data;
  },

  // ==================== ADMIN UTILITIES ====================

  /**
   * Preview token for user (admin only)
   */
  previewUserToken: async (
    payload: IamTokenPreviewRequest
  ): Promise<ApiResponse<IamTokenPreviewResponse>> => {
    const response = await http.post<ApiResponse<IamTokenPreviewResponse>>(
      `${endpoints.iamUsers}/auth/token/preview`,
      payload
    );
    return response.data;
  },
};
