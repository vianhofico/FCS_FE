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

export async function getShippingOptions(request: ShippingQuoteRequest): Promise<ShippingOption[]> {
  const baseFee = request.subtotal >= 500 ? 0 : 25;
  const cityFactor = request.city && /hcm|hanoi/i.test(request.city) ? 0 : 10;

  return [
    {
      id: "standard",
      provider: "VNPost",
      serviceLevel: "Standard",
      fee: baseFee + cityFactor,
      etaDays: 3,
      trackingUrl: "https://vnpost.vn/tra-cuu-hanh-trinh",
    },
    {
      id: "express",
      provider: "GHN",
      serviceLevel: "Express",
      fee: baseFee + cityFactor + 20,
      etaDays: 1,
      trackingUrl: "https://donhang.ghn.vn/",
    },
    {
      id: "economy",
      provider: "J&T Express",
      serviceLevel: "Economy",
      fee: Math.max(0, baseFee - 10 + cityFactor),
      etaDays: 5,
      trackingUrl: "https://jtexpress.vn/track",
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
