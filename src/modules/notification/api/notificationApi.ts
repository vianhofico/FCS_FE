import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiPage, ApiResponse } from "@/shared/contracts/apiContract";

export type NotificationSummary = {
  id: string;
  title?: string;
  read?: boolean;
  createdAt?: string;
};

export const notificationApi = {
  getNotifications: async () => {
    const response = await http.get<ApiResponse<ApiPage<NotificationSummary>>>(
      `${endpoints.notification}/user-notifications`,
    );
    return response.data;
  },
};
