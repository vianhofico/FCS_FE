/**
 * Checkout Page (Buyer)
 * Review cart, select shipping address, and create order
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  App,
  Card,
  Spin,
  Form,
  Input,
  Select,
  Radio,
  Divider,
  Table,
  Modal,
  Row,
  Col,
  Typography,
} from "antd";
import { ArrowLeftOutlined, HomeOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { iamApi } from "@/modules/iam/api/iamApi";
import { orderApi } from "@/modules/order/api/orderApi";
import { paymentApi } from "@/modules/order/api/paymentApi";
import { productApi } from "@/modules/product/api/productApi";
import type { CartItem, OrderCreateRequest } from "@/shared/contracts/orderContract";
import type { IamAddress, IamAddressRequest } from "@/shared/contracts/iamContract";
import type { PaymentMethod } from "@/shared/contracts/commonContract";
import { AddressType, PaymentMethod as PaymentMethodEnum, ProductStatus as ProductStatusEnum } from "@/shared/contracts/commonContract";
import { useAuth } from "@/shared/context/AuthContext";
import { isOnlinePayment } from "@/shared/integrations/paymentGateway";
import { getShippingOptions, type ShippingOption } from "@/shared/integrations/shippingService";
import { Button } from "@/shared/ui";

const { Title, Text, Paragraph } = Typography;

interface CheckoutPageState {
  cartItems: CartItem[];
  addresses: IamAddress[];
  selectedAddressId: string | null;
  selectedShippingOptionId: string | null;
  shippingOptions: ShippingOption[];
  paymentMethod: PaymentMethod;
  isLoading: boolean;
  isCreatingOrder: boolean;
  error: string | null;
  showAddressModal: boolean;
  newAddress: IamAddressRequest;
}

/**
 * Checkout Page component
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm<IamAddressRequest>();
  const checkoutMode = searchParams.get("mode") || "cart";
  const buyNowProductId = searchParams.get("productId");
  const buyNowQuantity = Math.max(Number(searchParams.get("quantity") || 1), 1);

  const [state, setState] = useState<CheckoutPageState>({
    cartItems: [],
    addresses: [],
    selectedAddressId: null,
    selectedShippingOptionId: null,
    shippingOptions: [],
    paymentMethod: PaymentMethodEnum.COD,
    isLoading: true,
    isCreatingOrder: false,
    error: null,
    showAddressModal: false,
    newAddress: {
      fullName: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      phone: "",
      type: "HOME",
    },
  });

  // Load cart and addresses
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const addressResponse = await iamApi.getUserAddresses(user.id);

        if (checkoutMode === "buy-now" && buyNowProductId) {
          const productResponse = await productApi.getProductDetail(buyNowProductId);
          if (!productResponse.success || !productResponse.data) {
            throw new Error("Không thể tải thông tin sản phẩm để thanh toán");
          }

          const product = productResponse.data;

          if (product.status !== ProductStatusEnum.SELLING) {
            setState((prev) => ({
              ...prev,
              cartItems: [],
              isLoading: false,
              error: `Sản phẩm ${product.sku} hiện không khả dụng để mua.`,
            }));
            message.error(`Sản phẩm ${product.sku} hiện không khả dụng để mua.`);
            return;
          }

          setState((prev) => ({
            ...prev,
            cartItems: [{
              id: product.id,
              userId: user.id,
              productId: product.id,
              productName: product.name,
              productImage: product.imageUrl,
              sku: product.sku,
              salePrice: product.salePrice,
              quantity: buyNowQuantity,
            }],
          }));
        } else {
          const cartResponse = await orderApi.getCart(user.id);
          if (cartResponse.success && cartResponse.data) {
            setState((prev) => ({
              ...prev,
              cartItems: cartResponse.data.items.map((item) => ({ ...item, quantity: item.quantity ?? 1 })),
            }));
          }
        }

        if (addressResponse.success && addressResponse.data) {
          setState((prev) => ({
            ...prev,
            addresses: addressResponse.data,
            selectedAddressId: addressResponse.data.length > 0 ? addressResponse.data[0].id : null,
          }));
        }

        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load checkout data";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    loadData();
  }, [buyNowProductId, buyNowQuantity, checkoutMode, user]);

  useEffect(() => {
    const loadShippingOptions = async () => {
      const selectedAddress = state.addresses.find((address) => address.id === state.selectedAddressId);
      const subTotal = state.cartItems.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);

      if (!selectedAddress || subTotal <= 0) {
        setState((prev) => ({ ...prev, shippingOptions: [], selectedShippingOptionId: null }));
        return;
      }

      const shippingOptions = await getShippingOptions({
        city: selectedAddress.city,
        district: selectedAddress.district,
        subtotal: subTotal,
      });

      setState((prev) => ({
        ...prev,
        shippingOptions,
        selectedShippingOptionId: prev.selectedShippingOptionId || shippingOptions[0]?.id || null,
      }));
    };

    void loadShippingOptions();
  }, [state.addresses, state.cartItems, state.selectedAddressId]);

  useEffect(() => {
    if (!state.showAddressModal) return;

    form.setFieldsValue({
      fullName: user?.fullName ?? "",
      type: AddressType.HOME,
    });
  }, [form, state.showAddressModal, user?.fullName]);

  const handleAddressCreate = async (values: IamAddressRequest) => {
    if (!user) return;

    try {
      const response = await iamApi.createAddress(user.id, values);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          addresses: [...prev.addresses, response.data],
          selectedAddressId: response.data.id,
          showAddressModal: false,
        }));
        form.resetFields();
        message.success("Đã thêm địa chỉ thành công");
      }
    } catch {
      message.error("Lỗi khi thêm địa chỉ");
    }
  };

  const handleCreateOrder = async () => {
    if (!state.selectedAddressId) {
      message.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (!user) {
      message.error("Vui lòng đăng nhập");
      return;
    }

    try {
      setState((prev) => ({ ...prev, isCreatingOrder: true }));

      const subTotal = state.cartItems.reduce(
        (sum, item) => sum + item.salePrice * item.quantity,
        0
      );

      const selectedShippingOption =
        state.shippingOptions.find((option) => option.id === state.selectedShippingOptionId) ||
        state.shippingOptions[0] ||
        null;
      const selectedAddress = state.addresses.find((address) => address.id === state.selectedAddressId);

      if (!selectedShippingOption) {
        message.error("Vui lòng chọn phương thức vận chuyển");
        return;
      }

      if (!selectedAddress) {
        message.error("Vui lòng chọn địa chỉ giao hàng");
        return;
      }

      const orderData: OrderCreateRequest = {
        buyerId: user.id,
        productIds: state.cartItems.map((item) => item.productId),
        subTotal,
        shippingFee: selectedShippingOption.fee,
        discountAmount: 0,
        totalAmount: subTotal + selectedShippingOption.fee,
        paymentMethod: state.paymentMethod,
        shippingAddressId: state.selectedAddressId,
        shippingSnapshot: JSON.stringify({
          provider: selectedShippingOption.provider,
          serviceLevel: selectedShippingOption.serviceLevel,
          etaDays: selectedShippingOption.etaDays,
          address: {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            street: selectedAddress.street,
            ward: selectedAddress.ward,
            district: selectedAddress.district,
            city: selectedAddress.city,
          },
        }),
      };

      const response = await orderApi.createOrder(orderData);

      if (response.success && response.data) {
        if (isOnlinePayment(state.paymentMethod)) {
          message.info("Đơn hàng đã được tạo, chuyển đến màn hình thanh toán");
          try {
            // Create online payment session immediately so QR is ready when user arrives
            await paymentApi.createOnlinePayment(response.data.id);
          } catch (err) {
            // Non-fatal: still navigate to QR page where session creation will be retried
            // eslint-disable-next-line no-console
            console.warn("Failed to pre-create online payment session", err);
          }
          navigate(`/buyer/payments/${response.data.id}`);
        } else {
          message.success("Đã đặt hàng thành công!");
          navigate(`/buyer/orders/${response.data.id}`);
        }
      }
    } catch {
      message.error("Lỗi khi tạo đơn hàng");
    } finally {
      setState((prev) => ({ ...prev, isCreatingOrder: false }));
    }
  };

  const itemColumns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sản phẩm</span>,
      dataIndex: "productName",
      key: "product",
      render: (name: string) => <span className="font-bold text-slate-700">{name}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số lượng</span>,
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number) => <span className="font-bold text-slate-500">x{qty}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đơn giá</span>,
      dataIndex: "salePrice",
      key: "salePrice",
      render: (salePrice: number) => <span className="font-medium text-slate-600">{salePrice.toLocaleString()}₫</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tạm tính</span>,
      key: "subtotal",
      render: (_: unknown, record: CartItem) => (
        <span className="font-bold text-primary">{(record.salePrice * record.quantity).toLocaleString()}₫</span>
      ),
    },
  ];

  const subTotal = state.cartItems.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0
  );
  const selectedShippingOption =
    state.shippingOptions.find((option) => option.id === state.selectedShippingOptionId) ||
    state.shippingOptions[0] ||
    null;
  const shippingFee = selectedShippingOption?.fee ?? 0;
  const total = subTotal + shippingFee;

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/cart")}
          type="text"
          className="rounded-xl border-border/60 bg-white/50 text-slate-500 transition-soft hover:border-primary hover:text-primary px-4 py-2 h-auto"
        >
          Quay lại giỏ hàng
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Xác nhận đơn hàng</Text>
          <div className="h-px flex-1 bg-pink-100/50" />
        </div>
        <Title className="!m-0 !font-display !text-4xl !font-bold uppercase tracking-tight text-text-dark">Thanh toán</Title>
      </div>

      {state.error && (
        <Card className="rounded-[2rem] border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
          <Paragraph className="!m-0 font-medium text-red-800 italic">{state.error}</Paragraph>
        </Card>
      )}

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={15} className="space-y-8">
          {/* Order Items */}
          <Card
            title={<span className="font-display text-lg font-bold uppercase tracking-widest text-text-dark">Danh sách sản phẩm</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm"
          >
            <Table
              columns={itemColumns}
              dataSource={state.cartItems.map((item, index) => ({
                ...item,
                key: index,
              }))}
              pagination={false}
              className="luxury-table"
            />
          </Card>

          {/* Shipping Address */}
          <Card
            title={<span className="font-display text-lg font-bold uppercase tracking-widest text-text-dark">Địa chỉ giao hàng</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm"
          >
            <Radio.Group
              value={state.selectedAddressId}
              onChange={(e) => setState((prev) => ({ ...prev, selectedAddressId: e.target.value }))}
              className="w-full space-y-4"
            >
              {state.addresses.map((address) => (
                <Radio key={address.id} value={address.id} className="luxury-radio w-full block">
                  <div className="flex items-start gap-4 rounded-3xl border border-pink-50 bg-pink-50/10 p-5 transition-soft hover:bg-white hover:shadow-md">
                    <HomeOutlined className="mt-1 text-primary/60 text-lg" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <span className="text-base font-bold text-slate-800">{address.street}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">
                          {address.type}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-500 mt-1">
                        {address.district}, {address.city}
                      </div>
                      <div className="text-sm font-bold text-slate-400 mt-2 tracking-wider">{address.phone}</div>
                    </div>
                  </div>
                </Radio>
              ))}
            </Radio.Group>

            <Button
              onClick={() => setState((prev) => ({ ...prev, showAddressModal: true }))}
              className="mt-8 w-full rounded-2xl border-dashed border-pink-200 text-primary font-bold hover:bg-pink-50 h-14"
            >
              + THÊM ĐỊA CHỈ MỚI
            </Button>
          </Card>

          {/* Shipping Options */}
          <Card
            title={<span className="font-display text-lg font-bold uppercase tracking-widest text-text-dark">Phương thức vận chuyển</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm"
          >
            {state.shippingOptions.length > 0 ? (
              <Radio.Group
                value={state.selectedShippingOptionId}
                onChange={(event) => setState((prev) => ({ ...prev, selectedShippingOptionId: event.target.value }))}
                className="w-full space-y-4"
              >
                {state.shippingOptions.map((option) => (
                  <Radio key={option.id} value={option.id} className="luxury-radio w-full block">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-pink-50 bg-pink-50/10 p-5 transition-soft hover:bg-white hover:shadow-md">
                      <div>
                        <div className="text-base font-bold text-slate-800">
                          {option.provider} - {option.serviceLevel}
                        </div>
                        <div className="text-xs font-medium text-slate-400 mt-1 italic">Thời gian dự kiến: {option.etaDays} ngày</div>
                      </div>
                      <div className="text-lg font-bold text-primary">{option.fee.toLocaleString()}₫</div>
                    </div>
                  </Radio>
                ))}
              </Radio.Group>
            ) : (
              <div className="py-6 text-center italic text-slate-400">Vui lòng chọn địa chỉ để hiển thị các phương thức vận chuyển.</div>
            )}
          </Card>

          {/* Payment Method */}
          <Card
            title={<span className="font-display text-lg font-bold uppercase tracking-widest text-text-dark">Phương thức thanh toán</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm"
          >
            <Radio.Group
              value={state.paymentMethod}
              onChange={(e) => setState((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: PaymentMethodEnum.COD, label: "Thanh toán khi nhận hàng (COD)", desc: "Trả tiền mặt khi Shipper giao tới." },
                  { value: PaymentMethodEnum.ONLINE_PAYMENT, label: "Thanh toán Online", desc: "Thanh toán nhanh bằng mã QR ngân hàng." },
                ].map((item) => (
                  <Radio key={item.value} value={item.value} className="luxury-radio-box block h-full">
                    <div className="h-full rounded-3xl border border-pink-50 bg-pink-50/10 p-5 transition-soft hover:bg-white hover:shadow-md">
                      <div className="font-bold text-slate-800">{item.label}</div>
                      <div className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">{item.desc}</div>
                    </div>
                  </Radio>
                ))}
              </div>
            </Radio.Group>
          </Card>
        </Col>

        {/* Price Summary Sidebar */}
        <Col xs={24} lg={9}>
          <div className="sticky top-32 space-y-8">
            <Card
              title={<span className="font-display text-xl font-bold uppercase tracking-widest text-text-dark">Tóm tắt đơn hàng</span>}
              className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-luxury"
            >
              <div className="space-y-5">
                <div className="flex flex-wrap justify-between gap-3 font-medium text-slate-500">
                  <span>Tạm tính:</span>
                  <span className="font-bold text-slate-700">{subTotal.toLocaleString()}₫</span>
                </div>
                <div className="flex flex-wrap justify-between gap-3 font-medium text-slate-500">
                  <span>Phí vận chuyển:</span>
                  <span className="font-bold text-slate-700">{shippingFee.toLocaleString()}₫</span>
                </div>

                {selectedShippingOption && (
                  <div className="rounded-2xl bg-pink-50/30 p-4 text-[11px] font-bold uppercase tracking-widest text-primary/70">
                    <div className="flex flex-wrap justify-between gap-3">
                      <span>{selectedShippingOption.provider}</span>
                      <span>{selectedShippingOption.serviceLevel}</span>
                    </div>
                  </div>
                )}

                <Divider className="my-6 border-pink-100/50" />

                <div className="flex flex-wrap items-end justify-between gap-4">
                  <span className="font-display text-lg font-black uppercase tracking-tight text-slate-800">Tổng thanh toán</span>
                  <span className="font-display text-3xl font-black text-primary tracking-tight">{total.toLocaleString()}₫</span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={state.isCreatingOrder}
                  onClick={handleCreateOrder}
                  className="mt-8 h-16 rounded-2xl font-black shadow-luxury text-lg"
                >
                  ĐẶT HÀNG NGAY
                </Button>


                <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4 mt-6">
                  <SafetyCertificateOutlined className="text-primary text-xl" />
                  <p className="text-[9px] leading-relaxed font-bold text-primary/70 uppercase tracking-widest m-0">
                    Giao dịch an toàn & bảo mật. Cam kết hàng chính hãng 100%.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Add Address Modal */}
      <Modal
        title={<Title level={4} className="!m-0 !font-display uppercase tracking-tight">Thêm địa chỉ mới</Title>}
        open={state.showAddressModal}
        onCancel={() => setState((prev) => ({ ...prev, showAddressModal: false }))}
        footer={null}
        className="luxury-modal"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddressCreate}
          className="mt-6"
          size="large"
        >
            <Form.Item name="fullName" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Người nhận</span>} rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}>
              <Input placeholder="Nguyễn Văn A" className="rounded-2xl border-pink-100" />
            </Form.Item>
          <Form.Item name="street" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số nhà & Tên đường</span>} rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
            <Input placeholder="123 Nguyễn Huệ" className="rounded-2xl border-pink-100" />
          </Form.Item>
            <Form.Item name="ward" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Phường / Xã</span>} rules={[{ required: true, message: "Vui lòng nhập phường/xã" }]}>
              <Input placeholder="Phường Bến Nghé" className="rounded-2xl border-pink-100" />
            </Form.Item>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Form.Item name="district" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Quận / Huyện</span>} rules={[{ required: true, message: "Vui lòng nhập quận/huyện" }]}>
              <Input placeholder="Quận 1" className="rounded-2xl border-pink-100" />
            </Form.Item>
            <Form.Item name="city" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tỉnh / Thành phố</span>} rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành" }]}>
              <Input placeholder="TP. Hồ Chí Minh" className="rounded-2xl border-pink-100" />
            </Form.Item>
          </div>
          <Form.Item name="phone" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số điện thoại nhận hàng</span>} rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
            <Input placeholder="09xx xxx xxx" className="rounded-2xl border-pink-100" />
          </Form.Item>
            <Form.Item name="type" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Loại địa chỉ</span>} rules={[{ required: true, message: "Vui lòng chọn loại địa chỉ" }]}>
              <Select
                className="rounded-2xl"
                options={[
                  { label: "Nhà riêng", value: AddressType.HOME },
                  { label: "Văn phòng", value: AddressType.OFFICE },
                  { label: "Khác", value: AddressType.OTHER },
                ]}
              />
            </Form.Item>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button block size="large" onClick={() => setState((prev) => ({ ...prev, showAddressModal: false }))}>HỦY BỎ</Button>
            <Button type="primary" block size="large" htmlType="submit">LƯU ĐỊA CHỈ</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
