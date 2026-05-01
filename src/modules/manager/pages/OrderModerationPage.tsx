/**
 * Order Moderation Page (Manager)
 * Review and moderate orders
 */

import { useState, useEffect } from "react";
import { Card, Button, Table, Spin, Empty, Tag, Modal, message, Space } from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { orderApi } from "@/modules/order/api/orderApi";
import type { OrderSummary } from "@/shared/contracts/orderContract";
import { useAuth } from "@/shared/context/AuthContext";

interface PageState {
  orders: OrderSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
  filters: {
    search: string;
    status: string;
  };
}

export default function OrderModerationPage() {
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({
    orders: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
    filters: { search: "", status: "" },
  });

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await orderApi.getOrders({
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            orders: response.data?.content || [],
            total: response.data?.totalElements || 0,
            isLoading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load orders",
        }));
      }
    };

    fetchOrders();
  }, [user, state.page, state.size]);

  const handleApproveOrder = (orderId: string) => {
    Modal.confirm({
      title: "Confirm Order",
      content: "Are you sure you want to confirm this order?",
      okText: "Confirm",
      onOk: async () => {
        try {
          message.success("Order confirmed");
          setState((prev) => ({
            ...prev,
            orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" } : o)),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to confirm order");
        }
      },
    });
  };

  const handleRejectOrder = (orderId: string) => {
    Modal.confirm({
      title: "Cancel Order",
      content: "Are you sure you want to cancel this order?",
      okText: "Cancel",
      okType: "danger",
      onOk: async () => {
        try {
          message.success("Order cancelled");
          setState((prev) => ({
            ...prev,
            orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to cancel order");
        }
      },
    });
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
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
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          PENDING: "orange",
          APPROVED: "green",
          REJECTED: "red",
          DELIVERED: "blue",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: OrderSummary) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
          >
            View
          </Button>
          {record.status === "PENDING" && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApproveOrder(record.id)}
                size="small"
              >
                Confirm
              </Button>
              <Button
                danger
                type="link"
                icon={<CloseOutlined />}
                onClick={() => handleRejectOrder(record.id)}
                size="small"
              >
                Cancel
              </Button>
            </>
          )}
        </Space>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Moderation</h1>

        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={state.orders.map((order) => ({ ...order, key: order.id }))}
            pagination={false}
            loading={state.isLoading}
          />
          {state.orders.length === 0 && <Empty description="No orders to moderate" />}
        </Card>
      </div>
    </div>
  );
}
