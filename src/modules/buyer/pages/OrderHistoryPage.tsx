/**
 * Order History Page (Buyer)
 * View all orders with filtering
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spin, Table, Pagination, Select, Typography } from "antd";
import { EyeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { orderApi } from "@/modules/order/api/orderApi";
import type { OrderSummary } from "@/shared/contracts/orderContract";
import type { OrderStatus } from "@/shared/contracts/commonContract";
import { useAuth } from "@/shared/context/AuthContext";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

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

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã đơn hàng</span>,
      dataIndex: "id",
      key: "id",
      render: (id: string) => <span className="font-mono text-xs font-bold text-slate-400">#{id.slice(-8).toUpperCase()}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày đặt</span>,
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{new Date(date).toLocaleDateString()}</span>
          <span className="text-[10px] text-slate-400">{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sản phẩm</span>,
      dataIndex: "itemCount",
      key: "items",
      render: (count: number) => <span className="font-bold text-slate-600">{count} món</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng thanh toán</span>,
      dataIndex: "totalAmount",
      key: "total",
      render: (amount: number) => <span className="font-display text-lg font-bold text-primary">{amount.toLocaleString()}₫</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          PENDING: "Pending",
          CONFIRMED: "Verified",
          SHIPPED: "Processing",
          DELIVERED: "Verified",
          CANCELLED: "Rejected",
          REFUNDED: "Inactive",
        };
        return <Badge status={statusMap[status] || "Pending"}>{status}</Badge>;
      },
    },
    {
      title: "",
      key: "action",
      align: "right" as const,
      render: (_: unknown, record: OrderSummary) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/buyer/orders/${record.id}`)}
          className="rounded-xl bg-pink-50 font-bold text-primary hover:!bg-primary hover:!text-white border-none h-10 px-4 flex items-center justify-center"
        >
          Chi tiết
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
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Lịch sử đơn hàng</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Theo dõi hành trình của những món đồ thời trang bạn đã chọn từ Re:Wear.
          </Paragraph>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/products")}
          className="rounded-xl border-pink-100 text-primary font-bold hover:border-primary h-12 px-6"
        >
          QUAY LẠI CỬA HÀNG
        </Button>
      </div>

      {state.error && (
        <Card className="rounded-[2rem] border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
          <Paragraph className="!m-0 font-medium text-red-800 italic">{state.error}</Paragraph>
        </Card>
      )}

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Lọc trạng thái:</span>
            <Select
              value={state.statusFilter}
              onChange={(value) => setState((prev) => ({ ...prev, statusFilter: value, page: 0 }))}
              placeholder="Tất cả đơn hàng"
              className="h-11 min-w-[200px]"
              allowClear
              options={[
                { label: "Tất cả", value: "" },
                { label: "Đang chờ", value: "PENDING" },
                { label: "Đã xác nhận", value: "CONFIRMED" },
                { label: "Đang giao", value: "SHIPPED" },
                { label: "Đã giao", value: "DELIVERED" },
                { label: "Đã hủy", value: "CANCELLED" },
              ]}
            />
          </div>
        </div>

        {state.orders.length > 0 ? (
          <>
            <Spin spinning={state.isLoading}>
              <Table
                columns={columns}
                dataSource={state.orders.map((order) => ({ ...order, key: order.id }))}
                pagination={false}
                className="luxury-table"
              />
            </Spin>

            <div className="mt-10 flex justify-center">
              <Pagination
                current={state.page + 1}
                pageSize={state.size}
                total={state.totalElements}
                onChange={(newPage) =>
                  setState((prev) => ({ ...prev, page: newPage - 1 }))
                }
                showSizeChanger={false}
                className="luxury-pagination"
              />
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <EmptyState
              title="Chưa có đơn hàng nào"
              description="Hãy khám phá bộ sưu tập mới nhất và bắt đầu hành trình phong cách của bạn."
              action={
                <Button type="primary" onClick={() => navigate("/buyer/products")}>
                  Khám phá ngay
                </Button>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
