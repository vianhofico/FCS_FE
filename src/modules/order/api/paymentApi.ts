import { endpoints } from "@/shared/api/endpoints";
import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/contracts/commonContract";
import type { PaymentQrSession, PaymentStatus } from "@/shared/contracts/paymentContract";

export const paymentApi = {
  createOnlinePayment: async (orderId: string): Promise<ApiResponse<PaymentQrSession>> => {
    const response = await http.post<ApiResponse<PaymentQrSession>>(`${endpoints.payments}/orders/${orderId}/online`);
    return response.data;
  },

  getPaymentStatus: async (orderId: string): Promise<ApiResponse<PaymentStatus>> => {
    const response = await http.get<ApiResponse<PaymentStatus>>(`${endpoints.payments}/orders/${orderId}/status`);
    return response.data;
  },
};
