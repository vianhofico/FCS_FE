import { Alert, Card, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/shared/context/AuthContext";
import type { LoginResponse } from "@/shared/contracts/authContract";
import type { UserRole } from "@/shared/contracts/commonContract";

function getDefaultRouteByRoles(roles: UserRole[] = []) {
  if (roles.includes("ADMIN")) return "/admin/dashboard";
  if (roles.includes("MANAGER")) return "/manager/orders/moderation";
  if (roles.includes("SELLER")) return "/seller/consignments";
  return "/buyer/products";
}

export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oauthError = searchParams.get("oauthError");
    if (oauthError) {
      setError(oauthError);
      return;
    }

    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userId = searchParams.get("userId");
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    const fullName = searchParams.get("fullName") || undefined;
    const roles = searchParams.get("roles")?.split(",").filter(Boolean) as UserRole[] | undefined;

    if (!accessToken || !refreshToken || !userId || !username || !email || !roles?.length) {
      setError("Google login response is incomplete");
      return;
    }

    const payload: LoginResponse = {
      accessToken,
      refreshToken,
      userId,
      username,
      email,
      fullName,
      roles,
    };
    const profile = completeOAuthLogin(payload);
    navigate(getDefaultRouteByRoles(profile.roles), { replace: true });
  }, [completeOAuthLogin, navigate, searchParams]);

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
      <Card className="w-full max-w-md border-pink-100/50 bg-white/80 text-center shadow-luxury backdrop-blur-xl rounded-[2.5rem]">
        {error ? (
          <Alert title="Lỗi đăng nhập Google" description={error} type="error" showIcon />
        ) : (
          <Spin description="Đang hoàn tất đăng nhập Google..." />
        )}
      </Card>
    </div>
  );
}
