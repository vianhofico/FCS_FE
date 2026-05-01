/**
 * Approvals Page (Manager)
 * System approvals and requests
 */

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Spin,
  Empty,
  Tag,
  Modal,
  message,
  Space,
  Row,
  Col,
  Statistic,
} from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

interface ApprovalRequest {
  id: string;
  type: string;
  requester: string;
  description: string;
  status: string;
  createdAt: string;
}

interface PageState {
  approvals: ApprovalRequest[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
  stats: {
    total: number;
    pending: number;
    approved: number;
  };
}

export default function ApprovalsPage() {
  const [state, setState] = useState<PageState>({
    approvals: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
    stats: { total: 0, pending: 0, approved: 0 },
  });

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Mock data
        const mockApprovals: ApprovalRequest[] = [
          {
            id: "a1",
            type: "SELLER_VERIFICATION",
            requester: "seller@example.com",
            description: "New seller verification",
            status: "PENDING",
            createdAt: new Date().toISOString(),
          },
          {
            id: "a2",
            type: "COMMISSION_UPDATE",
            requester: "manager@example.com",
            description: "Update commission rate",
            status: "APPROVED",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ];

        setState((prev) => ({
          ...prev,
          approvals: mockApprovals,
          total: mockApprovals.length,
          stats: {
            total: mockApprovals.length,
            pending: mockApprovals.filter((a) => a.status === "PENDING").length,
            approved: mockApprovals.filter((a) => a.status === "APPROVED").length,
          },
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load approvals",
        }));
      }
    };

    fetchApprovals();
  }, []);

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: "Approve Request",
      content: "Are you sure you want to approve this request?",
      okText: "Approve",
      onOk: async () => {
        try {
          message.success("Request approved");
          setState((prev) => ({
            ...prev,
            approvals: prev.approvals.map((a) =>
              a.id === id ? { ...a, status: "APPROVED" } : a
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to approve");
        }
      },
    });
  };

  const handleReject = (id: string) => {
    Modal.confirm({
      title: "Reject Request",
      content: "Are you sure you want to reject this request?",
      okText: "Reject",
      okType: "danger",
      onOk: async () => {
        try {
          message.success("Request rejected");
          setState((prev) => ({
            ...prev,
            approvals: prev.approvals.map((a) =>
              a.id === id ? { ...a, status: "REJECTED" } : a
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to reject");
        }
      },
    });
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: "Requester",
      dataIndex: "requester",
      key: "requester",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          PENDING: "orange",
          APPROVED: "green",
          REJECTED: "red",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ApprovalRequest) => (
        <Space size="small">
          {record.status === "PENDING" && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                size="small"
              >
                Approve
              </Button>
              <Button
                danger
                type="link"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
                size="small"
              >
                Reject
              </Button>
            </>
          )}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Approvals</h1>

        {/* Stats */}
        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Total" value={state.stats.total} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Pending" value={state.stats.pending} valueStyle={{ color: "#faad14" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Approved" value={state.stats.approved} valueStyle={{ color: "#52c41a" }} />
            </Card>
          </Col>
        </Row>

        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={state.approvals.map((approval) => ({ ...approval, key: approval.id }))}
            pagination={false}
            loading={state.isLoading}
          />
          {state.approvals.length === 0 && <Empty description="No pending approvals" />}
        </Card>
      </div>
    </div>
  );
}
