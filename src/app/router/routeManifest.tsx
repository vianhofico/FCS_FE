import type { ReactNode } from "react";
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
};

export const appRoutes: AppRouteItem[] = [
  {
    key: "dashboard",
    path: "/",
    label: "Dashboard",
    icon: <DashboardOutlined />,
    element: <DashboardPage />,
    backendModule: "common",
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
  },
  {
    key: "catalog",
    path: "/catalog",
    label: "Catalog",
    icon: <TagsOutlined />,
    element: <CatalogPage />,
    backendModule: "catalog",
  },
  {
    key: "product",
    path: "/product",
    label: "Product",
    icon: <ShopOutlined />,
    element: <ProductPage />,
    backendModule: "product",
  },
  {
    key: "consignment",
    path: "/consignment",
    label: "Consignment",
    icon: <ReconciliationOutlined />,
    element: <ConsignmentPage />,
    backendModule: "consignment",
  },
  {
    key: "order",
    path: "/order",
    label: "Order",
    icon: <ShoppingCartOutlined />,
    element: <OrderPage />,
    backendModule: "order",
  },
  {
    key: "financial",
    path: "/financial",
    label: "Financial",
    icon: <DollarOutlined />,
    element: <FinancialPage />,
    backendModule: "financial",
  },
  {
    key: "notification",
    path: "/notification",
    label: "Notification",
    icon: <NotificationOutlined />,
    element: <NotificationPage />,
    backendModule: "notification",
  },
  {
    key: "audit",
    path: "/audit",
    label: "Audit",
    icon: <AuditOutlined />,
    element: <AuditPage />,
    backendModule: "audit",
  },
];
