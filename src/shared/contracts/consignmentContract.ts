/**
 * Consignment request, item, and contract types
 */

import type { ConsignmentRequestStatus, ConsignmentItemStatus, ContractStatus } from "@/shared/contracts/commonContract";

/**
 * Consignment request summary (for lists)
 */
export type ConsignmentRequestSummary = {
  id: string;
  code: string;
  consignorId: string;
  status: ConsignmentRequestStatus;
  itemCount?: number;
  note?: string;
  createdAt?: string;
};

/**
 * Consignment request detail
 */
export type ConsignmentRequestDetail = ConsignmentRequestSummary & {
  items?: ConsignmentItem[];
  contract?: ConsignmentContract;
  updatedAt?: string;
};

/**
 * Create consignment request
 */
export type ConsignmentRequestCreateRequest = {
  consignorId: string;
  code?: string;
  status?: ConsignmentRequestStatus;
  note?: string;
};

/**
 * Update consignment request
 */
export type ConsignmentRequestUpdateRequest = {
  note?: string;
};

/**
 * Consignment status update request
 */
export type ConsignmentStatusRequest = {
  status: ConsignmentRequestStatus;
  reason?: string;
};

/**
 * Consignment item
 */
export type ConsignmentItem = {
  id: string;
  requestId: string;
  suggestedName: string;
  suggestedPrice: number;
  conditionNote?: string;
  status: ConsignmentItemStatus;
  media?: Array<Record<string, unknown>>;
  createdAt?: string;
};

/**
 * Create consignment item request
 */
export type ConsignmentItemCreateRequest = {
  requestId: string;
  suggestedName: string;
  suggestedPrice: number;
  conditionNote?: string;
};

/**
 * Consignment item status update request
 */
export type ConsignmentItemStatusRequest = {
  status: ConsignmentItemStatus;
  rejectionReason?: string;
};

/**
 * Consignment contract
 */
export type ConsignmentContract = {
  id: string;
  requestId: string;
  status: ContractStatus;
  commissionRate?: number;
  agreedPrice?: number;
  validUntil?: string;
  signedAt?: string;
  signedByUserId?: string;
  signedByName?: string;
  signatureMethod?: string;
  signatureIpAddress?: string;
  signatureUserAgent?: string;
  signatureHash?: string;
  createdAt?: string;
};

/**
 * Create consignment contract request
 */
export type ConsignmentContractCreateRequest = {
  requestId: string;
  commissionRate?: number;
  agreedPrice?: number;
  validUntil?: string;
};

export type SignConsignmentContractRequest = {
  acceptedTerms: boolean;
  signatureName: string;
};

/**
 * Contract status update request
 */
export type ConsignmentContractStatusRequest = {
  status: ContractStatus;
  reason?: string;
};

/**
 * Consignment query filters
 */
export type ConsignmentQuery = {
  code?: string;
  consignorId?: string;
  status?: ConsignmentRequestStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
};
