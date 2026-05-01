/**
 * Financial API service for seller
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/contracts/commonContract";

interface WithdrawalRequest {
  sellerId: string;
  amount: number;
  method: string;
}

interface SellerFinancials {
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  withdrawals: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export const financialApi = {
  /**
   * Get seller financial information
   */
  getSellerFinancials: async (sellerId: string): Promise<ApiResponse<SellerFinancials>> => {
    const response = await http.get<ApiResponse<SellerFinancials>>(
      `${endpoints.wallets}/seller/${sellerId}`
    );
    return response.data;
  },

  /**
   * Request withdrawal
   */
  requestWithdrawal: async (
    payload: WithdrawalRequest
  ): Promise<ApiResponse<{ withdrawalId: string }>> => {
    const response = await http.post<ApiResponse<{ withdrawalId: string }>>(
      `${endpoints.withdrawals}`,
      payload
    );
    return response.data;
  },

  /**
   * Get withdrawal history
   */
  getWithdrawalHistory: async (
    sellerId: string,
    page: number = 0,
    size: number = 10
  ): Promise<
    ApiResponse<{
      content: Array<{
        id: string;
        amount: number;
        status: string;
        createdAt: string;
      }>;
      totalElements: number;
    }>
  > => {
    const response = await http.get(
      `${endpoints.withdrawals}/seller/${sellerId}`,
      { params: { page, size } }
    );
    return response.data;
  },

  /**
   * Get bank accounts
   */
  getBankAccounts: async (
    sellerId: string
  ): Promise<
    ApiResponse<
      Array<{
        id: string;
        bankName: string;
        accountNumber: string;
        accountHolder: string;
        isPrimary: boolean;
      }>
    >
  > => {
    const response = await http.get(
      `${endpoints.wallets}/seller/${sellerId}/bank-accounts`
    );
    return response.data;
  },

  /**
   * Add bank account
   */
  addBankAccount: async (
    sellerId: string,
    payload: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    }
  ): Promise<
    ApiResponse<{
      id: string;
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    }>
  > => {
    const response = await http.post(
      `${endpoints.wallets}/seller/${sellerId}/bank-accounts`,
      payload
    );
    return response.data;
  },
};
