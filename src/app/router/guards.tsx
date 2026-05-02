import type { ReactNode } from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import type { UserRole } from "@/shared/contracts/commonContract";

type GuardProps = {
  children: ReactNode;
};

type RoleGuardProps = GuardProps & {
  requiredRoles: UserRole[];
};

export function AuthGuard({ children }: GuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen italic text-slate-400">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Result
        status="403"
        title="Chưa đăng nhập"
        subTitle="Vui lòng đăng nhập để tiếp tục khám phá Re:Wear."
        extra={<Button type="primary" onClick={() => navigate("/auth/login")}>Đăng nhập ngay</Button>}
      />
    );
  }

  return <>{children}</>;
}

export function RoleGuard({ children, requiredRoles }: RoleGuardProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen italic text-slate-400">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Result
        status="403"
        title="Chưa đăng nhập"
        subTitle="Vui lòng đăng nhập để tiếp tục."
        extra={<Button type="primary" onClick={() => navigate("/auth/login")}>Đăng nhập ngay</Button>}
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
        title="Truy cập bị từ chối"
        subTitle="Bạn không có quyền truy cập vào trang này."
      />
    );
  }

  return <>{children}</>;
}
