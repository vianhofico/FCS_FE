/**
 * Consignment API service
 * Handles consignment requests, items, and contracts
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type {
  ConsignmentRequestSummary,
  ConsignmentRequestDetail,
  ConsignmentRequestCreateRequest,
  ConsignmentRequestUpdateRequest,
  ConsignmentStatusRequest,
  ConsignmentItem,
  ConsignmentItemCreateRequest,
  ConsignmentItemStatusRequest,
  ConsignmentContract,
  ConsignmentContractCreateRequest,
  ConsignmentContractStatusRequest,
  ConsignmentQuery,
} from "@/shared/contracts/consignmentContract";

export const consignmentApi = {
  // ==================== CONSIGNMENT REQUESTS ====================

  /**
   * Get paginated list of consignments
   */
  getConsignments: async (
    query: ConsignmentQuery = {}
  ): Promise<ApiResponse<PageResponse<ConsignmentRequestSummary>>> => {
    const response = await http.get<ApiResponse<PageResponse<ConsignmentRequestSummary>>>(
      endpoints.consignments,
      { params: query }
    );
    return response.data;
  },

  /**
   * Get consignment detail
   */
  getConsignmentDetail: async (consignmentId: string): Promise<ApiResponse<ConsignmentRequestDetail>> => {
    const response = await http.get<ApiResponse<ConsignmentRequestDetail>>(
      `${endpoints.consignments}/${consignmentId}`
    );
    return response.data;
  },

  /**
   * Create consignment request
   */
  createConsignment: async (
    payload: ConsignmentRequestCreateRequest
  ): Promise<ApiResponse<ConsignmentRequestSummary>> => {
    const response = await http.post<ApiResponse<ConsignmentRequestSummary>>(
      endpoints.consignments,
      payload
    );
    return response.data;
  },

  /**
   * Update consignment
   */
  updateConsignment: async (
    consignmentId: string,
    payload: ConsignmentRequestUpdateRequest
  ): Promise<ApiResponse<ConsignmentRequestDetail>> => {
    const response = await http.put<ApiResponse<ConsignmentRequestDetail>>(
      `${endpoints.consignments}/${consignmentId}`,
      payload
    );
    return response.data;
  },

  /**
   * Update consignment status
   */
  updateConsignmentStatus: async (
    consignmentId: string,
    payload: ConsignmentStatusRequest
  ): Promise<ApiResponse<ConsignmentRequestDetail>> => {
    const response = await http.patch<ApiResponse<ConsignmentRequestDetail>>(
      `${endpoints.consignments}/${consignmentId}/status`,
      payload
    );
    return response.data;
  },

  /**
   * Delete consignment
   */
  deleteConsignment: async (consignmentId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(
      `${endpoints.consignments}/${consignmentId}`
    );
    return response.data;
  },

  // ==================== CONSIGNMENT ITEMS ====================

  /**
   * Get items for consignment
   */
  getConsignmentItems: async (requestId: string): Promise<ApiResponse<ConsignmentItem[]>> => {
    const response = await http.get<ApiResponse<ConsignmentItem[]>>(
      `${endpoints.consignments}/${requestId}/item`
    );
    return response.data;
  },

  /**
   * Create consignment item
   */
  createConsignmentItem: async (
    payload: ConsignmentItemCreateRequest
  ): Promise<ApiResponse<ConsignmentItem>> => {
    const response = await http.post<ApiResponse<ConsignmentItem>>(
      `${endpoints.consignments}/items`,
      payload
    );
    return response.data;
  },

  /**
   * Update consignment item status
   */
  updateConsignmentItemStatus: async (
    itemId: string,
    payload: ConsignmentItemStatusRequest
  ): Promise<ApiResponse<ConsignmentItem>> => {
    const response = await http.patch<ApiResponse<ConsignmentItem>>(
      `${endpoints.consignments}/items/${itemId}/status`,
      payload
    );
    return response.data;
  },

  // ==================== CONSIGNMENT CONTRACTS ====================

  /**
   * Get contract for consignment request
   */
  getConsignmentContract: async (requestId: string): Promise<ApiResponse<ConsignmentContract>> => {
    const response = await http.get<ApiResponse<ConsignmentContract>>(
      `${endpoints.consignments}/${requestId}/contract`
    );
    return response.data;
  },

  /**
   * Create consignment contract
   */
  createConsignmentContract: async (
    payload: ConsignmentContractCreateRequest
  ): Promise<ApiResponse<ConsignmentContract>> => {
    const response = await http.post<ApiResponse<ConsignmentContract>>(
      `${endpoints.consignments}/contracts`,
      payload
    );
    return response.data;
  },

  /**
   * Sign contract
   */
  signConsignmentContract: async (contractId: string): Promise<ApiResponse<ConsignmentContract>> => {
    const response = await http.patch<ApiResponse<ConsignmentContract>>(
      `${endpoints.consignments}/contracts/${contractId}/sign`,
      {}
    );
    return response.data;
  },

  /**
   * Update contract status
   */
  updateConsignmentContractStatus: async (
    contractId: string,
    payload: ConsignmentContractStatusRequest
  ): Promise<ApiResponse<ConsignmentContract>> => {
    const response = await http.patch<ApiResponse<ConsignmentContract>>(
      `${endpoints.consignments}/contracts/${contractId}/status`,
      payload
    );
    return response.data;
  },
};
