/**
 * Common API contract types shared across all modules
 * Maps to BE ApiResponse<T> and PageResponse<T> envelopes
 */

/**
 * Standard API error code returned by backend
 */
export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "BUSINESS_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "INTERNAL_SERVER_ERROR";

/**
 * Standard API response envelope
 * All BE endpoints wrap responses in this format
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data: T;
  errorCode?: ApiErrorCode | null;
  errors?: Record<string, string> | null;
  timestamp?: string;
};

/**
 * Pagination metadata inside ApiResponse<PageResponse<T>>
 */
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

/**
 * Common pagination query params for list endpoints
 */
export type PaginationParams = {
  page?: number;
  size?: number;
  sort?: string;
};

/**
 * User status enum
 */
export const UserStatus = {
  PENDING_ACTIVATION: "PENDING_ACTIVATION",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  LOCKED: "LOCKED",
  DELETED: "DELETED",
} as const;
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

/**
 * User roles enum
 */
export const UserRole = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SELLER: "SELLER",
  BUYER: "BUYER",
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * Product status enum
 */
export const ProductStatus = {
  DRAFT: "DRAFT",
  READY_TO_LIST: "READY_TO_LIST",
  SELLING: "SELLING",
  RESERVED: "RESERVED",
  SOLD: "SOLD",
  HOLD: "HOLD",
  RETURNED: "RETURNED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

/**
 * Product condition level
 */
export const ProductCondition = {
  EXCELLENT: 90,
  VERY_GOOD: 75,
  GOOD: 60,
  FAIR: 45,
  POOR: 30,
} as const;
export type ProductCondition = typeof ProductCondition[keyof typeof ProductCondition];

/**
 * Consignment request status
 */
export const ConsignmentRequestStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const;
export type ConsignmentRequestStatus = typeof ConsignmentRequestStatus[keyof typeof ConsignmentRequestStatus];

/**
 * Consignment item status
 */
export const ConsignmentItemStatus = {
  PROPOSED: "PROPOSED",
  UNDER_INSPECTION: "UNDER_INSPECTION",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  RETURNED: "RETURNED",
  CONVERTED_TO_PRODUCT: "CONVERTED_TO_PRODUCT",
} as const;
export type ConsignmentItemStatus = typeof ConsignmentItemStatus[keyof typeof ConsignmentItemStatus];

/**
 * Order status
 */
export const OrderStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAID: "PAID",
  CONFIRMED: "CONFIRMED",
  PACKING: "PACKING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

/**
 * Payment method
 */
export const PaymentMethod = {
  COD: "COD",
  VNPAY: "VNPAY",
  MOMO: "MOMO",
  BANK_TRANSFER: "BANK_TRANSFER",
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

/**
 * Return request status
 */
export const ReturnStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  ITEM_RECEIVED: "ITEM_RECEIVED",
  REFUNDED: "REFUNDED",
} as const;
export type ReturnStatus = typeof ReturnStatus[keyof typeof ReturnStatus];

/**
 * Withdrawal status
 */
export const WithdrawalStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  PROCESSING_TRANSFER: "PROCESSING_TRANSFER",
  PAID: "PAID",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type WithdrawalStatus = typeof WithdrawalStatus[keyof typeof WithdrawalStatus];

/**
 * Voucher status
 */
export const VoucherStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  EXPIRED: "EXPIRED",
} as const;
export type VoucherStatus = typeof VoucherStatus[keyof typeof VoucherStatus];

/**
 * Transaction type
 */
export const TransactionType = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
  REFUND: "REFUND",
  WITHDRAWAL: "WITHDRAWAL",
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

/**
 * Media type
 */
export const MediaType = {
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  DOCUMENT: "DOCUMENT",
} as const;
export type MediaType = typeof MediaType[keyof typeof MediaType];

/**
 * Media owner type
 */
export const MediaOwnerType = {
  PRODUCT: "PRODUCT",
  CONSIGNMENT_ITEM: "CONSIGNMENT_ITEM",
  RETURN_REQUEST: "RETURN_REQUEST",
} as const;
export type MediaOwnerType = typeof MediaOwnerType[keyof typeof MediaOwnerType];

/**
 * Address type
 */
export const AddressType = {
  HOME: "HOME",
  OFFICE: "OFFICE",
  OTHER: "OTHER",
} as const;
export type AddressType = typeof AddressType[keyof typeof AddressType];

/**
 * Notification status
 */
export const NotificationStatus = {
  UNREAD: "UNREAD",
  READ: "READ",
} as const;
export type NotificationStatus = typeof NotificationStatus[keyof typeof NotificationStatus];

/**
 * Contract status
 */
export const ContractStatus = {
  DRAFT: "DRAFT",
  SIGNED: "SIGNED",
  EXPIRED: "EXPIRED",
  TERMINATED: "TERMINATED",
} as const;
export type ContractStatus = typeof ContractStatus[keyof typeof ContractStatus];

/**
 * Common success response type
 */
export type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

/**
 * Common error response type
 */
export type ErrorResponse = {
  success: false;
  errorCode: ApiErrorCode;
  message?: string;
  errors?: Record<string, string>;
  timestamp?: string;
};

/**
 * Generic state machine transition
 */
export type StateTransition<T extends string = string> = {
  currentState: T;
  allowedNextStates: T[];
  reason?: string;
};
