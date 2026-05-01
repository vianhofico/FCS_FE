import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiResponse } from "@/shared/contracts/apiContract";

export type SystemSettingSummary = {
  id: string;
  key?: string;
  value?: string;
  description?: string;
};

export type UpdateSystemSettingRequest = {
  value: string;
  description?: string;
};

export const systemSettingApi = {
  getSettings: async () => {
    const response = await http.get<ApiResponse<SystemSettingSummary[]>>(endpoints.catalogSettings);
    return response.data;
  },
  updateSetting: async (id: string, request: UpdateSystemSettingRequest) => {
    const response = await http.put<ApiResponse<SystemSettingSummary>>(`${endpoints.catalogSettings}/${id}`, request);
    return response.data;
  },
};
