export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiPage<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};
