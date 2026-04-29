import axios from "axios";

import { env } from "@/app/config/env";

export type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status: number | undefined = error?.response?.status;
    const details: unknown = error?.response?.data;

    const detailsMessage =
      typeof details === "object" && details && "message" in details
        ? (details as { message?: unknown }).message
        : undefined;

    const apiError: ApiError = {
      message: typeof detailsMessage === "string" ? detailsMessage : error?.message || "Request failed",
      status,
      details,
    };

    return Promise.reject(apiError);
  },
);
