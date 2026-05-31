/**
 * Security Page (Admin)
 * Security settings and policies
 */

import { useState } from "react";
import { Card, Row, Col, Form, InputNumber, Switch, message, Divider, Typography } from "antd";
import { LockOutlined, SaveOutlined, SafetyCertificateOutlined, KeyOutlined, UserOutlined } from "@ant-design/icons";
import { Button } from "@/shared/ui";

const { Title, Paragraph, Text } = Typography;

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
      message.success("Đã lưu thiết lập bảo mật");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-14 pb-28">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Bảo mật hệ thống</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Quản lý chính sách mật khẩu, bảo mật đăng nhập và các quy tắc xác thực để bảo vệ dữ liệu người dùng.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <SafetyCertificateOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Độ tin cậy</div>
            <div className="font-display text-2xl font-bold text-slate-800">Maximum Security</div>
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" initialValues={settings} onFinish={handleSave} className="space-y-12">
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <Card className="rounded-[3rem] border-pink-100/40 bg-white p-8 shadow-sm">
              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <KeyOutlined />
                </div>
                <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Chính sách mật khẩu</Title>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Độ dài tối thiểu</span>} name="passwordMinLength" rules={[{ required: true }]}>
                  <InputNumber min={4} max={20} className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium flex items-center" />
                </Form.Item>

                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hết hạn sau (ngày)</span>} name="passwordExpireDays" rules={[{ required: true }]}>
                  <InputNumber min={0} max={365} className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium flex items-center" />
                </Form.Item>

                <div className="md:col-span-2 space-y-6 mt-4">
                  {[
                    { name: "passwordRequireSymbols", label: "Yêu cầu ký tự đặc biệt", desc: "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*)." },
                    { name: "passwordRequireNumbers", label: "Yêu cầu chữ số", desc: "Mật khẩu phải chứa ít nhất một chữ số (0-9)." },
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
              </div>

              <Divider className="my-10 border-slate-100" />

              <div className="mb-10 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <UserOutlined />
                </div>
                <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Bảo mật đăng nhập</Title>
              </div>

              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2 gap-y-6">
                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số lần thử tối đa</span>} name="maxLoginAttempts" rules={[{ required: true }]}>
                  <InputNumber min={1} max={20} className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium flex items-center" />
                </Form.Item>

                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thời gian khóa (phút)</span>} name="lockoutDurationMinutes" rules={[{ required: true }]}>
                  <InputNumber min={1} max={1440} className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium flex items-center" />
                </Form.Item>

                <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thời gian phiên (phút)</span>} name="sessionMaxDuration" rules={[{ required: true }]}>
                  <InputNumber min={30} max={1440} className="w-full h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-medium flex items-center" />
                </Form.Item>

                <div className="flex flex-wrap items-center justify-between gap-5 rounded-[2rem] border border-slate-100/50 bg-slate-50/50 p-6 md:col-span-2">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-700">Xác thực 2 yếu tố (2FA)</div>
                    <div className="text-xs text-slate-400 font-medium italic">Thêm một lớp bảo mật thứ hai cho tài khoản người dùng.</div>
                  </div>
                  <Form.Item name="twoFactorEnabled" valuePropName="checked" className="!m-0">
                    <Switch className="bg-slate-200" />
                  </Form.Item>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="rounded-[3rem] border-slate-900 bg-slate-900 p-8 shadow-luxury text-white">
              <div className="flex flex-col gap-6">
                <div className="space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-primary text-2xl mb-4">
                    <LockOutlined />
                  </div>
                  <Title level={4} className="!m-0 !font-display !text-white uppercase tracking-tight">Cập nhật chính sách</Title>
                  <Text className="text-slate-400 text-xs font-medium italic">Mọi thay đổi sẽ ảnh hưởng đến quy trình đăng nhập và tạo tài khoản của tất cả người dùng.</Text>
                </div>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  className="h-14 w-full rounded-2xl font-bold uppercase tracking-widest text-[11px]"
                >
                  Lưu thiết lập bảo mật
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

