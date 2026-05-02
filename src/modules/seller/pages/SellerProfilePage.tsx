/**
 * Seller Profile Page (Seller)
 * Manage seller business information and settings
 */

import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Spin,
  message,
  Space,
  Upload,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useAuth } from "@/shared/context/AuthContext";

interface SellerProfile {
  id: string;
  businessName: string;
  businessDescription: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  businessLicense: string;
  taxId: string;
  bankName: string;
  bankAccountNumber: string;
  accountHolder: string;
  profileImage?: string;
}

export default function SellerProfilePage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [state, setState] = useState({
    profile: null as SellerProfile | null,
    isLoading: true,
    isSaving: false,
    error: null as string | null,
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // In real scenario, fetch seller profile from API
        const mockProfile: SellerProfile = {
          id: user.id,
          businessName: user.username || "",
          businessDescription: "",
          businessPhone: user.phone || "",
          businessEmail: user.email || "",
          businessAddress: "",
          businessLicense: "",
          taxId: "",
          bankName: "",
          bankAccountNumber: "",
          accountHolder: "",
        };

        form.setFieldsValue(mockProfile);
        setState((prev) => ({
          ...prev,
          profile: mockProfile,
          isLoading: false,
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load profile",
        }));
      }
    };

    fetchProfile();
  }, [user, form]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      setState((prev) => ({ ...prev, isSaving: true }));

      // In real scenario, save to API
      message.success("Profile updated successfully");
      setState((prev) => ({
        ...prev,
        profile: { ...(prev.profile ?? state.profile ?? {}), ...values } as SellerProfile,
        isSaving: false,
      }));
    } catch {
      message.error("Failed to save profile");
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Seller Profile</h1>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Profile Form */}
        <Card className="shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            requiredMark="optional"
            autoComplete="off"
          >
            {/* Business Information */}
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessName"
                  label="Business Name"
                  rules={[{ required: true, message: "Please enter business name" }]}
                >
                  <Input placeholder="Your business name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessEmail"
                  label="Business Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Invalid email" },
                  ]}
                >
                  <Input type="email" placeholder="business@example.com" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessPhone"
                  label="Business Phone"
                  rules={[{ required: true, message: "Please enter phone" }]}
                >
                  <Input placeholder="(555) 123-4567" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessAddress"
                  label="Business Address"
                  rules={[{ required: true, message: "Please enter address" }]}
                >
                  <Input placeholder="123 Main St, City, State" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="businessDescription"
              label="Business Description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea rows={4} placeholder="Describe your business..." />
            </Form.Item>

            {/* Legal Information */}
            <h3 className="text-lg font-semibold mb-4 mt-8">Legal Information</h3>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessLicense"
                  label="Business License Number"
                  rules={[{ required: true, message: "Please enter license number" }]}
                >
                  <Input placeholder="License number" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="taxId"
                  label="Tax ID / EIN"
                  rules={[{ required: true, message: "Please enter tax ID" }]}
                >
                  <Input placeholder="XX-XXXXXXX" />
                </Form.Item>
              </Col>
            </Row>

            {/* Bank Information */}
            <h3 className="text-lg font-semibold mb-4 mt-8">Bank Information</h3>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="bankName"
                  label="Bank Name"
                  rules={[{ required: true, message: "Please enter bank name" }]}
                >
                  <Input placeholder="Bank name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="accountHolder"
                  label="Account Holder Name"
                  rules={[{ required: true, message: "Please enter account holder name" }]}
                >
                  <Input placeholder="Full name on account" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="bankAccountNumber"
              label="Bank Account Number"
              rules={[{ required: true, message: "Please enter account number" }]}
            >
              <Input placeholder="Account number" type="password" />
            </Form.Item>

            {/* Profile Image */}
            <h3 className="text-lg font-semibold mb-4 mt-8">Profile Image</h3>

            <Form.Item
              name="profileImage"
              label="Profile Image"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
            >
              <Upload
                maxCount={1}
                beforeUpload={() => false}
                accept=".png,.jpg,.jpeg"
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>

            {/* Actions */}
            <Form.Item className="mt-8">
              <Space>
                <Button type="primary" htmlType="submit" size="large" loading={state.isSaving}>
                  Save Profile
                </Button>
                <Button onClick={() => form.resetFields()}>Reset</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
