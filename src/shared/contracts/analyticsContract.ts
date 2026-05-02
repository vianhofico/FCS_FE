/**
 * Analytics and reporting contract types
 */

/**
 * Dashboard KPI card data
 */
export type DashboardKpi = {
  label: string;
  value: number | string;
  unit?: string;
  trend?: "UP" | "DOWN" | "STABLE";
  trendValue?: number;
  trendPercent?: number;
};

/**
 * Manager/Admin dashboard
 */
export type ManagerDashboard = {
  kpis?: DashboardKpi[];
  totalRevenue?: number;
  pendingConsignments?: number;
  activeOrders?: number;
  pendingWithdrawals?: number;
  revenueToday?: number;
  revenueThisMonth?: number;
  newUsersThisMonth?: number;
  topProducts?: Array<Record<string, unknown>>;
  revenueChart?: Record<string, unknown>;
  consignmentStats?: Record<string, unknown>;
  orderStats?: Record<string, unknown>;
};

/**
 * Revenue report
 */
export type RevenueReport = {
  period?: "DAILY" | "WEEKLY" | "MONTHLY";
  startDate?: string;
  endDate?: string;
  totalRevenue?: number;
  date?: string;
  revenue?: number;
  orders?: number;
  commission?: number;
  byPaymentMethod?: Record<string, number>;
  byProduct?: Array<{
    productId: string;
    productName: string;
    revenue: number;
    orderCount: number;
  }>;
  byCategory?: Array<{
    categoryId: string;
    categoryName: string;
    revenue: number;
  }>;
};

/**
 * Consignment analytics
 */
export type ConsignmentAnalytics = {
  totalConsignments?: number;
  totalByStatus?: Record<string, number>;
  byStatus?: Record<string, number>;
  conversionRate?: number;
  byConsignor?: Array<{
    consignorId: string;
    consignorName: string;
    count: number;
    totalValue: number;
  }>;
  activeConsignments?: number;
  completedConsignments?: number;
};

/**
 * Seller analytics
 */
export type SellerAnalytics = {
  sellerId: string;
  totalConsignments: number;
  activeConsignments: number;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  rating?: number;
};

/**
 * Analytics query filters
 */
export type AnalyticsQuery = {
  period?: "DAILY" | "WEEKLY" | "MONTHLY";
  startDate?: string;
  endDate?: string;
  startYear?: number;
  startMonth?: number;
  sellerId?: string;
  page?: number;
  size?: number;
};
