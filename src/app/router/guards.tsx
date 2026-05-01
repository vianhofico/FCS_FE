import type { ReactNode } from "react";
import { Result } from "antd";
import { useAuth } from "@/shared/context/AuthContext";
import type { UserRole } from "@/shared/contracts/commonContract";

type GuardProps = {
  children: ReactNode;
};

type RoleGuardProps = GuardProps & {
  requiredRoles: UserRole[];
};

export function AuthGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Result
        status="403"
        title="Unauthorized"
        subTitle="Please log in to continue."
      />
    );
  }

  return <>{children}</>;
}

export function RoleGuard({ children, requiredRoles }: RoleGuardProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Result
        status="403"
        title="Unauthorized"
        subTitle="Please log in to continue."
      />
    );
  }

  if (!requiredRoles.length) {
    return <>{children}</>;
  }

  if (!hasRole(requiredRoles)) {
    return (
      <Result
        status="403"
        title="Forbidden"
        subTitle="You do not have permission to access this page."
      />
    );
  }

  return <>{children}</>;
}
