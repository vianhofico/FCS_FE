import type { ReactNode } from "react";
import type { UserRole } from "@/shared/contracts/commonContract";
import {
  AuditOutlined,
  DashboardOutlined,
  DollarOutlined,
  HeartOutlined,
  NotificationOutlined,
  ReconciliationOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import { DashboardPage } from "@/modules/dashboard/DashboardPage";
import { HealthPage } from "@/modules/health/HealthPage";
import { IamPage } from "@/modules/iam/pages/IamPage";
import { CatalogPage } from "@/modules/catalog/pages/CatalogPage";
import { ProductPage } from "@/modules/product/pages/ProductPage";
import { ConsignmentPage } from "@/modules/consignment/pages/ConsignmentPage";
import { OrderPage } from "@/modules/order/pages/OrderPage";
import { FinancialPage } from "@/modules/financial/pages/FinancialPage";
import { NotificationPage } from "@/modules/notification/pages/NotificationPage";
import { AuditPage } from "@/modules/audit/pages/AuditPage";

export type AppRouteItem = {
  key: string;
  path: string;
  label: string;
  icon: ReactNode;
  element: ReactNode;
  backendModule: string;
  requireAuth?: boolean;
  requiredRoles?: UserRole[];
};

export const appRoutes: AppRouteItem[] = [
  {
    key: "dashboard",
    path: "/",
    label: "Dashboard",
    icon: <DashboardOutlined />,
    element: <DashboardPage />,
    backendModule: "common",
    requireAuth: true,
  },
  {
    key: "health",
    path: "/health",
    label: "Health",
    icon: <HeartOutlined />,
    element: <HealthPage />,
    backendModule: "health",
  },
  {
    key: "iam",
    path: "/iam",
    label: "IAM",
    icon: <TeamOutlined />,
    element: <IamPage />,
    backendModule: "iam",
    requireAuth: true,
    requiredRoles: ["MANAGER" as UserRole, "ADMIN" as UserRole],
  },
  {
    key: "catalog",
    path: "/catalog",
    label: "Catalog",
    icon: <TagsOutlined />,
    element: <CatalogPage />,
    backendModule: "catalog",
    requireAuth: true,
  },
  {
    key: "product",
    path: "/product",
    label: "Product",
    icon: <ShopOutlined />,
    element: <ProductPage />,
    backendModule: "product",
    requireAuth: true,
  },
  {
    key: "consignment",
    path: "/consignment",
    label: "Consignment",
    icon: <ReconciliationOutlined />,
    element: <ConsignmentPage />,
    backendModule: "consignment",
    requireAuth: true,
  },
  {
    key: "order",
    path: "/order",
    label: "Order",
    icon: <ShoppingCartOutlined />,
    element: <OrderPage />,
    backendModule: "order",
    requireAuth: true,
  },
  {
    key: "financial",
    path: "/financial",
    label: "Financial",
    icon: <DollarOutlined />,
    element: <FinancialPage />,
    backendModule: "financial",
    requireAuth: true,
  },
  {
    key: "notification",
    path: "/notification",
    label: "Notification",
    icon: <NotificationOutlined />,
    element: <NotificationPage />,
    backendModule: "notification",
    requireAuth: true,
  },
  {
    key: "audit",
    path: "/audit",
    label: "Audit",
    icon: <AuditOutlined />,
    element: <AuditPage />,
    backendModule: "audit",
    requireAuth: true,
  },
];
