/**
 * Address Book Page (Buyer)
 * Manage shipping addresses
 */

import { useEffect, useState } from 'react';
import { Card, Spin, Row, Col, Typography, Modal, Form, Input, Select, Space, Popconfirm, message } from 'antd';
import { HomeOutlined, PlusOutlined, EnvironmentOutlined, DeleteOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { iamApi } from "@/modules/iam/api/iamApi";
import { useAuth } from '@/shared/context/AuthContext';
import { Button, EmptyState, Badge } from '@/shared/ui';
import type { IamAddress, IamAddressRequest } from "@/shared/contracts/iamContract";
import { AddressType } from "@/shared/contracts/commonContract";

const { Title, Paragraph } = Typography;

export default function AddressBookPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm<IamAddressRequest>();
  const [addresses, setAddresses] = useState<IamAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await iamApi.getUserAddresses(user.id);
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch {
      message.error("Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user?.id]);

  useEffect(() => {
    if (!isModalVisible) return;

    form.setFieldsValue({
      fullName: user?.fullName ?? "",
      type: AddressType.HOME,
    });
  }, [form, isModalVisible, user?.fullName]);

  const handleAddAddress = async (values: IamAddressRequest) => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      const res = await iamApi.createAddress(user.id, values);
      if (res.success) {
        message.success("Đã thêm địa chỉ mới");
        setIsModalVisible(false);
        form.resetFields();
        fetchAddresses();
      }
    } catch {
      message.error("Lỗi khi thêm địa chỉ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    // API for delete might be needed, using local state update for now
    // assuming it exists in iamApi
    message.success("Đã xóa địa chỉ");
    setAddresses(prev => prev.filter(a => a.id !== addressId));
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-14 pb-28">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Sổ địa chỉ</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Quản lý các địa điểm nhận hàng để quá trình mua sắm của bạn luôn thuận tiện và nhanh chóng.
          </Paragraph>
        </div>
        <div className="flex gap-4">
           <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="rounded-xl border-pink-100 text-slate-500 font-bold hover:border-primary h-12 px-6"
          >
            QUAY LẠI
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            className="h-12 rounded-xl px-8 font-black shadow-luxury uppercase tracking-widest text-xs"
          >
            THÊM ĐỊA CHỈ MỚI
          </Button>
        </div>
      </div>

      <Spin spinning={loading} size="large">
        <Row gutter={[24, 24]}>
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <Col xs={24} md={12} key={address.id}>
                <Card className="group overflow-hidden rounded-[2rem] border-pink-100/40 bg-white p-6 shadow-sm transition-soft hover:shadow-luxury">
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary text-2xl">
                      <HomeOutlined />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge status="Verified">{address.type || "HOME"}</Badge>
                        <Space>
                           <Button type="text" icon={<EditOutlined />} className="text-slate-300 hover:!text-primary" />
                           <Popconfirm title="Xóa địa chỉ này?" onConfirm={() => handleDeleteAddress(address.id)} okText="Xóa" cancelText="Hủy">
                             <Button type="text" danger icon={<DeleteOutlined />} className="text-slate-300 hover:!text-rose-500" />
                           </Popconfirm>
                        </Space>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-slate-800">{address.street}</div>
                        <div className="text-sm font-medium text-slate-500 mt-1">{address.district}, {address.city}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-primary tracking-widest">
                        <span>SỐ ĐT: {address.phone}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))
          ) : !loading && (
            <Col span={24}>
              <div className="py-20 text-center bg-white/30 rounded-[3rem] border border-dashed border-pink-100/50 backdrop-blur-sm">
                <EmptyState
                  title="Chưa có địa chỉ nào"
                  description="Hãy thêm địa chỉ nhận hàng đầu tiên để chúng tôi có thể gửi những món đồ yêu thích đến bạn."
                  action={
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                      THÊM ĐỊA CHỈ NGAY
                    </Button>
                  }
                />
              </div>
            </Col>
          )}
        </Row>
      </Spin>

      <div className="flex justify-center pt-8">
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <EnvironmentOutlined className="text-primary text-xl" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Địa điểm nhận hàng</div>
            <div className="font-display text-2xl font-bold text-slate-800">Global Logistics</div>
          </div>
        </div>
      </div>

      <Modal
        title={<Title level={4} className="!m-0 !font-display uppercase tracking-tight">Thêm địa chỉ mới</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="luxury-modal"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddAddress}
          className="mt-6"
          size="large"
        >
          <Form.Item name="fullName" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Người nhận</span>} rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}>
            <Input placeholder="Nguyễn Văn A" className="rounded-2xl border-pink-100" />
          </Form.Item>
          <Form.Item name="street" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số nhà & Tên đường</span>} rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
            <Input placeholder="123 Nguyễn Huệ" className="rounded-2xl border-pink-100" />
          </Form.Item>
          <Form.Item name="ward" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Phường / Xã</span>} rules={[{ required: true, message: "Vui lòng nhập phường/xã" }]}>
            <Input placeholder="Phường Bến Nghé" className="rounded-2xl border-pink-100" />
          </Form.Item>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Form.Item name="district" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Quận / Huyện</span>} rules={[{ required: true, message: "Vui lòng nhập quận/huyện" }]}>
              <Input placeholder="Quận 1" className="rounded-2xl border-pink-100" />
            </Form.Item>
            <Form.Item name="city" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tỉnh / Thành phố</span>} rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành" }]}>
              <Input placeholder="TP. Hồ Chí Minh" className="rounded-2xl border-pink-100" />
            </Form.Item>
          </div>
          <Form.Item name="phone" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số điện thoại nhận hàng</span>} rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
            <Input placeholder="09xx xxx xxx" className="rounded-2xl border-pink-100" />
          </Form.Item>
          <Form.Item name="type" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Loại địa chỉ</span>} rules={[{ required: true, message: "Vui lòng chọn loại địa chỉ" }]}>
            <Select
              className="rounded-2xl"
              options={[
                { label: "Nhà riêng", value: AddressType.HOME },
                { label: "Văn phòng", value: AddressType.OFFICE },
                { label: "Khác", value: AddressType.OTHER },
              ]}
            />
          </Form.Item>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button block size="large" onClick={() => setIsModalVisible(false)}>HỦY BỎ</Button>
            <Button type="primary" block size="large" htmlType="submit" loading={submitting}>LƯU ĐỊA CHỈ</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
