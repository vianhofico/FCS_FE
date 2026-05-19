import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Alert, Card, Form, Input, Spin } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";

import { authApi } from "@/modules/iam/api/authApi";
import { Button } from "@/shared/ui";

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setError(null);
      setIsLoading(true);
      await authApi.forgotPassword({ email: values.email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi email đặt lại mật khẩu");
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
              <MailOutlined className="text-3xl" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-text-dark">Quên mật khẩu</h1>
          <p className="mt-2 font-medium italic text-text-light">Nhập email để nhận liên kết đặt lại mật khẩu</p>
        </div>

        <div className="mt-10">
          <Spin spinning={isLoading} delay={200}>
            {isSubmitted ? (
              <div>
                <Alert
                  type="success"
                  showIcon
                  title="Kiểm tra email của bạn"
                  description="Nếu email đã đăng ký, hệ thống đã gửi liên kết đặt lại mật khẩu. Liên kết sẽ hết hạn sau 15 phút."
                  className="rounded-xl border-emerald-100 bg-emerald-50/50"
                />
                <Link to="/auth/login" className="mt-6 block">
                  <Button block icon={<ArrowLeftOutlined />}>Quay lại đăng nhập</Button>
                </Link>
              </div>
            ) : (
              <Form<ForgotPasswordFormValues>
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
                      title="Không thể gửi email"
                      description={error}
                      type="error"
                      showIcon
                      closable
                      onClose={() => setError(null)}
                      className="rounded-xl border-red-100 bg-red-50/50"
                    />
                  </div>
                )}

                <Form.Item
                  name="email"
                  label={<span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70">Email</span>}
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không đúng định dạng" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-primary/40" />}
                    placeholder="name@example.com"
                    className="h-12 rounded-2xl border-pink-100 bg-white shadow-sm transition-soft hover:border-primary/40 focus:border-primary"
                  />
                </Form.Item>

                <div className="pt-2">
                  <Button type="primary" htmlType="submit" block loading={isLoading} className="shadow-luxury">
                    GỬI LIÊN KẾT
                  </Button>
                  <Link to="/auth/login" className="mt-6 block text-center text-sm font-bold text-primary hover:text-primary-hover">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </Form>
            )}
          </Spin>
        </div>
      </Card>
    </div>
  );
}
