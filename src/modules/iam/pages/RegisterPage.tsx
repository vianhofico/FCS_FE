import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Card, Form, Input, Space, Spin } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "@/modules/iam/api/authApi";
import { Button } from "@/shared/ui";

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export default function RegisterPage() {
  const [form] = Form.useForm<RegisterFormValues>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authApi.register({
        username: values.username,
        email: values.email,
        password: values.password,
        phone: values.phone,
      });

      if (response.success) {
        navigate("/auth/login", {
          state: { message: "Đăng ký thành công! Vui lòng đăng nhập." },
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Registration failed";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center px-4 py-10">
      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute -right-10 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <Card className="w-full max-w-lg overflow-hidden border-pink-100/50 bg-white/80 shadow-luxury backdrop-blur-xl rounded-[2.5rem]">
        <div className="relative text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-pink-50 text-primary shadow-sm border border-pink-100/50">
              <MailOutlined className="text-3xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-dark font-display uppercase">Tham gia Re:Wear</h1>
          <p className="mt-2 font-medium text-text-light italic">Bắt đầu hành trình ký gửi thời trang bền vững</p>
        </div>

        <div className="mt-10">
          <Spin spinning={isLoading} delay={200}>
            <Form<RegisterFormValues>
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              disabled={isLoading}
              requiredMark={false}
              size="large"
            >
              {error && (
                <div className="mb-6">
                  <Alert
                    message="Lỗi đăng ký"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    className="rounded-xl border-red-100 bg-red-50/50"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                <Form.Item
                  name="username"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tên đăng nhập</span>}
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đăng nhập" },
                    { min: 3, message: "Tên đăng nhập phải ít nhất 3 ký tự" },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: "Chỉ chứa chữ, số và dấu gạch dưới" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-primary/40" />}
                    placeholder="lux_user"
                    className="rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Email</span>}
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không đúng định dạng" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-primary/40" />}
                    placeholder="email@example.com"
                    className="rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary h-12"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="phone"
                label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số điện thoại (tùy chọn)</span>}
              >
                <Input
                  placeholder="09xx xxx xxx"
                  className="rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary h-12"
                />
              </Form.Item>

              <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                <Form.Item
                  name="password"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Mật khẩu</span>}
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu" },
                    { min: 8, message: "Mật khẩu phải ít nhất 8 ký tự" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-primary/40" />}
                    placeholder="••••••••"
                    className="rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary h-12"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Xác nhận mật khẩu</span>}
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
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
                    className="rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary h-12"
                  />
                </Form.Item>
              </div>

              <Form.Item noStyle>
                <Space direction="vertical" className="w-full" size="large">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="mt-4 shadow-luxury"
                    loading={isLoading}
                  >
                    TẠO TÀI KHOẢN
                  </Button>

                  <div className="text-center">
                    <span className="text-sm font-medium text-text-light">Đã có tài khoản? </span>
                    <Link to="/auth/login" className="text-sm font-bold text-primary hover:text-primary-hover">
                      Đăng nhập tại đây
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
