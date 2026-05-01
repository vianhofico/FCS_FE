/**
 * Admin Routes
 * Routes for admin module (7 pages)
 */

import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import AdminDashboardPage from "@/modules/admin/pages/AdminDashboardPage";
import IAMGovernancePage from "@/modules/admin/pages/IAMGovernancePage";
import SystemConfigurationPage from "@/modules/admin/pages/SystemConfigurationPage";
import SystemReportingPage from "@/modules/admin/pages/SystemReportingPage";
import AuditLogsPage from "@/modules/admin/pages/AuditLogsPage";
import SecurityPage from "@/modules/admin/pages/SecurityPage";
import BackupManagementPage from "@/modules/admin/pages/BackupManagementPage";

export const adminRoutes: RouteObject[] = [
  {
    path: "admin",
    children: [
      {
        path: "dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "iam/governance",
        element: <IAMGovernancePage />,
      },
      {
        path: "system/configuration",
        element: <SystemConfigurationPage />,
      },
      {
        path: "system/reporting",
        element: <SystemReportingPage />,
      },
      {
        path: "audit/logs",
        element: <AuditLogsPage />,
      },
      {
        path: "security",
        element: <SecurityPage />,
      },
      {
        path: "backup/management",
        element: <BackupManagementPage />,
      },
      {
        path: "",
        element: <Navigate to="dashboard" replace />,
      },
    ],
  },
];
