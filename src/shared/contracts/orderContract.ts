/**
 * Order, Cart, and Voucher contract types
 */

import type { OrderStatus, PaymentMethod } from "@/shared/contracts/commonContract";

/**
 * Cart item
 */
export type CartItem = {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  sku: string;
  salePrice: number;
  quantity: number;
  addedAt?: string;
};

/**
 * Cart
 */
export type Cart = {
  userId: string;
  items: CartItem[];
  itemCount: number;
  estimatedTotal: number;
  updatedAt?: string;
};

/**
 * Add to cart request
 */
export type CartAddItemRequest = {
  productId: string;
  quantity?: number;
};

/**
 * Order item
 */
export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  salePrice: number;
  quantity: number;
  totalPrice: number;
};

/**
 * Order summary (for lists)
 */
export type OrderSummary = {
  id: string;
  orderCode: string;
  buyerId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  shippingProvider?: string;
  createdAt?: string;
};

/**
 * Order detail
 */
export type OrderDetail = OrderSummary & {
  items: OrderItem[];
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  shippingAddress?: {
    fullName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  shippingSnapshot?: string;
  note?: string;
  updatedAt?: string;
};

/**
 * Create order request
 */
export type OrderCreateRequest = {
  buyerId: string;
  productIds?: string[];
  subTotal: number;
  shippingFee: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddressId: string;
  shippingSnapshot?: string;
  note?: string;
  voucherCode?: string;
};

/**
 * Order status update request
 */
export type OrderStatusRequest = {
  status: OrderStatus;
  reason?: string;
};

/**
 * Order tracking update request
 */
export type OrderTrackingRequest = {
  trackingNumber: string;
  shippingProvider: string;
};

/**
 * Order query filters
 */
export type OrderQuery = {
  orderCode?: string;
  buyerId?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
};

/**
 * Voucher entity
 */
export type Voucher = {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  maxUsageCount?: number;
  usageCount?: number;
  status?: string;
  validFrom?: string;
  validUntil?: string;
  createdAt?: string;
};

/**
 * Voucher create/update request
 */
export type VoucherRequest = {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  maxUsageCount?: number;
  validFrom?: string;
  validUntil?: string;
};

/**
 * Voucher status update request
 */
export type VoucherStatusRequest = {
  status: string;
};

/**
 * Voucher validation request
 */
export type VoucherValidateRequest = {
  code: string;
  userId?: string;
  orderAmount: number;
};

/**
 * Voucher validation response
 */
export type VoucherValidateResponse = {
  valid: boolean;
  message?: string;
  discount?: number;
  voucher?: Voucher;
};
