/**
 * Login Page
 * Handles user authentication
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Alert, Space, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@/shared/context/AuthContext";

interface LoginFormValues {
  identifier: string;
  password: string;
}

/**
 * Login page component
 */
export default function LoginPage() {
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setFormError(null);
      clearError();
      await login(values.identifier, values.password);

      // Redirect to dashboard after successful login
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setFormError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Fashion Consignment</h1>
          <p className="text-gray-600 text-sm mt-2">Sign in to your account</p>
        </div>

        <Spin spinning={isLoading} delay={200}>
          <Form<LoginFormValues>
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            disabled={isLoading}
          >
            {(formError || error) && (
              <Form.Item noStyle>
                <Alert
                  message="Login Failed"
                  description={formError || error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => {
                    setFormError(null);
                    clearError();
                  }}
                  className="mb-4"
                />
              </Form.Item>
            )}

            <Form.Item
              name="identifier"
              label="Email or Username"
              rules={[
                { required: true, message: "Please enter your email or username" },
                {
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$|^[a-zA-Z0-9_]{3,}$/,
                  message: "Please enter a valid email or username",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter your email or username"
                size="large"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                size="large"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item noStyle>
              <Space direction="vertical" className="w-full" size="large">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign up here
                  </Link>
                </div>

                <div className="border-t pt-4">
                  <Link to="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm">
                    Forgot password?
                  </Link>
                </div>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}
