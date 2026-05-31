/**
 * Communication Center Page (Manager)
 * Broadcast messages and communication
 */

import { useState } from "react";
import { Card, Table, Form, Modal, Input, Select, message, Row, Col, Typography } from "antd";
import { SendOutlined, MailOutlined, TeamOutlined, CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

const ONE_DAY_AGO = new Date(Date.now() - 86400000).toISOString();

interface Message {
  id: string;
  title: string;
  recipient: string;
  status: string;
  createdAt: string;
}

export default function CommunicationCenterPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", title: "Thông báo bảo trì định kỳ", recipient: "ALL", status: "SENT", createdAt: new Date().toISOString() },
    { id: "m2", title: "Cập nhật chính sách người bán mới", recipient: "SELLERS", status: "SENT", createdAt: ONE_DAY_AGO },
  ]);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (values: { title: string; content: string; recipient: string }) => {
    try {
      setLoading(true);
      const newMessage: Message = {
        id: `m${messages.length + 1}`,
        title: values.title,
        recipient: values.recipient,
        status: "SENT",
        createdAt: new Date().toISOString(),
      };
      setMessages([newMessage, ...messages]);
      message.success("Đã gửi thông báo thành công!");
      form.resetFields();
      setIsModalVisible(false);
    } catch {
      message.error("Gửi thông báo thất bại");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tiêu đề</span>,
      dataIndex: "title",
      key: "title",
      render: (text: string) => <span className="font-bold text-slate-700">{text}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đối tượng</span>,
      dataIndex: "recipient",
      key: "recipient",
      render: (role: string) => (
        <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-100 uppercase">
          {role}
        </span>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: () => (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
          <CheckCircleOutlined /> ĐÃ GỬI
        </span>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày gửi</span>,
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => <span className="font-medium text-slate-500">{new Date(date).toLocaleDateString()}</span>,
    },
  ];

  const stats = [
    { label: "Tổng thông báo", value: messages.length, color: "bg-slate-50 text-slate-500", icon: <MailOutlined /> },
    { label: "Người nhận", value: "Tất cả", color: "bg-blue-50 text-blue-500", icon: <TeamOutlined /> },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-14 pb-28">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Trung tâm thông báo</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Phát sóng các thông tin quan trọng, cập nhật chính sách và duy trì kết nối với cộng đồng Re:Wear.
          </Paragraph>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<SendOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="h-12 rounded-xl px-8 font-black shadow-luxury uppercase tracking-widest text-xs"
        >
          GỬI THÔNG BÁO MỚI
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  <div className="font-display text-2xl font-bold text-slate-800">{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center gap-4 px-2">
          <InfoCircleOutlined className="text-xl text-primary/60" />
          <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Lịch sử phát sóng</Title>
        </div>

        <Table
          columns={columns}
          dataSource={messages.map((msg) => ({ ...msg, key: msg.id }))}
          pagination={false}
          className="luxury-table"
        />

        {messages.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Chưa có thông báo nào"
              description="Hãy bắt đầu gửi thông báo đầu tiên đến người dùng hệ thống."
            />
          </div>
        )}
      </Card>

      <Modal
        title={<Title level={4} className="!m-0 !font-display uppercase tracking-tight">Soạn thông báo mới</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="luxury-modal"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleSendMessage} className="mt-8" size="large">
          <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tiêu đề thông báo</span>} name="title" rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
            <Input placeholder="Nhập tiêu đề..." className="rounded-2xl border-pink-100" />
          </Form.Item>

          <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Đối tượng nhận</span>} name="recipient" rules={[{ required: true, message: "Vui lòng chọn đối tượng" }]}>
            <Select className="luxury-select" placeholder="Chọn đối tượng...">
              <Select.Option value="ALL">Tất cả người dùng</Select.Option>
              <Select.Option value="BUYERS">Người mua (Buyers)</Select.Option>
              <Select.Option value="SELLERS">Người bán (Sellers)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Nội dung chi tiết</span>} name="content" rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}>
            <Input.TextArea rows={6} placeholder="Nhập nội dung thông báo..." className="rounded-2xl border-pink-100 p-4" />
          </Form.Item>

          <div className="mt-10 flex gap-4">
            <Button block size="large" onClick={() => setIsModalVisible(false)}>HỦY BỎ</Button>
            <Button type="primary" block size="large" htmlType="submit" loading={loading} icon={<SendOutlined />}>GỬI NGAY</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
