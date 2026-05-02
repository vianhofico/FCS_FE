/**
 * System Settings Page (Manager)
 * System configuration and settings
 */

import { useState } from "react";
import { Card, Row, Col, Form, Input, InputNumber, Switch, message, Typography, Divider } from "antd";
import { SettingOutlined, SaveOutlined, InfoCircleOutlined, ControlOutlined } from "@ant-design/icons";
import { Button } from "@/shared/ui";

const { Title, Paragraph, Text } = Typography;

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
      message.success("Đã lưu cài đặt hệ thống");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Cài đặt hệ thống</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Tùy chỉnh các thông số vận hành và quy tắc nghiệp vụ của nền tảng ký gửi thời trang.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <SettingOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trình quản lý</div>
            <div className="font-display text-2xl font-bold text-slate-800">Operational Hub</div>
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" initialValues={settings} onFinish={handleSave} className="space-y-12">
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <Card className="rounded-[3rem] border-pink-100/40 bg-white p-8 shadow-sm">
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <ControlOutlined />
                </div>
                <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Cấu hình vận hành</Title>
              </div>

              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <Form.Item
                  label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tên nền tảng</span>}
                  name="platformName"
                  rules={[{ required: true, message: "Vui lòng nhập tên nền tảng" }]}
                  className="md:col-span-2"
                >
                  <Input className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium px-4" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tỷ lệ hoa hồng (%)</span>}
                  name="commissionRate"
                  rules={[{ required: true, message: "Vui lòng nhập tỷ lệ hoa hồng" }]}
                >
                  <InputNumber min={0} max={100} className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium flex items-center" />
                </Form.Item>

                <Form.Item
                  label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kích thước file tối đa (MB)</span>}
                  name="maxFileSize"
                  rules={[{ required: true, message: "Vui lòng nhập kích thước file" }]}
                >
                  <InputNumber min={1} max={100} className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium flex items-center" />
                </Form.Item>
              </div>

              <Divider className="my-10 border-slate-100" />

              <div className="space-y-6">
                {[
                  { name: "maintenanceMode", label: "Chế độ bảo trì", desc: "Tạm ngưng hoạt động của website để thực hiện các thay đổi kỹ thuật." },
                  { name: "emailNotifications", label: "Thông báo hệ thống", desc: "Gửi cập nhật tự động về đơn hàng và yêu cầu phê duyệt qua email." },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-[2rem] bg-slate-50/50 p-6 border border-slate-100/50">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-700">{item.label}</div>
                      <div className="text-xs text-slate-400 font-medium italic">{item.desc}</div>
                    </div>
                    <Form.Item name={item.name} valuePropName="checked" className="!m-0">
                      <Switch className="bg-slate-200" />
                    </Form.Item>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <div className="space-y-8">
              <Card className="rounded-[3rem] border-pink-100/40 bg-white p-8 shadow-sm">
                <div className="mb-10 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <InfoCircleOutlined />
                  </div>
                  <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Thông tin phiên bản</Title>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">API Version</span>
                    <span className="font-display font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">v1.0.0</span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Last Updated</span>
                    <span className="font-medium text-slate-500">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>

              <Card className="rounded-[3rem] border-slate-900 bg-slate-900 p-8 shadow-luxury text-white">
                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <Title level={4} className="!m-0 !font-display !text-white uppercase tracking-tight">Lưu cấu hình</Title>
                    <Text className="text-slate-400 text-xs font-medium">Thay đổi sẽ được áp dụng cho toàn bộ người dùng hệ thống.</Text>
                  </div>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    className="h-14 w-full rounded-2xl font-bold uppercase tracking-widest text-[11px]"
                  >
                    Cập nhật cài đặt
                  </Button>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

