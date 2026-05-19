export type ShippingOption = {
  id: string;
  provider: string;
  serviceLevel: string;
  fee: number;
  etaDays: number;
  trackingUrl?: string;
};

export type ShippingQuoteRequest = {
  city?: string;
  district?: string;
  subtotal: number;
};

export async function getShippingOptions(_request: ShippingQuoteRequest): Promise<ShippingOption[]> {
  return [
    {
      id: "warehouse-pickup",
      provider: "Nhận hàng trực tiếp tại kho",
      serviceLevel: "Tự đến kho nhận hàng",
      fee: 0,
      etaDays: 0,
    },
    {
      id: "shop-shipping",
      provider: "Shop vận chuyển",
      serviceLevel: "Giao hàng tận nơi",
      fee: 30000,
      etaDays: 3,
    },
  ];
}

export function buildTrackingUrl(provider?: string, trackingNumber?: string) {
  if (!provider || !trackingNumber) {
    return null;
  }

  const normalizedProvider = provider.toLowerCase();
  const encodedTrackingNumber = encodeURIComponent(trackingNumber);

  if (normalizedProvider.includes("ghn")) {
    return `https://donhang.ghn.vn/?order_code=${encodedTrackingNumber}`;
  }

  if (normalizedProvider.includes("j&t") || normalizedProvider.includes("jt")) {
    return `https://jtexpress.vn/track?bill=${encodedTrackingNumber}`;
  }

  return `https://vnpost.vn/tra-cuu-hanh-trinh?code=${encodedTrackingNumber}`;
}
