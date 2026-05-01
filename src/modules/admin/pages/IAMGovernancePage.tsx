/**
 * IAM Governance Page (Admin)
 * Manage IAM policies and access control
 */

import { useState, useEffect } from "react";
import { Card, Button, Table, Spin, Empty, Tag, Modal, message, Space, Row, Col, Statistic } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

interface IAMPolicy {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
}

interface PageState {
  policies: IAMPolicy[];
  isLoading: boolean;
  error: string | null;
  total: number;
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export default function IAMGovernancePage() {
  const [state, setState] = useState<PageState>({
    policies: [],
    isLoading: true,
    error: null,
    total: 0,
    stats: { total: 0, active: 0, inactive: 0 },
  });

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const mockPolicies: IAMPolicy[] = [
          { id: "p1", name: "Buyer Policy", description: "Default buyer access", type: "ROLE", status: "ACTIVE", createdAt: new Date().toISOString() },
          { id: "p2", name: "Seller Policy", description: "Default seller access", type: "ROLE", status: "ACTIVE", createdAt: new Date().toISOString() },
          { id: "p3", name: "Admin Policy", description: "Full admin access", type: "ROLE", status: "ACTIVE", createdAt: new Date().toISOString() },
        ];

        setState((prev) => ({
          ...prev,
          policies: mockPolicies,
          total: mockPolicies.length,
          stats: {
            total: mockPolicies.length,
            active: mockPolicies.filter((p) => p.status === "ACTIVE").length,
            inactive: mockPolicies.filter((p) => p.status === "INACTIVE").length,
          },
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load policies",
        }));
      }
    };

    fetchPolicies();
  }, []);

  const handleDeletePolicy = (policyId: string) => {
    Modal.confirm({
      title: "Delete Policy",
      content: "Are you sure you want to delete this policy?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          message.success("Policy deleted");
          setState((prev) => ({
            ...prev,
            policies: prev.policies.filter((p) => p.id !== policyId),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to delete policy");
        }
      },
    });
  };

  const columns = [
    { title: "Policy Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Type", dataIndex: "type", key: "type", render: (type: string) => <Tag>{type}</Tag> },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={status === "ACTIVE" ? "green" : "red"}>{status}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: IAMPolicy) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} size="small">
            Edit
          </Button>
          <Button danger type="link" icon={<DeleteOutlined />} onClick={() => handleDeletePolicy(record.id)} size="small">
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">IAM Governance</h1>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Total Policies" value={state.stats.total} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Active" value={state.stats.active} valueStyle={{ color: "#52c41a" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Inactive" value={state.stats.inactive} valueStyle={{ color: "#ff4d4f" }} />
            </Card>
          </Col>
        </Row>

        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        <Card title="Policies" className="shadow-sm" extra={<Button type="primary">New Policy</Button>}>
          <Table columns={columns} dataSource={state.policies.map((p) => ({ ...p, key: p.id }))} pagination={false} loading={state.isLoading} />
          {state.policies.length === 0 && <Empty description="No policies" />}
        </Card>
      </div>
    </div>
  );
}
