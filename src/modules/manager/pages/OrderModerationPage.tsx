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
  InboxOutlined,
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
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { orderApi } from "@/modules/order/api/orderApi";
import { useAuth } from "@/shared/context/AuthContext";
import type { OrderSummary } from "@/shared/contracts/orderContract";
import { OrderStatus } from "@/shared/contracts/commonContract";
import { Badge, Button, EmptyState } from "@/shared/ui";
import { formatPaymentMethod } from "@/shared/utils/formatters";

const { Title, Paragraph } = Typography;

const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING_PAYMENT: "Pending",
  PAID: "Processing",
  CONFIRMED: "Processing",
  PACKING: "Processing",
  READY_FOR_PICKUP: "Verified",
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
  READY_FOR_PICKUP: "Sẵn sàng lấy hàng",
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

  const updateOrderStatus = async (orderId: string, status: string, successMsg: string) => {
    try {
      const response = await orderApi.updateOrderStatus(orderId, { status: status as OrderStatus });
      if (response.success) {
        message.success(successMsg);
        setState((prev) => ({
          ...prev,
          orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: status as OrderStatus } : o)),
        }));
      } else {
        message.error(response.message || "Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Cập nhật trạng thái thất bại");
    }
  };

  const handleApproveOrder = (orderId: string) => {
    Modal.confirm({
      title: <span className="font-display text-xl font-black uppercase">Xác nhận đơn hàng</span>,
      content: "Bạn có chắc chắn muốn phê duyệt đơn hàng này không?",
      centered: true,
      okText: "Phê duyệt",
      cancelText: "Hủy",
      className: "luxury-modal",
      onOk: () => updateOrderStatus(orderId, OrderStatus.CONFIRMED, "Đã phê duyệt đơn hàng thành công"),
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
      onOk: () => updateOrderStatus(orderId, OrderStatus.CANCELLED, "Đã hủy đơn hàng"),
    });
  };

  const handleStartPacking = (orderId: string) => {
    Modal.confirm({
      title: <span className="font-display text-xl font-black uppercase">Bắt đầu đóng gói</span>,
      content: "Xác nhận bắt đầu đóng gói đơn hàng này?",
      centered: true,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => updateOrderStatus(orderId, OrderStatus.PACKING, "Đã chuyển sang trạng thái đóng gói"),
    });
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã đơn hàng</span>,
      key: "orderCode",
      render: (_: any, record: OrderSummary) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs font-bold text-slate-800">
            {record.orderCode || `#${record.id.slice(-8).toUpperCase()}`}
          </span>
          {record.createdAt && (
            <span className="text-[11px] text-slate-400">
              {new Date(record.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          )}
        </div>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sản phẩm</span>,
      key: "items",
      render: (_: any, record: OrderSummary) => {
        const count = record.itemCount ?? record.items?.length ?? 0;
        return (
          <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {count} sản phẩm
          </span>
        );
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thanh toán</span>,
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => (
        <span className="text-xs font-medium text-slate-600">{formatPaymentMethod(method)}</span>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng tiền</span>,
      dataIndex: "totalAmount",
      key: "total",
      render: (amount: number) => (
        <span className="font-display text-base font-bold text-primary">{amount.toLocaleString()}₫</span>
      ),
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
      width: 130,
      render: (_: any, record: OrderSummary) => (
        <Space size={4}>
          {(record.status === "PENDING_PAYMENT" || record.status === "PAID") && (
            <>
              <Tooltip title="Duyệt đơn">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  className="!text-emerald-500 hover:!bg-emerald-50"
                  onClick={() => handleApproveOrder(record.id)}
                />
              </Tooltip>
              <Tooltip title="Hủy đơn">
                <Button
                  type="text"
                  danger
                  icon={<CloseCircleOutlined />}
                  className="hover:!bg-rose-50"
                  onClick={() => handleRejectOrder(record.id)}
                />
              </Tooltip>
            </>
          )}
          {record.status === "CONFIRMED" && (
            <Tooltip title="Bắt đầu đóng gói">
              <Button
                type="text"
                icon={<InboxOutlined />}
                className="!text-blue-500 hover:!bg-blue-50"
                onClick={() => handleStartPacking(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} className="text-slate-400 hover:!text-primary" onClick={() => navigate(`/manager/orders/${record.id}`)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-14 pb-28">
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
              { label: "Sẵn sàng lấy hàng", value: "READY_FOR_PICKUP" },
              { label: "Đang giao", value: "SHIPPED" },
              { label: "Đã giao", value: "DELIVERED" },
              { label: "Hoàn tất", value: "COMPLETED" },
              { label: "Đã hủy", value: "CANCELLED" },
              { label: "Đã hoàn tiền", value: "REFUNDED" },
            ]}
          />
        </div>

        <Spin spinning={state.isLoading && state.orders.length === 0}>
          <Table columns={columns} dataSource={state.orders.map(o => ({ ...o, key: o.id }))} pagination={false} scroll={{ x: 1000 }} className="luxury-table" />

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

