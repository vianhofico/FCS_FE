import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/contracts/apiContract";

export type HealthPayload = {
  status?: string;
  timestamp?: string;
  [key: string]: unknown;
};

export const healthApi = {
  getHealth: async () => {
    const response = await http.get<ApiResponse<HealthPayload>>(endpoints.health);
    return response.data;
  },
};
