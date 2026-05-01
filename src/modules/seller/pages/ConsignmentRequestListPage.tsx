/**
 * Consignment Request List Page (Seller)
 * View all consignment requests with status filtering
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Table, Spin, Empty, Pagination, Tag } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import type { ConsignmentRequestSummary } from "@/shared/contracts/consignmentContract";
import { useAuth } from "@/shared/context/AuthContext";

interface PageState {
  requests: ConsignmentRequestSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
}

export default function ConsignmentRequestListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({
    requests: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await consignmentApi.getConsignmentRequests({
          consignorId: user.id,
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            requests: response.data?.content || [],
            total: response.data?.totalElements || 0,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load requests";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchRequests();
  }, [user, state.page, state.size]);

  if (state.isLoading && state.requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: "Request ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          PENDING: "blue",
          ACCEPTED: "green",
          REJECTED: "red",
          CANCELLED: "orange",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ConsignmentRequestSummary) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/seller/consignments/${record.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Consignment Requests</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/seller/consignments/new")}
          >
            New Request
          </Button>
        </div>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={state.requests.map((req) => ({ ...req, key: req.id }))}
            pagination={false}
            loading={state.isLoading}
          />

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <Pagination
              current={state.page + 1}
              pageSize={state.size}
              total={state.total}
              onChange={(page) => setState((prev) => ({ ...prev, page: page - 1 }))}
            />
          </div>

          {/* Empty */}
          {state.requests.length === 0 && !state.isLoading && (
            <Empty
              description="No consignment requests found"
              style={{ marginTop: 24 }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
