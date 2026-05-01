/**
 * Register Page
 * Handles user registration
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Alert, Space, Spin, Select } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { authApi } from "@/modules/iam/api/authApi";
import { UserRole } from "@/shared/contracts/commonContract";

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

/**
 * Register page component
 */
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
        role: values.role as UserRole,
      });

      if (response.success) {
        // Redirect to login after successful registration
        navigate("/auth/login", {
          state: { message: "Registration successful! Please log in." },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 text-sm mt-2">Join Fashion Consignment Community</p>
        </div>

        <Spin spinning={isLoading} delay={200}>
          <Form<RegisterFormValues>
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            disabled={isLoading}
          >
            {error && (
              <Form.Item noStyle>
                <Alert
                  message="Registration Failed"
                  description={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError(null)}
                  className="mb-4"
                />
              </Form.Item>
            )}

            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please enter a username" },
                {
                  min: 3,
                  message: "Username must be at least 3 characters",
                },
                {
                  pattern: /^[a-zA-Z0-9_]+$/,
                  message: "Username can only contain letters, numbers, and underscores",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Choose a username"
                size="large"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                type="email"
                size="large"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Register As"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select
                placeholder="Select your role"
                size="large"
                disabled={isLoading}
                options={[
                  { label: "Buyer - Browse and purchase products", value: UserRole.BUYER },
                  { label: "Seller - Consign products for sale", value: UserRole.SELLER },
                  { label: "Manager - Manage operations", value: UserRole.MANAGER },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter a password" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Create a strong password"
                size="large"
                disabled={isLoading}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm your password"
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
                  Create Account
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Sign in here
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
