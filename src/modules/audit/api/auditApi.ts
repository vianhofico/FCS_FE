/**
 * Audit and Activity Log API service
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type { ActivityLog, ActivityLogQuery } from "@/shared/contracts/auditContract";

export const auditApi = {
  /**
   * Get activity logs
   */
  getActivityLogs: async (query: ActivityLogQuery = {}): Promise<ApiResponse<PageResponse<ActivityLog>>> => {
    const response = await http.get<ApiResponse<PageResponse<ActivityLog>>>(endpoints.auditActivityLogs, {
      params: query,
    });
    return response.data;
  },
};
