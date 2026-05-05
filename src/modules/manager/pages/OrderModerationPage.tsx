/**
 * Order Moderation Page (Manager)
 * Review and moderate orders
 */

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  Card,
  Input,
  message,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { orderApi } from "@/modules/order/api/orderApi";
import { useAuth } from "@/shared/context/AuthContext";
import type { OrderSummary } from "@/shared/contracts/orderContract";
import type { OrderStatus } from "@/shared/contracts/commonContract";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "Pending",
  PAID: "Processing",
  CONFIRMED: "Processing",
  PACKING: "Processing",
  SHIPPED: "Processing",
  DELIVERED: "Verified",
  COMPLETED: "Verified",
  CANCELLED: "Rejected",
  REFUNDED: "Inactive",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  CONFIRMED: "Đã xác nhận",
  PACKING: "Đang đóng gói",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

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
  const navigate = useNavigate();
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
          orderCode: state.filters.search.trim() || undefined,
          status: (state.filters.status || undefined) as OrderStatus | undefined,
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
          error: err instanceof Error ? err.message : "Không thể tải danh sách đơn hàng",
        }));
      }
    };
    fetchOrders();
  }, [user, state.page, state.size, state.filters.search, state.filters.status]);

  const handleApproveOrder = (orderId: string) => {
    Modal.confirm({
      title: <span className="font-display text-xl font-black uppercase">Xác nhận đơn hàng</span>,
      content: "Bạn có chắc chắn muốn phê duyệt đơn hàng này không?",
      centered: true,
      okText: "Phê duyệt",
      cancelText: "Hủy",
      className: "luxury-modal",
      onOk: async () => {
        message.success("Đã phê duyệt đơn hàng thành công");
        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" } : o)),
        }));
      },
    });
  };

  const handleRejectOrder = (orderId: string) => {
    Modal.confirm({
      title: <span className="font-display text-xl font-black uppercase text-rose-500">Hủy đơn hàng</span>,
      content: "Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn hủy?",
      okType: "danger",
      centered: true,
      okText: "Hủy đơn",
      cancelText: "Quay lại",
      onOk: async () => {
        message.info("Đã hủy đơn hàng");
        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o)),
        }));
      },
    });
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã đơn hàng</span>,
      dataIndex: "id",
      key: "id",
      render: (id: string) => <span className="font-mono text-xs font-bold text-slate-800">#{id.slice(-8).toUpperCase()}</span>,
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
      render: (status: string) => (
        <Badge status={ORDER_STATUS_BADGE[status] || "Pending"}>{ORDER_STATUS_LABELS[status] || status}</Badge>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      fixed: "right" as const,
      width: 220,
      render: (_: any, record: OrderSummary) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} className="text-slate-400 hover:!text-primary" onClick={() => navigate(`/manager/orders/${record.id}`)} />
          {record.status === "PENDING_PAYMENT" && (
            <>
              <Button type="text" icon={<CheckCircleOutlined />} className="text-emerald-500 hover:!bg-emerald-50 rounded-xl font-bold" onClick={() => handleApproveOrder(record.id)}>Duyệt</Button>
              <Button type="text" danger icon={<CloseCircleOutlined />} className="hover:!bg-rose-50 rounded-xl font-bold" onClick={() => handleRejectOrder(record.id)}>Hủy</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Điều phối đơn hàng</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">Kiểm duyệt và xử lý các giao dịch trên hệ thống để đảm bảo tính minh bạch và an toàn.</Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <ShoppingOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quản lý giao dịch</div>
            <div className="font-display text-2xl font-bold text-slate-800">{state.total} Đơn hàng</div>
          </div>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm theo mã đơn hàng..."
            value={state.filters.search}
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                page: 0,
                filters: { ...prev.filters, search: event.target.value },
              }))
            }
            className="h-12 w-full md:w-80 rounded-2xl border-slate-100 bg-slate-50/50 font-medium"
          />
          <Select
            placeholder="Lọc trạng thái"
            value={state.filters.status}
            onChange={(status) =>
              setState((prev) => ({
                ...prev,
                page: 0,
                filters: { ...prev.filters, status },
              }))
            }
            className="h-12 min-w-[200px] luxury-select"
            options={[
              { label: "Tất cả", value: "" },
              { label: "Chờ thanh toán", value: "PENDING_PAYMENT" },
              { label: "Đã thanh toán", value: "PAID" },
              { label: "Đã xác nhận", value: "CONFIRMED" },
              { label: "Đang đóng gói", value: "PACKING" },
              { label: "Đang giao", value: "SHIPPED" },
              { label: "Đã giao", value: "DELIVERED" },
              { label: "Hoàn tất", value: "COMPLETED" },
              { label: "Đã hủy", value: "CANCELLED" },
              { label: "Đã hoàn tiền", value: "REFUNDED" },
            ]}
          />
        </div>

        <Spin spinning={state.isLoading && state.orders.length === 0}>
          <Table columns={columns} dataSource={state.orders.map(o => ({ ...o, key: o.id }))} pagination={false} scroll={{ x: 780 }} className="luxury-table" />

          {state.total > state.size && (
            <div className="mt-10 flex justify-center">
              <Pagination
                current={state.page + 1}
                pageSize={state.size}
                total={state.total}
                onChange={(p) => setState(prev => ({ ...prev, page: p - 1 }))}
                showSizeChanger={false}
                className="luxury-pagination"
              />
            </div>
          )}

          {state.orders.length === 0 && !state.isLoading && (
            <div className="py-20 text-center">
              <EmptyState title="Không có đơn hàng" description="Hiện tại không có đơn hàng nào cần xử lý hoặc phù hợp với bộ lọc." />
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
}

