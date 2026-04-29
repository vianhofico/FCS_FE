import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiPage, ApiResponse } from "@/shared/contracts/apiContract";

export type WalletTransactionSummary = {
  id: string;
  type?: string;
  amount?: number;
  createdAt?: string;
};

export const financialApi = {
  getTransactions: async () => {
    const response = await http.get<ApiResponse<ApiPage<WalletTransactionSummary>>>(
      `${endpoints.financial}/transactions`,
    );
    return response.data;
  },
};
