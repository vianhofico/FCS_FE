import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/contracts/apiContract";

export type NotificationSummary = {
  id: string;
  title?: string;
  read?: boolean;
  createdAt?: string;
};

export const userNotificationApi = {
  getNotifications: async () => {
    const response = await http.get<ApiResponse<NotificationSummary[]>>(endpoints.notifications);
    return response.data;
  },
  markRead: async (id: string) => {
    const response = await http.patch<ApiResponse<NotificationSummary>>(`${endpoints.notifications}/${id}/read`);
    return response.data;
  },
};
