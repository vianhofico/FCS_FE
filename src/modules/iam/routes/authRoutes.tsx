/**
 * Auth Routes
 * Routes for authentication flows
 */

import type { RouteObject } from "react-router-dom";
import LoginPage from "@/modules/iam/pages/LoginPage";
import RegisterPage from "@/modules/iam/pages/RegisterPage";

export const authRoutes: RouteObject[] = [
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "register",
    element: <RegisterPage />,
  },
  {
    path: "forgot-password",
    element: <div>Forgot Password Page (Coming Soon)</div>,
  },
];
