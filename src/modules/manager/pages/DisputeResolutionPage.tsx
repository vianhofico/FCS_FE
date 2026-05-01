/**
 * Dispute Resolution Page (Manager)
 * Handle disputes between buyers and sellers
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
import { CheckOutlined } from "@ant-design/icons";

interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface PageState {
  disputes: Dispute[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
  stats: {
    total: number;
    pending: number;
    resolved: number;
  };
}

export default function DisputeResolutionPage() {
  const [state, setState] = useState<PageState>({
    disputes: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
    stats: { total: 0, pending: 0, resolved: 0 },
  });

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Mock data for disputes
        const mockDisputes: Dispute[] = [
          {
            id: "d1",
            orderId: "o1",
            buyerId: "b1",
            sellerId: "s1",
            reason: "Product quality issue",
            status: "PENDING",
            createdAt: new Date().toISOString(),
          },
        ];

        setState((prev) => ({
          ...prev,
          disputes: mockDisputes,
          total: mockDisputes.length,
          stats: {
            total: mockDisputes.length,
            pending: mockDisputes.filter((d) => d.status === "PENDING").length,
            resolved: mockDisputes.filter((d) => d.status === "RESOLVED").length,
          },
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load disputes",
        }));
      }
    };

    fetchDisputes();
  }, []);

  const handleResolveDispute = (disputeId: string, resolution: string) => {
    Modal.confirm({
      title: "Resolve Dispute",
      content: `Resolution: ${resolution}`,
      okText: "Confirm",
      onOk: async () => {
        try {
          message.success("Dispute resolved");
          setState((prev) => ({
            ...prev,
            disputes: prev.disputes.map((d) =>
              d.id === disputeId ? { ...d, status: "RESOLVED" } : d
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to resolve dispute");
        }
      },
    });
  };

  const columns = [
    {
      title: "Dispute ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "PENDING" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Dispute) => (
        <Space size="small">
          {record.status === "PENDING" && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleResolveDispute(record.id, "Favor Buyer")}
                size="small"
              >
                Favor Buyer
              </Button>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleResolveDispute(record.id, "Favor Seller")}
                size="small"
              >
                Favor Seller
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dispute Resolution</h1>

        {/* Stats */}
        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Total Disputes" value={state.stats.total} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Pending" value={state.stats.pending} valueStyle={{ color: "#faad14" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Resolved" value={state.stats.resolved} valueStyle={{ color: "#52c41a" }} />
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
            dataSource={state.disputes.map((dispute) => ({ ...dispute, key: dispute.id }))}
            pagination={false}
            loading={state.isLoading}
          />
          {state.disputes.length === 0 && <Empty description="No disputes" />}
        </Card>
      </div>
    </div>
  );
}
