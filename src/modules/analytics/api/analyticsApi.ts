/**
 * Analytics and Reporting API service
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/contracts/commonContract";
import type {
  ManagerDashboard,
  RevenueReport,
  ConsignmentAnalytics,
  SellerAnalytics,
  AnalyticsQuery,
} from "@/shared/contracts/analyticsContract";

export const analyticsApi = {
  /**
   * Get dashboard data (manager/admin view)
   */
  getDashboard: async (): Promise<ApiResponse<ManagerDashboard>> => {
    const response = await http.get<ApiResponse<ManagerDashboard>>(`${endpoints.analytics}/dashboard`);
    return response.data;
  },

  /**
   * Get revenue report
   */
  getRevenueReport: async (query: AnalyticsQuery = {}): Promise<ApiResponse<RevenueReport | RevenueReport[]>> => {
    const response = await http.get<ApiResponse<RevenueReport | RevenueReport[]>>(`${endpoints.analytics}/revenue`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Get consignment analytics
   */
  getConsignmentAnalytics: async (): Promise<ApiResponse<ConsignmentAnalytics>> => {
    const response = await http.get<ApiResponse<ConsignmentAnalytics>>(`${endpoints.analytics}/consignments`);
    return response.data;
  },

  /**
   * Get seller-specific analytics
   */
  getSellerAnalytics: async (sellerId: string): Promise<ApiResponse<SellerAnalytics>> => {
    const response = await http.get<ApiResponse<SellerAnalytics>>(
      `${endpoints.analytics}/sellers/${sellerId}`
    );
    return response.data;
  },
};
