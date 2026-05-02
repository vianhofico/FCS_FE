/**
 * Financial API service for seller
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type { Wallet } from "@/shared/contracts/financialContract";

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
    const walletsResponse = await http.get<ApiResponse<PageResponse<Wallet> | Wallet[]>>(endpoints.wallets);
    const walletsData = walletsResponse.data.data;
    const wallets = Array.isArray(walletsData) ? walletsData : walletsData?.content || [];
    const wallet = wallets.find((item) => item.userId === sellerId || item.walletOwnerId === sellerId);

    return {
      success: true,
      message: wallet ? "Fetched seller financials" : "Seller wallet not found",
      data: {
        balance: wallet?.availableBalance ?? wallet?.balance ?? 0,
        totalEarnings: wallet?.balance ?? 0,
        totalWithdrawn: 0,
        pendingWithdrawal: 0,
        withdrawals: [],
      },
    };
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
    walletId: string,
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
    const response = await http.get(endpoints.withdrawals, { params: { walletId, page, size } });
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
