/**
 * System Settings Page (Manager)
 * System configuration and settings
 */

import { useState } from "react";
import { Card, Row, Col, Form, Button, Input, InputNumber, Switch, message } from "antd";

interface Settings {
  platformName: string;
  commissionRate: number;
  maxFileSize: number;
  maintenanceMode: boolean;
  emailNotifications: boolean;
}

export default function SystemSettingsPage() {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<Settings>({
    platformName: "Fashion Consignment System",
    commissionRate: 15,
    maxFileSize: 10,
    maintenanceMode: false,
    emailNotifications: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (values: Partial<Settings>) => {
    try {
      setLoading(true);
      setSettings({ ...settings, ...values });
      message.success("Settings saved successfully");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">System Settings</h1>

        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card title="General Settings" className="shadow-sm">
              <Form
                form={form}
                layout="vertical"
                initialValues={settings}
                onFinish={handleSave}
              >
                <Form.Item
                  label="Platform Name"
                  name="platformName"
                  rules={[{ required: true, message: "Platform name is required" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Commission Rate (%)"
                  name="commissionRate"
                  rules={[{ required: true, message: "Commission rate is required" }]}
                >
                  <InputNumber min={0} max={100} />
                </Form.Item>

                <Form.Item
                  label="Max File Size (MB)"
                  name="maxFileSize"
                  rules={[{ required: true, message: "Max file size is required" }]}
                >
                  <InputNumber min={1} max={100} />
                </Form.Item>

                <Form.Item
                  label="Maintenance Mode"
                  name="maintenanceMode"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Email Notifications"
                  name="emailNotifications"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Settings
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24}>
            <Card title="System Information" className="shadow-sm">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <p className="text-gray-600">API Version</p>
                  <p className="font-semibold">v1.0.0</p>
                </Col>
                <Col xs={24} sm={12}>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-semibold">{new Date().toLocaleDateString()}</p>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
