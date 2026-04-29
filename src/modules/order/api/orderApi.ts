import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiPage, ApiResponse } from "@/shared/contracts/apiContract";

export type OrderSummary = {
  id: string;
  orderCode?: string;
  status?: string;
  totalAmount?: number;
};

export const orderApi = {
  getOrders: async () => {
    const response = await http.get<ApiResponse<ApiPage<OrderSummary>>>(`${endpoints.order}/orders`);
    return response.data;
  },
};
