/**
 * My Returns Page (Buyer)
 * View all return requests
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Space, Spin, Empty, Table, Tag, Pagination, Select } from "antd";
import { EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { returnApi } from "@/modules/order/api/returnApi";
import type { ReturnRequestSummary } from "@/shared/contracts/returnContract";
import { useAuth } from "@/shared/context/AuthContext";

interface MyReturnsPageState {
  returns: ReturnRequestSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  totalElements: number;
  statusFilter: string;
}

/**
 * My Returns Page component
 */
export default function MyReturnsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<MyReturnsPageState>({
    returns: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    totalElements: 0,
    statusFilter: "",
  });

  // Load returns
  useEffect(() => {
    const fetchReturns = async () => {
      if (!user) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await returnApi.getReturns({
          requestedById: user.id,
          status: state.statusFilter as any || undefined,
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            returns: response.data.content,
            totalElements: response.data.totalElements,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load returns";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchReturns();
  }, [state.page, state.statusFilter, user]);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      PENDING: "orange",
      APPROVED: "blue",
      REJECTED: "red",
      COMPLETED: "green",
      REFUNDED: "green",
    };
    return colorMap[status] || "default";
  };

  const columns = [
    {
      title: "Return ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => <span className="font-medium">{id.slice(0, 8)}</span>,
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId: string) => orderId.slice(0, 8),
    },
    {
      title: "Items",
      dataIndex: "itemCount",
      key: "items",
      render: (count: number) => `${count} item${count > 1 ? "s" : ""}`,
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
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: ReturnRequestSummary) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/buyer/returns/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (state.isLoading && state.returns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/buyer/orders")}
            className="mb-4"
          >
            Back to Orders
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">My Returns</h1>
        </div>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <Space>
            <label className="text-sm font-medium">Filter by Status:</label>
            <Select
              value={state.statusFilter}
              onChange={(value) => setState((prev) => ({ ...prev, statusFilter: value, page: 0 }))}
              placeholder="All returns"
              style={{ width: 200 }}
              allowClear
              options={[
                { label: "All Returns", value: "" },
                { label: "Pending", value: "PENDING" },
                { label: "Approved", value: "APPROVED" },
                { label: "Rejected", value: "REJECTED" },
                { label: "Completed", value: "COMPLETED" },
                { label: "Refunded", value: "REFUNDED" },
              ]}
            />
          </Space>
        </Card>

        {/* Returns Table */}
        <Card className="shadow-sm">
          {state.returns.length > 0 ? (
            <>
              <Spin spinning={state.isLoading}>
                <Table
                  columns={columns}
                  dataSource={state.returns.map((ret) => ({ ...ret, key: ret.id }))}
                  pagination={false}
                  rowKey="id"
                />
              </Spin>

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <Pagination
                  current={state.page + 1}
                  pageSize={state.size}
                  total={state.totalElements}
                  onChange={(newPage) =>
                    setState((prev) => ({ ...prev, page: newPage - 1 }))
                  }
                  showSizeChanger={false}
                />
              </div>
            </>
          ) : (
            <Empty description="No returns found" />
          )}
        </Card>
      </div>
    </div>
  );
}
