/**
 * Communication Center Page (Manager)
 * Broadcast messages and communication
 */

import { useState } from "react";
import { Card, Button, Table, Empty, Form, Modal, Input, Select, message, Space, Row, Col, Statistic } from "antd";
import { SendOutlined } from "@ant-design/icons";

interface Message {
  id: string;
  title: string;
  recipient: string;
  status: string;
  createdAt: string;
}

export default function CommunicationCenterPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "m1", title: "Maintenance Notice", recipient: "ALL", status: "SENT", createdAt: new Date().toISOString() },
    { id: "m2", title: "New Feature Announcement", recipient: "SELLERS", status: "SENT", createdAt: new Date(Date.now() - 86400000).toISOString() },
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
      message.success("Message sent successfully");
      form.resetFields();
      setIsModalVisible(false);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Recipient", dataIndex: "recipient", key: "recipient" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Date", dataIndex: "createdAt", key: "date", render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Communication Center</h1>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Total Sent" value={messages.length} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Status: Sent" value={messages.filter(m => m.status === "SENT").length} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => setIsModalVisible(true)}
                block
              >
                Send Message
              </Button>
            </Card>
          </Col>
        </Row>

        <Card title="Messages" className="shadow-sm">
          <Table
            columns={columns}
            dataSource={messages.map((msg) => ({ ...msg, key: msg.id }))}
            pagination={false}
          />
          {messages.length === 0 && <Empty description="No messages" />}
        </Card>

        <Modal
          title="Send Message"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSendMessage}>
            <Form.Item label="Title" name="title" rules={[{ required: true }]}>
              <Input placeholder="Message title" />
            </Form.Item>
            <Form.Item label="Content" name="content" rules={[{ required: true }]}>
              <Input.TextArea rows={4} placeholder="Message content" />
            </Form.Item>
            <Form.Item label="Recipients" name="recipient" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="ALL">All Users</Select.Option>
                <Select.Option value="BUYERS">Buyers</Select.Option>
                <Select.Option value="SELLERS">Sellers</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Send
                </Button>
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
