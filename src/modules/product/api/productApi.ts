import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiPage, ApiResponse } from "@/shared/contracts/apiContract";

export type ProductSummary = {
  id: string;
  sku?: string;
  name: string;
  status?: string;
};

export const productApi = {
  getProducts: async () => {
    const response = await http.get<ApiResponse<ApiPage<ProductSummary>>>(`${endpoints.product}/products`);
    return response.data;
  },
};
