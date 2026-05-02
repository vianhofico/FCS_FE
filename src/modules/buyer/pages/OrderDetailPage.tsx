/**
 * Order Detail Page (Buyer)
 * View full order details, tracking, and payment status
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Divider,
  Steps,
  Table,
  Col,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { orderApi } from "@/modules/order/api/orderApi";
import { returnApi } from "@/modules/order/api/returnApi";
import type { OrderDetail, OrderItem } from "@/shared/contracts/orderContract";
import { useAuth } from "@/shared/context/AuthContext";
import TimelineWidget from "@/shared/components/TimelineWidget";
import { buildTrackingUrl } from "@/shared/integrations/shippingService";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Text, Paragraph } = Typography;

interface OrderDetailPageState {
  order: OrderDetail | null;
  isLoading: boolean;
  error: string | null;
  returnModalVisible: boolean;
  returnForm: {
    itemIds: string[];
    reason: string;
    description: string;
  };
  isSubmittingReturn: boolean;
  isConfirmingReceipt: boolean;
}

const RETURN_REASONS = [
  "Sản phẩm bị lỗi",
  "Sai kích cỡ",
  "Không đúng mô tả",
  "Đổi ý",
  "Bị hư hỏng khi vận chuyển",
  "Lý do khác",
];

const ORDER_STATUS_STEPS: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

/**
 * Order Detail Page component
 */
