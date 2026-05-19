import { LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Alert, Card, Form, Input, Spin } from "antd";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { authApi } from "@/modules/iam/api/authApi";
import { Button } from "@/shared/ui";

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [form] = Form.useForm<ResetPasswordFormValues>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get("token");

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("Liên kết đặt lại mật khẩu không hợp lệ");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      await authApi.resetPassword({ token, newPassword: values.newPassword });
      navigate("/auth/login", { replace: true, state: { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập." } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đặt lại mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute left-0 top-20 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-80 w-80 translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />

      <Card className="w-full max-w-md overflow-hidden rounded-[2.5rem] border-pink-100/50 bg-white/80 shadow-luxury backdrop-blur-xl">
        <div className="relative text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-pink-100/50 bg-pink-50 text-primary shadow-sm">
              <SafetyCertificateOutlined className="text-3xl" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text-dark">Đặt lại mật khẩu</h1>
          <p className="mt-2 font-medium italic text-text-light">Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <div className="mt-10">
          <Spin spinning={isLoading} delay={200}>
            {!token && (
              <div className="mb-6">
                <Alert
                  title="Liên kết không hợp lệ"
                  description="Vui lòng yêu cầu email đặt lại mật khẩu mới."
                  type="error"
                  showIcon
                  className="rounded-xl border-red-100 bg-red-50/50"
                />
              </div>
            )}

            {error && (
              <div className="mb-6">
                <Alert
                  title="Không thể đặt lại mật khẩu"
                  description={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError(null)}
                  className="rounded-xl border-red-100 bg-red-50/50"
                />
              </div>
            )}

            <Form<ResetPasswordFormValues>
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              disabled={isLoading || !token}
              requiredMark={false}
              size="large"
            >
              <Form.Item
                name="newPassword"
                label={<span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70">Mật khẩu mới</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  { min: 8, message: "Mật khẩu phải ít nhất 8 ký tự" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-primary/40" />}
                  placeholder="••••••••"
                  className="h-12 rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={<span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70">Xác nhận mật khẩu</span>}
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-primary/40" />}
                  placeholder="••••••••"
                  className="h-12 rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary"
                />
              </Form.Item>

              <div className="pt-2">
                <Button type="primary" htmlType="submit" block loading={isLoading} disabled={!token} className="shadow-luxury">
                  ĐẶT LẠI MẬT KHẨU
                </Button>
                <Link to="/auth/login" className="mt-6 block text-center text-sm font-bold text-primary hover:text-primary-hover">
                  Quay lại đăng nhập
                </Link>
              </div>
            </Form>
          </Spin>
        </div>
      </Card>
    </div>
  );
}
