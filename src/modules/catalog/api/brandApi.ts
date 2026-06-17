import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/contracts/apiContract";

export type BrandSummary = {
  id: string;
  name: string;
  slug?: string;
};

export const brandApi = {
  getBrands: async () => {
    const response = await http.get<ApiResponse<BrandSummary[]>>(endpoints.catalogBrands);
    return response.data;
  },
  getBrand: async (id: string) => {
    const response = await http.get<ApiResponse<BrandSummary>>(`${endpoints.catalogBrands}/${id}`);
    return response.data;
  },
  createBrand: async (payload: { name: string; description?: string }) => {
    const response = await http.post<ApiResponse<BrandSummary>>(endpoints.catalogBrands, payload);
    return response.data;
  },
};
