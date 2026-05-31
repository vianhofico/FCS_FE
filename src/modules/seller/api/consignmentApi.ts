/**
 * Consignment API service
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type {
  ConsignmentRequestSummary,
  ConsignmentRequestDetail,
  ConsignmentContract,
  ConsignmentQuery,
  CreateConsignmentPayload,
  ConsignmentStatusRequest,
  ConsignmentItemStatusRequest,
  ConsignmentContractCreateRequest,
  SignConsignmentContractRequest,
  MediaAsset,
  UploadMediaResponse,
} from "@/shared/contracts/consignmentContract";

export const consignmentApi = {
  // ─── Requests ────────────────────────────────────────────────────────────
  getConsignmentRequests: (query: ConsignmentQuery) =>
    http
      .get<ApiResponse<PageResponse<ConsignmentRequestSummary>>>(endpoints.consignments, { params: query })
      .then((r) => r.data),

  getConsignmentDetail: (requestId: string) =>
    http
      .get<ApiResponse<ConsignmentRequestDetail>>(`${endpoints.consignments}/${requestId}`)
      .then((r) => r.data),

  createConsignment: (payload: CreateConsignmentPayload) =>
    http
      .post<ApiResponse<ConsignmentRequestDetail>>(endpoints.consignments, payload)
      .then((r) => r.data),

  updateConsignmentStatus: (requestId: string, body: ConsignmentStatusRequest) =>
    http
      .patch<ApiResponse<ConsignmentRequestDetail>>(`${endpoints.consignments}/${requestId}/status`, body)
      .then((r) => r.data),

  // ─── Items ────────────────────────────────────────────────────────────────
  getItemByRequest: (requestId: string) =>
    http
      .get<ApiResponse<import("@/shared/contracts/consignmentContract").ConsignmentItem>>(
        `${endpoints.consignments}/${requestId}/item`
      )
      .then((r) => r.data),

  updateItemStatus: (itemId: string, body: ConsignmentItemStatusRequest) =>
    http
      .patch<ApiResponse<unknown>>(`${endpoints.consignments}/items/${itemId}/status`, body)
      .then((r) => r.data),

  // ─── Contracts ────────────────────────────────────────────────────────────
  getContractByRequest: (requestId: string) =>
    http
      .get<ApiResponse<ConsignmentContract>>(`${endpoints.consignments}/${requestId}/contract`)
      .then((r) => r.data),

  createContract: (body: ConsignmentContractCreateRequest) =>
    http
      .post<ApiResponse<ConsignmentContract>>(`${endpoints.consignments}/contracts`, body)
      .then((r) => r.data),

  signContract: (contractId: string, body: SignConsignmentContractRequest) =>
    http
      .patch<ApiResponse<ConsignmentContract>>(`${endpoints.consignments}/contracts/${contractId}/sign`, body)
      .then((r) => r.data),

  updateContractStatus: (contractId: string, body: { status: string; reason?: string }) =>
    http
      .patch<ApiResponse<ConsignmentContract>>(`${endpoints.consignments}/contracts/${contractId}/status`, body)
      .then((r) => r.data),

  /** List contracts (paginated) — consignorId optional */
  getConsignmentContracts: (query: { consignorId?: string; page?: number; size?: number }) =>
    http
      .get<ApiResponse<import("@/shared/contracts/commonContract").PageResponse<ConsignmentContract>>>(
        `${endpoints.consignments}/contracts`,
        { params: query }
      )
      .then((r) => r.data),

  /** Terminate a signed contract */
  terminateContract: (contractId: string) =>
    http
      .patch<ApiResponse<ConsignmentContract>>(
        `${endpoints.consignments}/contracts/${contractId}/status`,
        { status: "TERMINATED" }
      )
      .then((r) => r.data),

  /** Download contract (stub — backend not implemented) */
  downloadContract: (_contractId: string): Promise<ApiResponse<{ url: string }>> =>
    Promise.resolve({ success: false, message: "Not implemented", data: { url: "" } }),

  // ─── Media ────────────────────────────────────────────────────────────────
  /** Upload files → MinIO, returns array of URL info */
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return http
      .post<ApiResponse<UploadMediaResponse[]>>(`${endpoints.media}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  /** Register uploaded URLs as media assets linked to a consignment request */
  registerMedia: (assets: Omit<MediaAsset, "id">[]) =>
    Promise.all(
      assets.map((a) =>
        http
          .post<ApiResponse<MediaAsset>>(endpoints.media, { ...a, mediaType: "IMAGE" })
          .then((r) => r.data.data)
      )
    ),

  getMediaByRequest: (requestId: string) =>
    http
      .get<ApiResponse<MediaAsset[]>>(endpoints.media, {
        params: { ownerType: "CONSIGNMENT_REQUEST", ownerId: requestId },
      })
      .then((r) => r.data),
};
