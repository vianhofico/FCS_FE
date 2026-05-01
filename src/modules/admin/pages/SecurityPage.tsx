/**
 * Security Page (Admin)
 * Security settings and policies
 */

import { useState } from "react";
import { Card, Row, Col, Form, Button, InputNumber, Switch, message, Divider } from "antd";

interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireSymbols: boolean;
  passwordRequireNumbers: boolean;
  passwordExpireDays: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  twoFactorEnabled: boolean;
  sessionMaxDuration: number;
}

export default function SecurityPage() {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    passwordRequireSymbols: true,
    passwordRequireNumbers: true,
    passwordExpireDays: 90,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    twoFactorEnabled: true,
    sessionMaxDuration: 480,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (values: Partial<SecuritySettings>) => {
    try {
      setLoading(true);
      setSettings({ ...settings, ...values });
      message.success("Security settings saved");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Security Settings</h1>

        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card title="Password Policy" className="shadow-sm">
              <Form form={form} layout="vertical" initialValues={settings} onFinish={handleSave}>
                <Form.Item label="Minimum Length" name="passwordMinLength" rules={[{ required: true }]}>
                  <InputNumber min={4} max={20} />
                </Form.Item>

                <Form.Item label="Require Symbols" name="passwordRequireSymbols" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Form.Item label="Require Numbers" name="passwordRequireNumbers" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Form.Item label="Expiration Days" name="passwordExpireDays" rules={[{ required: true }]}>
                  <InputNumber min={0} max={365} />
                </Form.Item>

                <Divider />

                <h3 className="font-semibold mb-4">Login Security</h3>

                <Form.Item label="Max Login Attempts" name="maxLoginAttempts" rules={[{ required: true }]}>
                  <InputNumber min={1} max={20} />
                </Form.Item>

                <Form.Item label="Lockout Duration (minutes)" name="lockoutDurationMinutes" rules={[{ required: true }]}>
                  <InputNumber min={1} max={1440} />
                </Form.Item>

                <Form.Item label="Two-Factor Authentication" name="twoFactorEnabled" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Form.Item label="Session Duration (minutes)" name="sessionMaxDuration" rules={[{ required: true }]}>
                  <InputNumber min={30} max={1440} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Security Settings
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
