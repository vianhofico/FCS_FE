/**
 * Manager Routes
 * Routes for manager module (10 pages)
 */

import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import OrderModerationPage from "@/modules/manager/pages/OrderModerationPage";
import DisputeResolutionPage from "@/modules/manager/pages/DisputeResolutionPage";
import ApprovalsPage from "@/modules/manager/pages/ApprovalsPage";
import ReturnsModerationPage from "@/modules/manager/pages/ReturnsModerationPage";
import FinancialReviewPage from "@/modules/manager/pages/FinancialReviewPage";
import ReportingPage from "@/modules/manager/pages/ReportingPage";
import UserManagementPage from "@/modules/manager/pages/UserManagementPage";
import SystemSettingsPage from "@/modules/manager/pages/SystemSettingsPage";
import CommunicationCenterPage from "@/modules/manager/pages/CommunicationCenterPage";
import PerformanceMonitoringPage from "@/modules/manager/pages/PerformanceMonitoringPage";

export const managerRoutes: RouteObject[] = [
  {
    path: "manager",
    children: [
      {
        path: "orders/moderation",
        element: <OrderModerationPage />,
      },
      {
        path: "disputes/resolution",
        element: <DisputeResolutionPage />,
      },
      {
        path: "approvals",
        element: <ApprovalsPage />,
      },
      {
        path: "returns/moderation",
        element: <ReturnsModerationPage />,
      },
      {
        path: "financial/review",
        element: <FinancialReviewPage />,
      },
      {
        path: "reporting",
        element: <ReportingPage />,
      },
      {
        path: "users/management",
        element: <UserManagementPage />,
      },
      {
        path: "system/settings",
        element: <SystemSettingsPage />,
      },
      {
        path: "communication",
        element: <CommunicationCenterPage />,
      },
      {
        path: "performance/monitoring",
        element: <PerformanceMonitoringPage />,
      },
      {
        path: "",
        element: <Navigate to="orders/moderation" replace />,
      },
    ],
  },
];
