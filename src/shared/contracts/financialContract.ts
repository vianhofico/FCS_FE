/**
 * Financial contracts: wallet, withdrawal, and transactions
 */

import type { WithdrawalStatus, TransactionType } from "@/shared/contracts/commonContract";

/**
 * Wallet entity
 */
export type Wallet = {
  id: string;
  userId?: string;
  walletOwnerId: string;
  balance: number;
  availableBalance: number;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Update wallet request (bank info)
 */
export type WalletUpdateRequest = {
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
};

/**
 * Wallet transaction
 */
export type WalletTransaction = {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  reference?: string;
  referenceId?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt?: string;
};

/**
 * Withdrawal summary (for lists)
 */
export type WithdrawalSummary = {
  id: string;
  walletId: string;
  amount: number;
  status: WithdrawalStatus;
  requestedAt?: string;
  processedAt?: string;
};

/**
 * Withdrawal detail
 */
export type WithdrawalDetail = WithdrawalSummary & {
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  rejectReason?: string;
  transferReference?: string;
  receiptImageUrl?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Create withdrawal request
 */
export type WithdrawalCreateRequest = {
  walletId: string;
  amount: number;
  note?: string;
};

/**
 * Withdrawal status update request
 */
export type WithdrawalStatusRequest = {
  status: WithdrawalStatus;
  rejectReason?: string;
  transferReference?: string;
  receiptImageUrl?: string;
};

/**
 * Withdrawal query filters
 */
export type WithdrawalQuery = {
  walletId?: string;
  status?: WithdrawalStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
};
