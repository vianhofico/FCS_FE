import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/contracts/apiContract";

export type CategorySummary = {
  id: string;
  name: string;
  slug?: string;
};

export const categoryApi = {
  getCategories: async () => {
    const response = await http.get<ApiResponse<CategorySummary[]>>(endpoints.catalogCategories);
    return response.data;
  },
  getCategory: async (id: string) => {
    const response = await http.get<ApiResponse<CategorySummary>>(`${endpoints.catalogCategories}/${id}`);
    return response.data;
  },
};