export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  useAuth();

  const [state, setState] = useState<OrderDetailPageState>({
    order: null,
    isLoading: true,
    error: null,
    returnModalVisible: false,
    returnForm: { itemIds: [], reason: "", description: "" },
    isSubmittingReturn: false,
    isConfirmingReceipt: false,
  });

  // Load order details
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await orderApi.getOrderDetail(orderId);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            order: response.data,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Không thể tải chi tiết đơn hàng";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const handleReturnClick = () => {
    setState((prev) => ({ ...prev, returnModalVisible: true }));
  };

  const handleReturnCancel = () => {
    setState((prev) => ({
      ...prev,
      returnModalVisible: false,
      returnForm: { itemIds: [], reason: "", description: "" },
    }));
  };

  const handleReturnSubmit = async () => {
    if (!state.returnForm.itemIds.length || !state.returnForm.reason) {
      message.error("Vui lòng chọn sản phẩm và lý do trả hàng");
      return;
    }

    try {
      setState((prev) => ({ ...prev, isSubmittingReturn: true }));

      const response = await returnApi.createReturn({
        orderId: orderId!,
        reason: state.returnForm.reason,
        evidenceUrls: [],
      });

      if (response.success) {
        message.success("Đã gửi yêu cầu trả hàng thành công");
        handleReturnCancel();
        // Reload order
        const orderResponse = await orderApi.getOrderDetail(orderId!);
        if (orderResponse.success) {
          setState((prev) => ({ ...prev, order: orderResponse.data || null }));
        }
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Gửi yêu cầu trả hàng thất bại");
    } finally {
      setState((prev) => ({ ...prev, isSubmittingReturn: false }));
    }
  };

  const handleCancelOrder = () => {
    Modal.confirm({
      title: "Hủy đơn hàng",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn hủy đơn hàng này không? Thao tác này không thể hoàn tác.",
      okText: "Đồng ý, Hủy đơn",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          const response = await orderApi.updateOrderStatus(orderId!, {
            status: "CANCELLED",
          });
          if (response.success) {
            message.success("Đã hủy đơn hàng thành công");
            const orderResponse = await orderApi.getOrderDetail(orderId!);
            if (orderResponse.success) {
              setState((prev) => ({ ...prev, order: orderResponse.data || null }));
            }
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Hủy đơn hàng thất bại");
        }
      },
    });
  };

  const handleConfirmReceipt = () => {
    Modal.confirm({
      title: "Xác nhận nhận hàng",
      icon: <CheckCircleOutlined />,
      content: "Bạn xác nhận đã nhận được đầy đủ sản phẩm? Thao tác này sẽ hoàn tất đơn hàng.",
      okText: "Xác nhận",
      okType: "primary",
      cancelText: "Quay lại",
      onOk: async () => {
        try {
          setState((prev) => ({ ...prev, isConfirmingReceipt: true }));
          const response = await orderApi.updateOrderStatus(orderId!, {
            status: "COMPLETED",
          });
          if (response.success) {
            message.success("Xác nhận nhận hàng thành công");
            const orderResponse = await orderApi.getOrderDetail(orderId!);
            if (orderResponse.success) {
              setState((prev) => ({ ...prev, order: orderResponse.data || null }));
            }
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Xác nhận thất bại");
        } finally {
          setState((prev) => ({ ...prev, isConfirmingReceipt: false }));
        }
      },
    });
  };

  if (!state.order) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/orders")}
          type="text"
          className="rounded-xl border-border/60 bg-white/50 text-slate-500 transition-soft hover:border-primary hover:text-primary px-4 py-2 h-auto"
        >
          Quay lại đơn hàng
        </Button>
        {state.error ? (
          <Card className="rounded-[2rem] border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
            <Paragraph className="!m-0 font-medium text-red-800 italic">{state.error}</Paragraph>
          </Card>
        ) : (
          <EmptyState
            title="Không tìm thấy đơn hàng"
            description="Thông tin đơn hàng có thể đã bị thay đổi hoặc không tồn tại."
          />
        )}
      </div>
    );
  }

  const order = state.order;
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Verified",
    SHIPPED: "Processing",
    DELIVERED: "Verified",
    COMPLETED: "Verified",
    CANCELLED: "Rejected",
    REFUNDED: "Inactive",
  };

  const itemColumns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sản phẩm</span>,
      key: "product",
      render: (_: unknown, record: OrderItem) => {
        const name = record.productName ?? record.productNameSnapshot ?? "Sản phẩm";
        return (
          <div className="flex items-center gap-4 py-2 group cursor-pointer" onClick={() => navigate(`/buyer/products/${record.productId}`)}>
            <div className="h-16 w-12 overflow-hidden rounded-lg bg-bg-secondary shadow-sm">
              {record.productImage ? (
                <img src={record.productImage} alt={name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-slate-300 italic">No Img</div>
              )}
            </div>
            <span className="font-bold text-slate-700 transition-soft group-hover:text-primary">{name}</span>
          </div>
        );
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số lượng</span>,
      key: "quantity",
      render: (_: unknown, record: OrderItem) => <span className="font-bold text-slate-500">x{record.quantity ?? 1}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đơn giá</span>,
      key: "price",
      render: (_: unknown, record: OrderItem) => {
        const price = record.unitPrice ?? record.priceAtPurchase ?? record.salePrice ?? 0;
        return <span className="font-medium text-slate-600">{price.toLocaleString()}₫</span>;
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thành tiền</span>,
      key: "subtotal",
      render: (_: unknown, record: OrderItem) => {
        const price = record.subtotal ?? record.totalPrice ?? (record.unitPrice ?? record.priceAtPurchase ?? record.salePrice ?? 0) * (record.quantity ?? 1);
        return <span className="font-bold text-primary">{price.toLocaleString()}₫</span>;
      },
    },
  ];

  const statusIndex = ORDER_STATUS_STEPS[order.status] || 0;
  const timelineItems = [
    {
      id: "created",
      title: "Đơn hàng được khởi tạo",
      description: `Mã đơn hàng: ${order.orderCode}`,
      createdAt: order.createdAt,
    },
    {
      id: "status",
      title: `Trạng thái: ${order.status}`,
      description: `Phương thức thanh toán: ${order.paymentMethod}`,
      createdAt: order.updatedAt,
    },
    ...(order.trackingNumber
      ? [
          {
            id: "tracking",
            title: "Đơn hàng đang được vận chuyển",
            description: `Đơn vị: ${order.shippingProvider}`,
            createdAt: order.updatedAt,
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/orders")}
          type="text"
          className="rounded-xl border-border/60 bg-white/50 text-slate-500 transition-soft hover:border-primary hover:text-primary px-4 py-2 h-auto"
        >
          Quay lại danh sách
        </Button>
        <Badge status={statusMap[order.status] || "Pending"}>{order.status}</Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Thông tin đơn hàng</Text>
          <div className="h-px flex-1 bg-pink-100/50" />
        </div>
        <Title className="!m-0 !font-display !text-4xl !font-bold uppercase tracking-tight text-text-dark">Mã: {order.orderCode}</Title>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Col span={24} className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm">
            <Steps
              current={statusIndex}
              className="luxury-steps"
              items={[
                { title: "Chờ duyệt", content: "Đã đặt hàng" },
                { title: "Xác nhận", content: "Đã thanh toán" },
                { title: "Giao hàng", content: "Đang vận chuyển" },
                { title: "Hoàn tất", content: "Đã nhận hàng" },
              ]}
            />
          </Card>

          <Card
            title={<span className="font-display text-lg font-bold uppercase tracking-widest text-text-dark">Sản phẩm đã chọn</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm"
          >
            <Table
              columns={itemColumns}
              dataSource={(order.items || []).map((item: OrderItem, index: number) => ({
                ...item,
                key: index,
              }))}
              pagination={false}
              className="luxury-table"
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card
              title={<span className="font-display text-base font-bold uppercase tracking-widest text-text-dark flex items-center gap-3"><CarOutlined className="text-primary/60" /> Thông tin nhận hàng</span>}
              className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm"
            >
              {order.shippingAddress ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Người nhận</div>
                    <div className="text-base font-bold text-slate-700">{order.shippingAddress.fullName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Địa chỉ</div>
                    <div className="text-sm font-medium text-slate-600">
                      {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số điện thoại</div>
                    <div className="text-sm font-bold text-primary tracking-wider">{order.shippingAddress.phone}</div>
                  </div>
                </div>
              ) : (
                <div className="italic text-slate-400">Không có thông tin địa chỉ.</div>
              )}
            </Card>

            <Card
              title={<span className="font-display text-base font-bold uppercase tracking-widest text-text-dark flex items-center gap-3"><CreditCardOutlined className="text-primary/60" /> Thanh toán & Vận chuyển</span>}
              className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm"
            >
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Phương thức thanh toán</div>
                  <Badge status="Verified">{order.paymentMethod}</Badge>
                </div>
                {order.trackingNumber && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Thông tin vận chuyển</div>
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-bold text-slate-700">{order.shippingProvider}</div>
                      <div className="font-mono text-xs text-primary">{order.trackingNumber}</div>
                      {buildTrackingUrl(order.shippingProvider, order.trackingNumber) && (
                        <Button
                          type="primary"
                          size="small"
                          className="mt-2 h-9 rounded-xl text-[10px] font-bold"
                          onClick={() => window.open(buildTrackingUrl(order.shippingProvider, order.trackingNumber) || "", "_blank")}
                        >
                          THEO DÕI HÀNH TRÌNH
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Col>

        <Col span={24} className="lg:col-span-1 space-y-8">
          <div className="sticky top-32 space-y-8">
            <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-luxury">
              <TimelineWidget items={timelineItems} title="Hành trình đơn hàng" />
            </Card>

            <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-slate-500 font-medium">
                  <span>Tạm tính:</span>
                  <span>{order.subTotal.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 font-medium">
                  <span>Phí vận chuyển:</span>
                  <span>{order.shippingFee.toLocaleString()}₫</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-500 font-bold">
                    <span>Giảm giá:</span>
                    <span>-{order.discountAmount.toLocaleString()}₫</span>
                  </div>
                )}
                <Divider className="my-4 border-pink-100/50" />
                <div className="flex justify-between items-end">
                  <span className="font-display text-lg font-black uppercase tracking-tight text-slate-800">Tổng cộng</span>
                  <span className="font-display text-2xl font-black text-primary tracking-tight">{order.totalAmount.toLocaleString()}₫</span>
                </div>

                <div className="pt-8 space-y-3">
                  {order.status === "PENDING" && (
                    <Button danger block size="large" onClick={handleCancelOrder} className="h-12 rounded-xl font-bold border-red-100 text-red-500">
                      HỦY ĐƠN HÀNG
                    </Button>
                  )}

                  {order.status === "DELIVERED" && (
                    <Button type="primary" block size="large" icon={<CheckCircleOutlined />} loading={state.isConfirmingReceipt} onClick={handleConfirmReceipt} className="h-14 rounded-2xl font-black shadow-luxury">
                      ĐÃ NHẬN ĐƯỢC HÀNG
                    </Button>
                  )}

                  {order.status === "COMPLETED" && (
                    <Button type="primary" block size="large" icon={<ShoppingOutlined />} onClick={() => order.items?.[0] && navigate(`/buyer/products/${order.items[0].productId}/review`)} className="h-14 rounded-2xl font-black shadow-luxury">
                      VIẾT ĐÁNH GIÁ
                    </Button>
                  )}

                  {(order.status === "DELIVERED" || order.status === "SHIPPED") && (
                    <Button danger block type="text" icon={<UndoOutlined />} onClick={handleReturnClick} className="font-bold text-red-400 hover:text-red-500">
                      Yêu cầu trả hàng/hoàn tiền
                    </Button>
                  )}

                  <Button icon={<DownloadOutlined />} block type="text" className="font-bold text-slate-400 hover:text-primary">
                    Tải hóa đơn (PDF)
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </div>

      <Modal
        title={<Title level={4} className="!m-0 !font-display uppercase tracking-tight">Yêu cầu trả hàng</Title>}
        open={state.returnModalVisible}
        onCancel={handleReturnCancel}
        footer={null}
        className="luxury-modal"
        centered
      >
        <Form layout="vertical" className="mt-6" size="large">
          <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Sản phẩm cần trả</span>} required>
            <Select
              mode="multiple"
              placeholder="Chọn sản phẩm"
              className="luxury-select w-full"
              value={state.returnForm.itemIds}
              onChange={(value) => setState((prev) => ({ ...prev, returnForm: { ...prev.returnForm, itemIds: value } }))}
              options={(order.items || []).map((item: OrderItem) => ({ label: item.productName, value: item.id }))}
            />
          </Form.Item>

          <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Lý do trả hàng</span>} required>
            <Select
              placeholder="Chọn lý do"
              className="luxury-select w-full"
              value={state.returnForm.reason}
              onChange={(value) => setState((prev) => ({ ...prev, returnForm: { ...prev.returnForm, reason: value } }))}
              options={RETURN_REASONS.map((reason) => ({ label: reason, value: reason }))}
            />
          </Form.Item>

          <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Mô tả chi tiết</span>}>
            <Input.TextArea
              placeholder="Vui lòng cung cấp thêm thông tin về tình trạng sản phẩm..."
              className="rounded-2xl border-pink-100 p-4"
              value={state.returnForm.description}
              onChange={(e) => setState((prev) => ({ ...prev, returnForm: { ...prev.returnForm, description: e.target.value } }))}
              rows={4}
            />
          </Form.Item>

          <div className="mt-10 flex gap-4">
            <Button block onClick={handleReturnCancel}>BỎ QUA</Button>
            <Button type="primary" block loading={state.isSubmittingReturn} onClick={handleReturnSubmit}>GỬI YÊU CẦU</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
