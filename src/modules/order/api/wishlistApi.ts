/**
 * Wishlist API service
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type { WishlistItem, WishlistQuery } from "@/shared/contracts/wishlistContract";

export const wishlistApi = {
  /**
   * Get user wishlist
   */
  getWishlist: async (query: WishlistQuery = {}): Promise<ApiResponse<PageResponse<WishlistItem>>> => {
    const response = await http.get<ApiResponse<PageResponse<WishlistItem>>>(
      endpoints.wishlist,
      { params: query }
    );
    return response.data;
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (productId: string): Promise<ApiResponse<WishlistItem>> => {
    const response = await http.post<ApiResponse<WishlistItem>>(
      `${endpoints.wishlist}/${productId}`,
      {}
    );
    return response.data;
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (productId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(
      `${endpoints.wishlist}/${productId}`
    );
    return response.data;
  },
};
