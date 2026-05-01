/**
 * Order, Cart, and Voucher API service
 */

import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse, PageResponse } from "@/shared/contracts/commonContract";
import type {
  Cart,
  CartAddItemRequest,
  OrderSummary,
  OrderDetail,
  OrderCreateRequest,
  OrderStatusRequest,
  OrderTrackingRequest,
  OrderQuery,
  Voucher,
  VoucherRequest,
  VoucherStatusRequest,
  VoucherValidateRequest,
  VoucherValidateResponse,
} from "@/shared/contracts/orderContract";

export const orderApi = {
  // ==================== CART ====================

  /**
   * Get user cart
   */
  getCart: async (userId: string): Promise<ApiResponse<Cart>> => {
    const response = await http.get<ApiResponse<Cart>>(`${endpoints.cart}/${userId}`);
    return response.data;
  },

  /**
   * Add item to cart
   */
  addToCart: async (userId: string, payload: CartAddItemRequest): Promise<ApiResponse<Cart>> => {
    const response = await http.post<ApiResponse<Cart>>(`${endpoints.cart}/${userId}/items`, payload);
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (userId: string, itemId: string): Promise<ApiResponse<Cart>> => {
    const response = await http.delete<ApiResponse<Cart>>(`${endpoints.cart}/${userId}/items/${itemId}`);
    return response.data;
  },

  /**
   * Clear cart
   */
  clearCart: async (userId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(`${endpoints.cart}/${userId}`);
    return response.data;
  },

  // ==================== ORDERS ====================

  /**
   * Get paginated list of orders
   */
  getOrders: async (query: OrderQuery = {}): Promise<ApiResponse<PageResponse<OrderSummary>>> => {
    const response = await http.get<ApiResponse<PageResponse<OrderSummary>>>(endpoints.orders, {
      params: query,
    });
    return response.data;
  },

  /**
   * Get order detail
   */
  getOrderDetail: async (orderId: string): Promise<ApiResponse<OrderDetail>> => {
    const response = await http.get<ApiResponse<OrderDetail>>(`${endpoints.orders}/${orderId}`);
    return response.data;
  },

  /**
   * Create order
   */
  createOrder: async (payload: OrderCreateRequest): Promise<ApiResponse<OrderDetail>> => {
    const response = await http.post<ApiResponse<OrderDetail>>(endpoints.orders, payload);
    return response.data;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    orderId: string,
    payload: OrderStatusRequest
  ): Promise<ApiResponse<OrderDetail>> => {
    const response = await http.patch<ApiResponse<OrderDetail>>(
      `${endpoints.orders}/${orderId}/status`,
      payload
    );
    return response.data;
  },

  /**
   * Update order tracking
   */
  updateOrderTracking: async (
    orderId: string,
    payload: OrderTrackingRequest
  ): Promise<ApiResponse<OrderDetail>> => {
    const response = await http.patch<ApiResponse<OrderDetail>>(
      `${endpoints.orders}/${orderId}/tracking`,
      payload
    );
    return response.data;
  },

  /**
   * Delete order
   */
  deleteOrder: async (orderId: string): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await http.delete<ApiResponse<Record<string, unknown>>>(`${endpoints.orders}/${orderId}`);
    return response.data;
  },

  // ==================== VOUCHERS ====================

  /**
   * Get paginated list of vouchers
   */
  getVouchers: async (page = 0, size = 20): Promise<ApiResponse<PageResponse<Voucher>>> => {
    const response = await http.get<ApiResponse<PageResponse<Voucher>>>(endpoints.vouchers, {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Get voucher detail
   */
  getVoucherDetail: async (voucherId: string): Promise<ApiResponse<Voucher>> => {
    const response = await http.get<ApiResponse<Voucher>>(`${endpoints.vouchers}/${voucherId}`);
    return response.data;
  },

  /**
   * Create voucher
   */
  createVoucher: async (payload: VoucherRequest): Promise<ApiResponse<Voucher>> => {
    const response = await http.post<ApiResponse<Voucher>>(endpoints.vouchers, payload);
    return response.data;
  },

  /**
   * Update voucher status
   */
  updateVoucherStatus: async (
    voucherId: string,
    payload: VoucherStatusRequest
  ): Promise<ApiResponse<Voucher>> => {
    const response = await http.patch<ApiResponse<Voucher>>(
      `${endpoints.vouchers}/${voucherId}/status`,
      payload
    );
    return response.data;
  },

  /**
   * Validate voucher
   */
  validateVoucher: async (
    query: VoucherValidateRequest
  ): Promise<ApiResponse<VoucherValidateResponse>> => {
    const response = await http.get<ApiResponse<VoucherValidateResponse>>(`${endpoints.vouchers}/validate`, {
      params: query,
    });
    return response.data;
  },
};
