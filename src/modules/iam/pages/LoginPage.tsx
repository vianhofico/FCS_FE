import { GoogleOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Card, Divider, Form, Input, Space, Spin } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { env } from "@/app/config/env";
import { useAuth } from "@/shared/context/AuthContext";
import { Button } from "@/shared/ui";
import type { UserRole } from "@/shared/contracts/commonContract";

interface LoginFormValues {
  identifier: string;
  password: string;
}

function getDefaultRouteByRoles(roles: UserRole[] = []) {
  if (roles.includes("ADMIN")) return "/admin/dashboard";
  if (roles.includes("MANAGER")) return "/manager/orders/moderation";
  if (roles.includes("SELLER")) return "/seller/consignments";
  return "/buyer/products";
}

export default function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading, error, clearError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const oauthError = searchParams.get("oauthError");
    if (oauthError) {
      setFormError(oauthError);
    }
  }, [searchParams]);

  const handleGoogleLogin = () => {
    window.location.href = env.googleOAuthUrl;
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setFormError(null);
      clearError();
      const userProfile = await login(values.identifier, values.password);
      navigate(getDefaultRouteByRoles(userProfile.roles));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setFormError(errorMsg);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute left-0 top-20 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <Card className="w-full max-w-md overflow-hidden border-pink-100/50 bg-white/80 shadow-luxury backdrop-blur-xl rounded-[2.5rem]">
        <div className="relative text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-pink-50 text-primary shadow-sm border border-pink-100/50">
              <UserOutlined className="text-3xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-dark font-display uppercase">Hân hạnh đón tiếp</h1>
          <p className="mt-2 font-medium text-text-light italic">Đăng nhập vào không gian thời trang của bạn</p>
        </div>

        <div className="mt-10">
          <Spin spinning={isLoading} delay={200}>
            <Form<LoginFormValues>
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              disabled={isLoading}
              requiredMark={false}
              size="large"
            >
              {(formError || error) && (
                <div className="mb-6 text-left">
                  <Alert
                    title="Lỗi đăng nhập"
                    description={formError || error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => {
                      setFormError(null);
                      clearError();
                    }}
                    className="rounded-xl border-red-100 bg-red-50/50"
                  />
                </div>
              )}

              <Form.Item
                name="identifier"
                label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Email hoặc Username</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập email hoặc tên đăng nhập" },
                  {
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$|^[a-zA-Z0-9_]{3,}$/,
                    message: "Định dạng không hợp lệ",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-primary/40" />}
                  placeholder="name@example.com"
                  className="rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary h-12"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Mật khẩu</span>}
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-primary/40" />}
                  placeholder="••••••••"
                  className="rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary h-12"
                />
              </Form.Item>

              <div className="mb-8 flex justify-end px-1">
                <Link to="/auth/forgot-password"  className="text-xs font-bold text-primary hover:text-primary-hover">
                  Quên mật khẩu?
                </Link>
              </div>

              <Form.Item noStyle>
                <Space orientation="vertical" className="w-full" size="large">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="shadow-luxury"
                    loading={isLoading}
                  >
                    ĐĂNG NHẬP
                  </Button>

                  <Divider plain className="text-xs font-bold uppercase tracking-[0.18em] text-text-light/60">
                    hoặc
                  </Divider>

                  <Button
                    type="default"
                    block
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleLogin}
                    className="border-pink-100 bg-white font-bold text-text-dark shadow-sm hover:border-primary hover:text-primary"
                  >
                    Đăng nhập với Google
                  </Button>

                  <div className="text-center pt-2">
                    <span className="text-sm font-medium text-text-light">Chưa có tài khoản? </span>
                    <Link to="/auth/register" className="text-sm font-bold text-primary hover:text-primary-hover">
                      Tham gia ngay
                    </Link>
                  </div>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </Card>
    </div>
  );
}
