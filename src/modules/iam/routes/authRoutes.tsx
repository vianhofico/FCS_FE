/**
 * Auth Routes
 * Routes for authentication flows
 */

import type { RouteObject } from "react-router-dom";
import LoginPage from "@/modules/iam/pages/LoginPage";
import ForgotPasswordPage from "@/modules/iam/pages/ForgotPasswordPage";
import OAuth2CallbackPage from "@/modules/iam/pages/OAuth2CallbackPage";
import RegisterPage from "@/modules/iam/pages/RegisterPage";
import ResetPasswordPage from "@/modules/iam/pages/ResetPasswordPage";

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
    path: "oauth2/callback",
    element: <OAuth2CallbackPage />,
  },
  {
    path: "forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "reset-password",
    element: <ResetPasswordPage />,
  },
];
