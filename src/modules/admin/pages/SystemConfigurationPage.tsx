/**
 * System Configuration Page (Admin)
 * System configuration and settings
 */

import { useState } from "react";
import { Card, Row, Col, Form, Input, InputNumber, Switch, message, Select, Divider, Typography } from "antd";
import { SettingOutlined, SaveOutlined, SecurityScanOutlined, CloudUploadOutlined, BellOutlined } from "@ant-design/icons";
import { Button } from "@/shared/ui";

const { Title, Paragraph, Text } = Typography;

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
      message.success("Đã lưu cấu hình hệ thống");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Cấu hình hệ thống</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Thiết lập các tham số vận hành, giới hạn tài nguyên và các tính năng cốt lõi của nền tảng.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <SettingOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái cấu hình</div>
            <div className="font-display text-2xl font-bold text-slate-800">Operational</div>
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" initialValues={config} onFinish={handleSave} className="space-y-12">
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <Card className="rounded-[3rem] border-pink-100/40 bg-white p-8 shadow-sm">
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <SecurityScanOutlined />
                </div>
                <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Thông tin chung</Title>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tên hệ thống</span>} name="siteName" rules={[{ required: true }]}>
                  <Input className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium" />
                </Form.Item>

                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mô tả</span>} name="description" className="md:col-span-2">
                  <Input.TextArea rows={3} className="rounded-2xl border-slate-100 bg-slate-50/50 font-medium p-4" />
                </Form.Item>
              </div>

              <Divider className="my-10 border-slate-100" />

              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <BellOutlined />
                </div>
                <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Tính năng & Thông báo</Title>
              </div>

              <div className="space-y-6">
                {[
                  { name: "maintenanceMode", label: "Chế độ bảo trì", desc: "Tạm thời ngắt kết nối người dùng để bảo trì hệ thống." },
                  { name: "emailNotifications", label: "Thông báo Email", desc: "Gửi cập nhật quan trọng qua hòm thư điện tử." },
                  { name: "smsNotifications", label: "Thông báo SMS", desc: "Gửi mã xác thực và cảnh báo qua tin nhắn văn bản." },
                ].map((item) => (
                  <div key={item.name} className="flex flex-wrap items-center justify-between gap-5 rounded-[2rem] border border-slate-100/50 bg-slate-50/50 p-6">
                    <div className="min-w-0 flex-1 space-y-1">
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
                    <CloudUploadOutlined />
                  </div>
                  <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Giới hạn</Title>
                </div>

                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dung lượng tải lên tối đa (MB)</span>} name="maxUploadSize" rules={[{ required: true }]}>
                  <InputNumber min={1} max={500} className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium flex items-center" />
                </Form.Item>

                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thời gian hết hạn phiên (phút)</span>} name="sessionTimeout" rules={[{ required: true }]}>
                  <InputNumber min={5} max={1440} className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium flex items-center" />
                </Form.Item>

                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cấp độ Log</span>} name="logLevel" rules={[{ required: true }]}>
                  <Select className="h-12 w-full luxury-select">
                    <Select.Option value="DEBUG">DEBUG</Select.Option>
                    <Select.Option value="INFO">INFO</Select.Option>
                    <Select.Option value="WARN">WARN</Select.Option>
                    <Select.Option value="ERROR">ERROR</Select.Option>
                  </Select>
                </Form.Item>
              </Card>

              <Card className="rounded-[3rem] border-slate-900 bg-slate-900 p-8 shadow-luxury text-white">
                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <Title level={4} className="!m-0 !font-display !text-white uppercase tracking-tight">Lưu thay đổi</Title>
                    <Text className="text-slate-400 text-xs font-medium">Các thiết lập sẽ có hiệu lực ngay lập tức sau khi lưu.</Text>
                  </div>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    className="h-14 w-full rounded-2xl font-bold uppercase tracking-widest text-[11px]"
                  >
                    Cập nhật hệ thống
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

