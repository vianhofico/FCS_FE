/**
 * Order History Page (Buyer)
 * View all orders with filtering
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Space, Spin, Empty, Table, Tag, Pagination, Select } from "antd";
import { EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { orderApi } from "@/modules/order/api/orderApi";
import type { OrderSummary } from "@/shared/contracts/orderContract";
import type { OrderStatus } from "@/shared/contracts/commonContract";
import { useAuth } from "@/shared/context/AuthContext";

interface OrderHistoryPageState {
  orders: OrderSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  totalElements: number;
  statusFilter: string;
}

/**
 * Order History Page component
 */
export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<OrderHistoryPageState>({
    orders: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    totalElements: 0,
    statusFilter: "",
  });

  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await orderApi.getOrders({
          buyerId: user.id,
          status: state.statusFilter ? (state.statusFilter as OrderStatus) : undefined,
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            orders: response.data.content,
            totalElements: response.data.totalElements,
            isLoading: false,
          }));
        }
      } catch {
        const errorMsg = "Failed to load orders";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchOrders();
  }, [state.page, state.size, state.statusFilter, user]);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      PENDING: "blue",
      CONFIRMED: "blue",
      SHIPPED: "cyan",
      DELIVERED: "green",
      CANCELLED: "red",
      REFUNDED: "orange",
    };
    return colorMap[status] || "default";
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => <span className="font-medium">{id.slice(0, 8)}</span>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Items",
      dataIndex: "itemCount",
      key: "items",
      render: (count: number) => `${count} item${count > 1 ? "s" : ""}`,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "total",
      render: (amount: number) => `$${amount.toLocaleString()}`,
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
      title: "Action",
      key: "action",
      render: (_: unknown, record: OrderSummary) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/buyer/orders/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  if (state.isLoading && state.orders.length === 0) {
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
            onClick={() => navigate("/buyer/products")}
            className="mb-4"
          >
            Back to Products
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">Order History</h1>
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
              placeholder="All orders"
              style={{ width: 200 }}
              allowClear
              options={[
                { label: "All Orders", value: "" },
                { label: "Pending", value: "PENDING" },
                { label: "Confirmed", value: "CONFIRMED" },
                { label: "Shipped", value: "SHIPPED" },
                { label: "Delivered", value: "DELIVERED" },
                { label: "Cancelled", value: "CANCELLED" },
              ]}
            />
          </Space>
        </Card>

        {/* Orders Table */}
        <Card className="shadow-sm">
          {state.orders.length > 0 ? (
            <>
              <Spin spinning={state.isLoading}>
                <Table
                  columns={columns}
                  dataSource={state.orders.map((order) => ({ ...order, key: order.id }))}
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
            <Empty description="No orders found" />
          )}
        </Card>
      </div>
    </div>
  );
}
