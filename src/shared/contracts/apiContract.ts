export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "BUSINESS_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | string;

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errorCode: ApiErrorCode | null;
  errors: Record<string, string> | null;
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
