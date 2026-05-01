/**
 * Financial API service (consolidated from wallet, withdrawal, transaction APIs)
 * Handles wallets, withdrawals, and transactions
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type {
  Wallet,
  WalletUpdateRequest,
  WalletTransaction,
  WithdrawalSummary,
  WithdrawalDetail,
  WithdrawalCreateRequest,
  WithdrawalStatusRequest,
  WithdrawalQuery,
} from "@/shared/contracts/financialContract";

export const financialApi = {
  // ==================== WALLETS ====================

  /**
   * Get all wallets (paginated)
   */
  getWallets: async (): Promise<ApiResponse<PageResponse<Wallet>>> => {
    const response = await http.get<ApiResponse<PageResponse<Wallet>>>(endpoints.wallets);
    return response.data;
  },

  /**
   * Get wallet detail
   */
  getWalletDetail: async (walletId: string): Promise<ApiResponse<Wallet>> => {
    const response = await http.get<ApiResponse<Wallet>>(`${endpoints.wallets}/${walletId}`);
    return response.data;
  },

  /**
   * Update wallet (bank info)
   */
  updateWallet: async (walletId: string, payload: WalletUpdateRequest): Promise<ApiResponse<Wallet>> => {
    const response = await http.put<ApiResponse<Wallet>>(`${endpoints.wallets}/${walletId}`, payload);
    return response.data;
  },

  // ==================== WALLET TRANSACTIONS ====================

  /**
   * Get wallet transactions
   */
  getWalletTransactions: async (walletId: string): Promise<ApiResponse<PageResponse<WalletTransaction>>> => {
    const response = await http.get<ApiResponse<PageResponse<WalletTransaction>>>(
      `${endpoints.wallets}/${walletId}/transactions`
    );
    return response.data;
  },

  // ==================== WITHDRAWALS ====================

  /**
   * Get paginated list of withdrawals
   */
  getWithdrawals: async (query: WithdrawalQuery = {}): Promise<ApiResponse<PageResponse<WithdrawalSummary>>> => {
    const response = await http.get<ApiResponse<PageResponse<WithdrawalSummary>>>(endpoints.withdrawals, {
      params: query,
    });
    return response.data;
  },

  /**
   * Get withdrawal detail
   */
  getWithdrawalDetail: async (withdrawalId: string): Promise<ApiResponse<WithdrawalDetail>> => {
    const response = await http.get<ApiResponse<WithdrawalDetail>>(
      `${endpoints.withdrawals}/${withdrawalId}`
    );
    return response.data;
  },

  /**
   * Create withdrawal request
   */
  createWithdrawal: async (payload: WithdrawalCreateRequest): Promise<ApiResponse<WithdrawalSummary>> => {
    const response = await http.post<ApiResponse<WithdrawalSummary>>(endpoints.withdrawals, payload);
    return response.data;
  },

  /**
   * Update withdrawal status
   */
  updateWithdrawalStatus: async (
    withdrawalId: string,
    payload: WithdrawalStatusRequest
  ): Promise<ApiResponse<WithdrawalDetail>> => {
    const response = await http.patch<ApiResponse<WithdrawalDetail>>(
      `${endpoints.withdrawals}/${withdrawalId}/status`,
      payload
    );
    return response.data;
  },
};
