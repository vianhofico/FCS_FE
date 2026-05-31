/**
 * Seller Profile Page (Seller)
 * Manage seller business information and settings
 */

import { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Spin,
  message,
  Upload,
  Row,
  Col,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from "@/shared/context/AuthContext";
import { Button } from "@/shared/ui";

const { Title, Text, Paragraph } = Typography;

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
          error: "Không thể tải thông tin hồ sơ",
        }));
      }
    };

    fetchProfile();
  }, [user, form]);

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      setState((prev) => ({ ...prev, isSaving: true }));

      // In real scenario, save to API
      message.success("Cập nhật hồ sơ thành công");
      setState((prev) => ({
        ...prev,
        profile: { ...(prev.profile ?? state.profile ?? {}), ...values } as SellerProfile,
        isSaving: false,
      }));
    } catch {
      message.error("Lưu hồ sơ thất bại");
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
    <div className="mx-auto max-w-[1000px] space-y-14 pb-28">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Hồ sơ người bán</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Cập nhật thông tin doanh nghiệp và thiết lập tài khoản để tối ưu hóa trải nghiệm bán hàng.
          </Paragraph>
        </div>
      </div>

      {state.error && (
        <Card className="rounded-[2rem] border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
          <Paragraph className="!m-0 font-medium text-red-800 italic">{state.error}</Paragraph>
        </Card>
      )}

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-10 shadow-luxury">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          requiredMark={false}
          autoComplete="off"
          size="large"
          className="space-y-2"
        >
          {/* Business Information */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Thông tin kinh doanh</Text>
              <div className="h-px flex-1 bg-pink-100/50" />
            </div>

            <Row gutter={[28, 12]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessName"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tên doanh nghiệp / Gian hàng</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tên kinh doanh" }]}
                >
                  <Input placeholder="Tên gian hàng của bạn" className="rounded-2xl border-pink-100 h-12" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessEmail"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Email liên hệ</span>}
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input type="email" placeholder="business@example.com" className="rounded-2xl border-pink-100 h-12" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[28, 12]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessPhone"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số điện thoại</span>}
                  rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                >
                  <Input placeholder="09xx xxx xxx" className="rounded-2xl border-pink-100 h-12" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessAddress"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Địa chỉ</span>}
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <Input placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố" className="rounded-2xl border-pink-100 h-12" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="businessDescription"
              label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Mô tả gian hàng</span>}
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input.TextArea rows={4} placeholder="Chia sẻ câu chuyện hoặc phong cách thời trang của bạn..." className="rounded-2xl border-pink-100 p-4" />
            </Form.Item>
          </div>

          {/* Legal Information */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Thông tin pháp lý</Text>
              <div className="h-px flex-1 bg-pink-100/50" />
            </div>

            <Row gutter={[28, 12]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="businessLicense"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số giấy phép kinh doanh</span>}
                  rules={[{ required: true, message: "Vui lòng nhập số giấy phép" }]}
                >
                  <Input placeholder="Mã số giấy phép" className="rounded-2xl border-pink-100 h-12" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="taxId"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Mã số thuế (MST)</span>}
                  rules={[{ required: true, message: "Vui lòng nhập mã số thuế" }]}
                >
                  <Input placeholder="MST cá nhân hoặc doanh nghiệp" className="rounded-2xl border-pink-100 h-12" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Bank Information */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Thông tin tài khoản</Text>
              <div className="h-px flex-1 bg-pink-100/50" />
            </div>

            <Row gutter={[28, 12]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="bankName"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Ngân hàng</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tên ngân hàng" }]}
                >
                  <Input placeholder="Ví dụ: Vietcombank" className="rounded-2xl border-pink-100 h-12" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="accountHolder"
                  label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tên chủ tài khoản</span>}
                  rules={[{ required: true, message: "Vui lòng nhập tên chủ tài khoản" }]}
                >
                  <Input placeholder="VIẾT CHỮ IN HOA KHÔNG DẤU" className="rounded-2xl border-pink-100 h-12" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="bankAccountNumber"
              label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số tài khoản</span>}
              rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}
            >
              <Input placeholder="Nhập số tài khoản" type="password" className="rounded-2xl border-pink-100 h-12" />
            </Form.Item>
          </div>

          {/* Profile Image */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Hình ảnh đại diện</Text>
              <div className="h-px flex-1 bg-pink-100/50" />
            </div>

            <Form.Item
              name="profileImage"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
            >
              <Upload
                maxCount={1}
                beforeUpload={() => false}
                accept=".png,.jpg,.jpeg"
                listType="picture-card"
                className="luxury-upload"
              >
                <div className="flex flex-col items-center gap-2">
                  <PlusOutlined className="text-primary text-xl" />
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tải ảnh lên</div>
                </div>
              </Upload>
            </Form.Item>
          </div>

          {/* Actions */}
          <div className="mt-12 flex flex-col justify-end gap-4 border-t border-pink-50 pt-8 sm:flex-row">
            <Button
              size="large"
              onClick={() => form.resetFields()}
              className="px-10 rounded-2xl font-bold text-slate-400 hover:text-slate-600"
            >
              LÀM MỚI
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={state.isSaving}
              className="px-10 shadow-luxury"
            >
              LƯU THAY ĐỔI
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
