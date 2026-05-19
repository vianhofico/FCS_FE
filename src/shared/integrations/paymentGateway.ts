import type { PaymentMethod } from "@/shared/contracts/commonContract";

export type PaymentCheckoutRequest = {
  orderId: string;
  amount: number;
  method: PaymentMethod;
};

export type PaymentCheckoutSession = {
  sessionId: string;
  providerName: string;
  redirectUrl: string;
  expiresAt: string;
};

export async function createPaymentSession(request: PaymentCheckoutRequest): Promise<PaymentCheckoutSession> {
  const providerName =
    request.method === "VNPAY" ? "VNPAY" : request.method === "MOMO" ? "MOMO" : "Bank Transfer";

  return {
    sessionId: `pay_${request.orderId}_${Date.now()}`,
    providerName,
    redirectUrl: `https://payment.example.com/${request.method.toLowerCase()}?orderId=${encodeURIComponent(request.orderId)}&amount=${request.amount}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

export function isOnlinePayment(method: PaymentMethod) {
  return method === "ONLINE_PAYMENT";
}
