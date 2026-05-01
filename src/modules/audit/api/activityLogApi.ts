import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/contracts/apiContract";

export type ActivityLogSummary = {
  id: string;
  action?: string;
  actor?: string;
  createdAt?: string;
};

export const activityLogApi = {
  getActivityLogs: async () => {
    const response = await http.get<ApiResponse<ActivityLogSummary[]>>(endpoints.auditActivityLogs);
    return response.data;
  },
};
