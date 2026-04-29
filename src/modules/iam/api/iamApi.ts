import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";
import type { ApiPage, ApiResponse } from "@/shared/contracts/apiContract";

export type IamUserSummary = {
  id: string;
  username: string;
  email?: string;
  status?: string;
};

export const iamApi = {
  getUsers: async () => {
    const response = await http.get<ApiResponse<ApiPage<IamUserSummary>>>(`${endpoints.iam}/users`);
    return response.data;
  },
};
