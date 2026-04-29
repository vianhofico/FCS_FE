import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiPage, ApiResponse } from "@/shared/contracts/apiContract";

export type CategorySummary = {
  id: string;
  name: string;
  slug?: string;
};

export const catalogApi = {
  getCategories: async () => {
    const response = await http.get<ApiResponse<ApiPage<CategorySummary>>>(`${endpoints.catalog}/categories`);
    return response.data;
  },
};
