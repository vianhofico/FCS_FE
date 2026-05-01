/**
 * Product review API service
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type {
  ProductReview,
  ProductReviewCreateRequest,
  ReviewSummary,
  ReviewQuery,
} from "@/shared/contracts/reviewContract";

export const reviewApi = {
  /**
   * Get reviews for product
   */
  getProductReviews: async (productId: string, query?: ReviewQuery): Promise<ApiResponse<PageResponse<ProductReview>>> => {
    const response = await http.get<ApiResponse<PageResponse<ProductReview>>>(
      `${endpoints.products}/${productId}/reviews`,
      { params: query || { page: 0, size: 20 } }
    );
    return response.data;
  },

  /**
   * Get review summary for product
   */
  getReviewSummary: async (productId: string): Promise<ApiResponse<ReviewSummary>> => {
    const response = await http.get<ApiResponse<ReviewSummary>>(
      `${endpoints.products}/${productId}/reviews/summary`
    );
    return response.data;
  },

  /**
   * Create product review
   */
  createReview: async (
    productId: string,
    payload: ProductReviewCreateRequest
  ): Promise<ApiResponse<ProductReview>> => {
    const response = await http.post<ApiResponse<ProductReview>>(
      `${endpoints.products}/${productId}/reviews`,
      payload
    );
    return response.data;
  },
};
