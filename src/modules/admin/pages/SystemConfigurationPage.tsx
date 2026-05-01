/**
 * System Configuration Page (Admin)
 * System configuration and settings
 */

import { useState } from "react";
import { Card, Row, Col, Form, Button, Input, InputNumber, Switch, message, Select, Divider } from "antd";

interface SystemConfig {
  siteName: string;
  description: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
  logLevel: string;
}

export default function SystemConfigurationPage() {
  const [form] = Form.useForm();
  const [config, setConfig] = useState<SystemConfig>({
    siteName: "Fashion Consignment System",
    description: "Premium fashion consignment platform",
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    maxUploadSize: 50,
    sessionTimeout: 30,
    logLevel: "INFO",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (values: Partial<SystemConfig>) => {
    try {
      setLoading(true);
      setConfig({ ...config, ...values });
      message.success("Configuration saved successfully");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">System Configuration</h1>

        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card title="General Settings" className="shadow-sm">
              <Form form={form} layout="vertical" initialValues={config} onFinish={handleSave}>
                <Form.Item label="Site Name" name="siteName" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>

                <Form.Item label="Description" name="description">
                  <Input.TextArea rows={3} />
                </Form.Item>

                <Divider />

                <h3 className="font-semibold mb-4">Features</h3>

                <Form.Item label="Maintenance Mode" name="maintenanceMode" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Form.Item label="Email Notifications" name="emailNotifications" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Form.Item label="SMS Notifications" name="smsNotifications" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Divider />

                <h3 className="font-semibold mb-4">Limits</h3>

                <Form.Item label="Max Upload Size (MB)" name="maxUploadSize" rules={[{ required: true }]}>
                  <InputNumber min={1} max={500} />
                </Form.Item>

                <Form.Item label="Session Timeout (minutes)" name="sessionTimeout" rules={[{ required: true }]}>
                  <InputNumber min={5} max={1440} />
                </Form.Item>

                <Form.Item label="Log Level" name="logLevel" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value="DEBUG">DEBUG</Select.Option>
                    <Select.Option value="INFO">INFO</Select.Option>
                    <Select.Option value="WARN">WARN</Select.Option>
                    <Select.Option value="ERROR">ERROR</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Configuration
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
