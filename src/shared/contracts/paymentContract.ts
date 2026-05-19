import type { OrderStatus } from "@/shared/contracts/commonContract";

export type PaymentProvider = "ONLINE_PAYMENT";

export type PaymentQrSession = {
  orderId: string;
  orderCode: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCode?: string;
  transferContent?: string;
  expiresAt?: string;
  paymentStatus?: string;
  orderStatus: OrderStatus;
};

export type PaymentStatus = {
  orderId: string;
  orderCode: string;
  orderStatus: OrderStatus;
  paymentStatus?: string;
  paid: boolean;
  amount: number;
  expiresAt?: string;
  checkoutUrl?: string;
  qrCode?: string;
};
