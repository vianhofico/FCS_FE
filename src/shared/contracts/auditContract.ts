/**
 * Audit and activity log contract types
 */

/**
 * Activity log entity
 */
export type ActivityLog = {
  id: string;
  userId: string;
  username?: string;
  action: string;
  module: string;
  entityId?: string;
  entityType?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: "SUCCESS" | "FAILURE";
  errorMessage?: string;
  createdAt?: string;
};

/**
 * Activity log query filters
 */
export type ActivityLogQuery = {
  userId?: string;
  action?: string;
  module?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  status?: "SUCCESS" | "FAILURE";
  page?: number;
  size?: number;
  sort?: string;
};
