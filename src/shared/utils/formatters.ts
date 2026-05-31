export function formatPaymentMethod(method?: string): string {
  switch (method) {
    case "COD":
      return "Trực tiếp";
    case "ONLINE_PAYMENT":
    case "VNPAY":
    case "MOMO":
    case "BANK_TRANSFER":
      return "Online";
    default:
      return method ?? "Chưa rõ";
  }
}

export function formatCurrency(amount?: number): string {
  if (amount == null) return "—";
  return amount.toLocaleString("vi-VN") + "₫";
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
