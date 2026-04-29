import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiPage, ApiResponse } from "@/shared/contracts/apiContract";

export type ConsignmentSummary = {
  id: string;
  code?: string;
  status?: string;
};

export const consignmentApi = {
  getRequests: async () => {
    const response = await http.get<ApiResponse<ApiPage<ConsignmentSummary>>>(
      `${endpoints.consignment}/requests`,
    );
    return response.data;
  },
};
