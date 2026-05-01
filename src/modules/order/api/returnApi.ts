/**
 * Return request API service
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type {
  ReturnRequestSummary,
  ReturnRequestDetail,
  ReturnRequestCreateRequest,
  ReturnStatusRequest,
  ReturnQuery,
} from "@/shared/contracts/returnContract";

export const returnApi = {
  /**
   * Get paginated list of returns
   */
  getReturns: async (query: ReturnQuery = {}): Promise<ApiResponse<PageResponse<ReturnRequestSummary>>> => {
    const response = await http.get<ApiResponse<PageResponse<ReturnRequestSummary>>>(
      `${endpoints.orders}/returns`,
      { params: query }
    );
    return response.data;
  },

  /**
   * Get return detail
   */
  getReturnDetail: async (returnId: string): Promise<ApiResponse<ReturnRequestDetail>> => {
    const response = await http.get<ApiResponse<ReturnRequestDetail>>(`${endpoints.orders}/returns/${returnId}`);
    return response.data;
  },

  /**
   * Create return request
   */
  createReturn: async (payload: ReturnRequestCreateRequest): Promise<ApiResponse<ReturnRequestSummary>> => {
    const response = await http.post<ApiResponse<ReturnRequestSummary>>(
      `${endpoints.orders}/returns`,
      payload
    );
    return response.data;
  },

  /**
   * Update return status
   */
  updateReturnStatus: async (
    returnId: string,
    payload: ReturnStatusRequest
  ): Promise<ApiResponse<ReturnRequestDetail>> => {
    const response = await http.patch<ApiResponse<ReturnRequestDetail>>(
      `${endpoints.orders}/returns/${returnId}/status`,
      payload
    );
    return response.data;
  },
};
