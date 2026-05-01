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
  kpis: DashboardKpi[];
  revenueChart?: any;
  consignmentStats?: any;
  orderStats?: any;
};

/**
 * Revenue report
 */
export type RevenueReport = {
  period: "DAILY" | "WEEKLY" | "MONTHLY";
  startDate: string;
  endDate: string;
  totalRevenue: number;
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
  totalConsignments: number;
  byStatus?: Record<string, number>;
  byConsignor?: Array<{
    consignorId: string;
    consignorName: string;
    count: number;
    totalValue: number;
  }>;
  activeConsignments: number;
  completedConsignments: number;
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
