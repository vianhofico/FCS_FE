/**
 * Returns Moderation Page (Manager)
 * Manage return requests
 */

import { useState, useEffect } from "react";
import { Card, Button, Table, Spin, Empty, Tag, Modal, message, Space, Row, Col, Statistic } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { returnApi } from "@/modules/order/api/returnApi";
import type { ReturnRequestSummary } from "@/shared/contracts/returnContract";

interface PageState {
  returns: ReturnRequestSummary[];
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

export default function ReturnsModerationPage() {
  const [state, setState] = useState<PageState>({
    returns: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
    stats: { total: 0, pending: 0, approved: 0 },
  });

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await returnApi.getReturns({
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          const returns = response.data.content || [];
          setState((prev) => ({
            ...prev,
            returns,
            total: response.data?.totalElements || 0,
            stats: {
              total: returns.length,
              pending: returns.filter((r) => r.status === "PENDING").length,
              approved: returns.filter((r) => r.status === "APPROVED").length,
            },
            isLoading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load returns",
        }));
      }
    };

    fetchReturns();
  }, [state.page, state.size]);

  const handleApproveReturn = (returnId: string) => {
    Modal.confirm({
      title: "Approve Return",
      content: "Approve this return request?",
      okText: "Approve",
      onOk: async () => {
        try {
          message.success("Return approved");
          setState((prev) => ({
            ...prev,
            returns: prev.returns.map((r) =>
              r.id === returnId ? { ...r, status: "APPROVED" } : r
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to approve");
        }
      },
    });
  };

  const handleRejectReturn = (returnId: string) => {
    Modal.confirm({
      title: "Reject Return",
      content: "Reject this return request?",
      okText: "Reject",
      okType: "danger",
      onOk: async () => {
        try {
          message.success("Return rejected");
          setState((prev) => ({
            ...prev,
            returns: prev.returns.map((r) =>
              r.id === returnId ? { ...r, status: "REJECTED" } : r
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to reject");
        }
      },
    });
  };

  const columns = [
    { title: "Return ID", dataIndex: "id", key: "id" },
    { title: "Order ID", dataIndex: "orderId", key: "orderId" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "PENDING" ? "orange" : status === "APPROVED" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ReturnRequestSummary) =>
        record.status === "PENDING" && (
          <Space size="small">
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleApproveReturn(record.id)}
              size="small"
            >
              Approve
            </Button>
            <Button
              danger
              type="link"
              icon={<CloseOutlined />}
              onClick={() => handleRejectReturn(record.id)}
              size="small"
            >
              Reject
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Returns Moderation</h1>

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
            dataSource={state.returns.map((ret) => ({ ...ret, key: ret.id }))}
            pagination={false}
            loading={state.isLoading}
          />
          {state.returns.length === 0 && <Empty description="No returns to moderate" />}
        </Card>
      </div>
    </div>
  );
}
