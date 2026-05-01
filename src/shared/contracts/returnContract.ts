/**
 * Return request contract types
 */

import type { ReturnStatus } from "@/shared/contracts/commonContract";

/**
 * Return request summary (for lists)
 */
export type ReturnRequestSummary = {
  id: string;
  orderId: string;
  requestedById: string;
  status: ReturnStatus;
  reason: string;
  createdAt?: string;
};

/**
 * Return request detail
 */
export type ReturnRequestDetail = ReturnRequestSummary & {
  evidenceUrls?: string[];
  reason: string;
  approvalReason?: string;
  rejectionReason?: string;
  refundAmount?: number;
  processedAt?: string;
  processedBy?: string;
  updatedAt?: string;
};

/**
 * Create return request
 */
export type ReturnRequestCreateRequest = {
  orderId: string;
  reason: string;
  evidenceUrls?: string[];
};

/**
 * Return status update request
 */
export type ReturnStatusRequest = {
  status: ReturnStatus;
  reason?: string;
};

/**
 * Return query filters
 */
export type ReturnQuery = {
  orderId?: string;
  requestedById?: string;
  status?: ReturnStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
};
