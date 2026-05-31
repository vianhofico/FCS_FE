/**
 * Consignment request, item, and contract types
 */

import type { ConsignmentRequestStatus, ConsignmentItemStatus, ContractStatus } from "@/shared/contracts/commonContract";

export type ConsignmentRequestSummary = {
  id: string;
  code: string;
  consignorId: string;
  status: ConsignmentRequestStatus;
  note?: string;
  createdAt?: string;
};

export type ConsignmentItem = {
  id: string;
  requestId: string;
  suggestedName: string;
  suggestedPrice?: number;
  originalPrice?: number;
  suggestedBrandId?: string;
  suggestedCategoryId?: string;
  conditionNote?: string;
  status: ConsignmentItemStatus;
  rejectionReason?: string;
  createdAt?: string;
};

export type ConsignmentRequestDetail = ConsignmentRequestSummary & {
  item?: ConsignmentItem;
  contract?: ConsignmentContract;
  updatedAt?: string;
};

/** Request body for creating a consignment (includes inline item details) */
export type CreateConsignmentPayload = {
  consignorId: string;
  code: string;
  status: ConsignmentRequestStatus;
  note?: string;
  // inline item
  suggestedName: string;
  suggestedPrice?: number;
  originalPrice?: number;
  suggestedBrandId?: string;
  suggestedCategoryId?: string;
  conditionNote?: string;
};

export type ConsignmentStatusRequest = {
  status: ConsignmentRequestStatus;
  reason?: string;
};

export type ConsignmentItemStatusRequest = {
  status: ConsignmentItemStatus;
  rejectionReason?: string;
};

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
  createdAt?: string;
};

export type ConsignmentContractCreateRequest = {
  requestId: string;
  commissionRate: number;
  agreedPrice: number;
  validUntil: string;
};

export type SignConsignmentContractRequest = {
  acceptedTerms: boolean;
  signatureName: string;
};

export type ConsignmentContractStatusRequest = {
  status: ContractStatus;
  reason?: string;
};

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

/** Media asset linked to a consignment request */
export type MediaAsset = {
  id: string;
  ownerType: "CONSIGNMENT_REQUEST" | "CONSIGNMENT_ITEM" | "PRODUCT";
  ownerId: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
  displayOrder?: number;
  isPrimary?: boolean;
};

/** Response from POST /api/v1/media/upload */
export type UploadMediaResponse = {
  fileName: string;
  objectKey: string;
  url: string;
  contentType: string;
  sizeBytes: number;
};
