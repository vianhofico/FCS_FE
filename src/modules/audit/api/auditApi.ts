import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiPage, ApiResponse } from "@/shared/contracts/apiContract";

export type ActivityLogSummary = {
  id: string;
  action?: string;
  actor?: string;
  createdAt?: string;
};

export const auditApi = {
  getActivityLogs: async () => {
    const response = await http.get<ApiResponse<ApiPage<ActivityLogSummary>>>(`${endpoints.audit}/logs`);
    return response.data;
  },
};
