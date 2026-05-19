import { CheckCircleOutlined, ClockCircleOutlined, CreditCardOutlined, ReloadOutlined } from "@ant-design/icons";
import { App, Card, Col, Divider, QRCode, Result, Row, Spin, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { orderApi } from "@/modules/order/api/orderApi";
import { paymentApi } from "@/modules/order/api/paymentApi";
import type { ApiError } from "@/shared/api/http";
import { OrderStatus } from "@/shared/contracts/commonContract";
import type { OrderDetail } from "@/shared/contracts/orderContract";
import type { PaymentQrSession, PaymentStatus } from "@/shared/contracts/paymentContract";
import { Button, EmptyState } from "@/shared/ui";

const { Title, Text, Paragraph } = Typography;

interface PaymentQrPageState {
  order: OrderDetail | null;
  session: PaymentQrSession | null;
  status: PaymentStatus | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  redirectCountdown: number | null;
}

export default function PaymentQrPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [state, setState] = useState<PaymentQrPageState>({
    order: null,
    session: null,
    status: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    redirectCountdown: null,
  });

  const qrValue = useMemo(() => {
    return state.session?.qrCode || state.status?.qrCode || state.session?.checkoutUrl || state.status?.checkoutUrl || "";
  }, [state.session, state.status]);

  const paid = state.status?.paid || state.order?.status === OrderStatus.PAID;

  const refreshStatus = async (silent = false) => {
    if (!orderId) return;
    try {
      if (!silent) setState((prev) => ({ ...prev, isRefreshing: true }));
      const [orderResponse, statusResponse] = await Promise.all([
        orderApi.getOrderDetail(orderId),
        paymentApi.getPaymentStatus(orderId),
      ]);

      setState((prev) => ({
        ...prev,
        order: orderResponse.data,
        status: statusResponse.data,
        isRefreshing: false,
        redirectCountdown: statusResponse.data.paid && prev.redirectCountdown === null ? 5 : prev.redirectCountdown,
      }));
    } catch {
      if (!silent) message.error("Không thể cập nhật trạng thái thanh toán");
      setState((prev) => ({ ...prev, isRefreshing: false }));
    }
  };

  useEffect(() => {
    const loadPayment = async () => {
      if (!orderId) return;
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const orderResponse = await orderApi.getOrderDetail(orderId);
        const order = orderResponse.data;

        if (order.status === OrderStatus.PAID) {
          setState((prev) => ({ ...prev, order, isLoading: false, redirectCountdown: 5 }));
          return;
        }

        if (order.status !== OrderStatus.PENDING_PAYMENT) {
          setState((prev) => ({ ...prev, order, isLoading: false }));
          return;
        }

        const sessionResponse = await paymentApi.createOnlinePayment(orderId);
        setState((prev) => ({
          ...prev,
          order,
          session: sessionResponse.data,
          status: {
            orderId: sessionResponse.data.orderId,
            orderCode: sessionResponse.data.orderCode,
            orderStatus: sessionResponse.data.orderStatus,
            paymentStatus: sessionResponse.data.paymentStatus,
            paid: sessionResponse.data.orderStatus === OrderStatus.PAID,
            amount: sessionResponse.data.amount,
            expiresAt: sessionResponse.data.expiresAt,
            checkoutUrl: sessionResponse.data.checkoutUrl,
            qrCode: sessionResponse.data.qrCode,
          },
          isLoading: false,
        }));
      } catch (error) {
        const apiError = error as Partial<ApiError>;
        const errorMsg = apiError.message || "Không thể tạo phiên thanh toán online";
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
      }
    };

    void loadPayment();
  }, [orderId]);

  useEffect(() => {
    if (!orderId || paid || state.order?.status !== OrderStatus.PENDING_PAYMENT) return;
    const timer = window.setInterval(() => void refreshStatus(true), 5000);
    return () => window.clearInterval(timer);
  }, [orderId, paid, state.order?.status]);

  useEffect(() => {
    if (state.redirectCountdown === null) return;
    if (state.redirectCountdown <= 0) {
      navigate(`/buyer/orders/${orderId}`);
      return;
    }
    const timer = window.setTimeout(() => {
      setState((prev) => ({ ...prev, redirectCountdown: prev.redirectCountdown === null ? null : prev.redirectCountdown - 1 }));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [navigate, orderId, state.redirectCountdown]);

  if (state.isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Spin size="large" /></div>;
  }

  if (state.error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <EmptyState title="Không thể tạo thanh toán" description={state.error} action={<Button onClick={() => navigate(-1)}>Quay lại</Button>} />
      </div>
    );
  }

  if (!state.order) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <EmptyState title="Không tìm thấy đơn hàng" description="Đơn hàng không tồn tại hoặc bạn không có quyền truy cập." />
      </div>
    );
  }

  if (paid) {
    return (
      <Result
        status="success"
        icon={<CheckCircleOutlined className="text-emerald-500" />}
        title="Thanh toán thành công"
        subTitle={`Đơn hàng ${state.order.orderCode} đã được xác nhận. Tự chuyển đến chi tiết đơn hàng sau ${state.redirectCountdown ?? 0} giây.`}
        extra={[
          <Button key="detail" type="primary" onClick={() => navigate(`/buyer/orders/${orderId}`)}>Xem đơn hàng</Button>,
          <Button key="products" onClick={() => navigate("/buyer/products")}>Tiếp tục mua sắm</Button>,
        ]}
      />
    );
  }

  const expiresAt = state.session?.expiresAt || state.status?.expiresAt;
  const checkoutUrl = state.session?.checkoutUrl || state.status?.checkoutUrl;

  return (
    <div className="mx-auto max-w-[1180px] space-y-10 pb-20">
      <div className="space-y-3">
        <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Thanh toán Online</Text>
        <Title className="!m-0 !font-display !text-4xl !font-black uppercase tracking-tight text-text-dark">Quét mã QR để thanh toán</Title>
        <Paragraph className="text-slate-500">Hoàn tất thanh toán cho đơn hàng {state.order.orderCode}. Trang sẽ tự cập nhật sau khi giao dịch được xác nhận.</Paragraph>
      </div>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={14}>
          <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 text-center shadow-luxury">
            <div className="mx-auto flex max-w-[360px] flex-col items-center gap-6">
              <div className="rounded-[2rem] border border-pink-100 bg-white p-5 shadow-sm">
                {qrValue ? <QRCode value={qrValue} size={280} bordered={false} /> : <Spin />}
              </div>
              <div>
                <Title level={3} className="!m-0 !font-display !text-primary">{state.order.totalAmount.toLocaleString()}₫</Title>
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-400">Nội dung: {state.order.orderCode}</Text>
              </div>
              {checkoutUrl && (
                <Button type="primary" size="large" className="h-12 rounded-2xl px-10 font-bold" onClick={() => window.open(checkoutUrl, "_blank", "noopener,noreferrer")}>
                  Mở trang thanh toán
                </Button>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <CreditCardOutlined className="text-2xl text-primary" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Mã đơn hàng</div>
                  <div className="font-display text-xl font-black text-slate-800">{state.order.orderCode}</div>
                </div>
              </div>

              <Divider className="border-pink-100/60" />

              <div className="space-y-3">
                <div className="flex justify-between gap-4 text-sm text-slate-500"><span>Tạm tính</span><b>{state.order.subTotal.toLocaleString()}₫</b></div>
                <div className="flex justify-between gap-4 text-sm text-slate-500"><span>Phí vận chuyển</span><b>{state.order.shippingFee.toLocaleString()}₫</b></div>
                <div className="flex justify-between gap-4 text-lg text-slate-800"><span className="font-black">Tổng thanh toán</span><b className="text-primary">{state.order.totalAmount.toLocaleString()}₫</b></div>
              </div>

              {expiresAt && (
                <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-700">
                  <ClockCircleOutlined />
                  <span className="text-xs font-bold uppercase tracking-widest">Hạn thanh toán: {new Date(expiresAt).toLocaleString()}</span>
                </div>
              )}

              <Button block size="large" icon={<ReloadOutlined />} loading={state.isRefreshing} onClick={() => refreshStatus()} className="h-12 rounded-2xl font-bold">
                Tôi đã thanh toán
              </Button>
              <Button block type="text" onClick={() => navigate(`/buyer/orders/${orderId}`)} className="font-bold text-primary">
                Xem chi tiết đơn hàng
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
