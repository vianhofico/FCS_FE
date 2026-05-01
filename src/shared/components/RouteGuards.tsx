/**
 * Route Guards
 * Components for protecting routes based on auth and role
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import type { UserRole } from "@/shared/contracts/commonContract";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
}

/**
 * Protected Route - requires authentication
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Role-based Route - requires authentication and specific role(s)
 */
export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
