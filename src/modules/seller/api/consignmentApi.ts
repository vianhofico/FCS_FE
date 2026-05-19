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
  SignConsignmentContractRequest,
} from "@/shared/contracts/consignmentContract";

export const consignmentApi = {
  /**
   * Get consignment requests
   */
  getConsignmentRequests: async (
    query: ConsignmentQuery
  ): Promise<ApiResponse<PageResponse<ConsignmentRequestSummary>>> => {
    const response = await http.get<ApiResponse<PageResponse<ConsignmentRequestSummary>>>(
      endpoints.consignments,
      { params: query }
    );
    return response.data;
  },

  /**
   * Get consignment request detail
   */
  getConsignmentDetail: async (requestId: string): Promise<ApiResponse<ConsignmentRequestDetail>> => {
    const response = await http.get<ApiResponse<ConsignmentRequestDetail>>(
      `${endpoints.consignments}/${requestId}`
    );
    return response.data;
  },

  /**
   * Accept consignment request
   */
  acceptConsignment: async (requestId: string): Promise<ApiResponse<ConsignmentRequestDetail>> => {
    const response = await http.patch<ApiResponse<ConsignmentRequestDetail>>(
      `${endpoints.consignments}/${requestId}/status`,
      { status: "APPROVED" }
    );
    return response.data;
  },

  /**
   * Reject consignment request
   */
  rejectConsignment: async (
    requestId: string,
    payload: { reason: string }
  ): Promise<ApiResponse<ConsignmentRequestDetail>> => {
    const response = await http.patch<ApiResponse<ConsignmentRequestDetail>>(
      `${endpoints.consignments}/${requestId}/status`,
      { status: "REJECTED", reason: payload.reason }
    );
    return response.data;
  },

  /**
   * Get consignment contracts
   */
  getConsignmentContracts: async (
    query: ConsignmentQuery
  ): Promise<ApiResponse<PageResponse<ConsignmentContract>>> => {
    const response = await http.get<ApiResponse<PageResponse<ConsignmentContract>>>(
      `${endpoints.consignments}/contracts`,
      { params: query }
    );
    return response.data;
  },

  signConsignmentContract: async (
    contractId: string,
    payload: SignConsignmentContractRequest
  ): Promise<ApiResponse<ConsignmentContract>> => {
    const response = await http.patch<ApiResponse<ConsignmentContract>>(
      `${endpoints.consignments}/contracts/${contractId}/sign`,
      payload
    );
    return response.data;
  },

  /**
   * Download contract
   */
  downloadContract: async (contractId: string): Promise<ApiResponse<{ url: string }>> => {
    const response = await http.get<ApiResponse<{ url: string }>>(
      `${endpoints.consignments}/contracts/${contractId}/download`
    );
    return response.data;
  },

  /**
   * Terminate contract
   */
  terminateContract: async (contractId: string): Promise<ApiResponse<ConsignmentContract>> => {
    const response = await http.post<ApiResponse<ConsignmentContract>>(
      `${endpoints.consignments}/contracts/${contractId}/terminate`,
      {}
    );
    return response.data;
  },
};
