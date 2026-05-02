/**
 * Notification API service
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type { Notification, NotificationReadRequest, NotificationQuery } from "@/shared/contracts/notificationContract";

export const notificationApi = {
  /**
   * Get user notifications
   */
  getNotifications: async (query: NotificationQuery = {}): Promise<ApiResponse<PageResponse<Notification> | Notification[]>> => {
    const response = await http.get<ApiResponse<PageResponse<Notification> | Notification[]>>(endpoints.notifications, {
      params: query,
    });
    return response.data;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId: string, payload: NotificationReadRequest = {}): Promise<ApiResponse<Notification>> => {
    const response = await http.patch<ApiResponse<Notification>>(
      `${endpoints.notifications}/${notificationId}/read`,
      payload
    );
    return response.data;
  },
};
