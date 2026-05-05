/**
 * Shopping Cart Page (Buyer)
 * Manage cart items, view total, and checkout
 */

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  InputNumber,
  Popconfirm,
  Row,
  Spin,
  Table,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { orderApi } from "@/modules/order/api/orderApi";
import { useAuth } from "@/shared/context/AuthContext";
import type { CartItem } from "@/shared/contracts/orderContract";

const { Title, Text } = Typography;

interface CartPageState {
  cartItems: CartItem[];
  isLoading: boolean;
  isCheckingOut: boolean;
  error: string | null;
  total: number;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<CartPageState>({
    cartItems: [],
    isLoading: true,
    isCheckingOut: false,
    error: null,
    total: 0,
  });

  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated || !user) {
        setState((prev) => ({ ...prev, isLoading: false, error: "Vui lòng đăng nhập để xem giỏ hàng" }));
        return;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const response = await orderApi.getCart(user.id);
        if (response.success && response.data) {
          const cartItems = response.data.items.map((item) => ({ ...item, quantity: item.quantity ?? 1 }));
          const total = cartItems.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
          setState((prev) => ({ ...prev, cartItems, total, isLoading: false }));
        }
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false, error: "Không thể tải dữ liệu giỏ hàng" }));
      }
    };
    fetchCart();
  }, [user, isAuthenticated]);

  const handleRemoveItem = async (itemId: string) => {
    if (!user) return;
    try {
      await orderApi.removeFromCart(user.id, itemId);
      setState((prev) => {
        const filtered = prev.cartItems.filter((item) => item.id !== itemId);
        return {
          ...prev,
          cartItems: filtered,
          total: filtered.reduce((sum, item) => sum + item.salePrice * item.quantity, 0),
        };
      });
      message.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch {
      message.error("Lỗi khi xóa sản phẩm");
    }
  };

  const columns = [
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</span>,
      key: "product",
      width: 240,
      render: (_: any, record: CartItem) => (
        <div className="flex items-center gap-4 py-2 group cursor-pointer" onClick={() => navigate(`/buyer/products/${record.productId}`)}>
          <div className="h-20 w-16 overflow-hidden rounded-xl bg-bg-secondary shadow-sm">
            {record.productImage ? (
              <img src={record.productImage} alt={record.productName} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-slate-300">No Img</div>
            )}
          </div>
          <div>
            <p className="font-display text-base font-black text-slate-800 transition-soft group-hover:text-primary">{record.productName}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{record.sku}</p>
          </div>
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      align: "center" as const,
      width: 64,
      render: (_: any, record: CartItem) => (
        <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleRemoveItem(record.id)} okText="Có" cancelText="Không">
          <Button type="text" danger icon={<DeleteOutlined />} className="hover:!bg-red-50" />
        </Popconfirm>
      ),
    },
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giá</span>,
      key: "price",
      render: (_: any, record: CartItem) => <span className="font-bold text-slate-700">{record.salePrice.toLocaleString()}₫</span>,
    },
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số lượng</span>,
      key: "quantity",
      render: (_: any, record: CartItem) => (
        <InputNumber
          min={1}
          max={10}
          value={record.quantity}
          onChange={(val) => {
            if (!val) return;
            setState((prev) => {
              const updated = prev.cartItems.map((item) => (item.id === record.id ? { ...item, quantity: val } : item));
              return { ...prev, cartItems: updated, total: updated.reduce((sum, i) => sum + i.salePrice * i.quantity, 0) };
            });
          }}
          className="rounded-xl"
        />
      ),
    },
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tạm tính</span>,
      key: "subtotal",
      render: (_: any, record: CartItem) => <span className="font-black text-primary">{(record.salePrice * record.quantity).toLocaleString()}₫</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="space-y-2">
          <Title className="!m-0 !font-display !text-4xl !font-black uppercase tracking-tight">Giỏ hàng của bạn</Title>
          <Text className="text-sm font-medium text-slate-400">Chọn những sản phẩm tinh hoa cho phong cách của bạn</Text>
        </div>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/buyer/products")}
          className="rounded-2xl border-primary/30 text-primary font-bold hover:bg-primary hover:text-white h-11"
        >
          Tiếp tục mua sắm
        </Button>
      </div>

      {state.isLoading ? (
        <div className="flex h-64 items-center justify-center"><Spin size="large" /></div>
      ) : state.cartItems.length === 0 ? (
        <Card className="rounded-[3rem] border-dashed border-border/60 bg-white/40 py-20">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bg-secondary text-primary/30">
              <ShoppingCartOutlined className="text-5xl" />
            </div>
            <Title level={3} className="!font-display !m-0 !text-slate-300 uppercase">Giỏ hàng đang trống</Title>
            <Button type="primary" size="large" className="rounded-2xl px-12 h-12 font-black shadow-luxury" onClick={() => navigate("/buyer/products")}>MUA SẮM NGAY</Button>
          </div>
        </Card>
      ) : (
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={16}>
            <Card className="overflow-hidden rounded-[2.5rem] border-border/40 bg-white shadow-sm">
              <Table columns={columns} dataSource={state.cartItems} pagination={false} rowKey="id" scroll={{ x: 720 }} className="luxury-table" />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="sticky top-32 space-y-8 rounded-[2.5rem] border-border/60 bg-white/70 p-8 shadow-luxury backdrop-blur-md">
              <Title level={4} className="!font-display !m-0 uppercase tracking-widest text-slate-800">Tóm tắt đơn hàng</Title>
              
              <div className="space-y-4">
                <div className="flex flex-wrap justify-between gap-3 font-medium text-slate-500">
                  <span>Tạm tính ({state.cartItems.length} sản phẩm)</span>
                  <span>{state.total.toLocaleString()}₫</span>
                </div>
                <div className="flex flex-wrap justify-between gap-3 font-medium text-slate-500">
                  <span>Phí vận chuyển</span>
                  <span className="italic">Tính tại bước tiếp theo</span>
                </div>
                <Divider className="my-4 border-border/60" />
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <span className="font-display text-lg font-black uppercase tracking-tight text-slate-800">Tổng cộng</span>
                  <span className="font-display text-2xl font-black text-primary tracking-tight">{state.total.toLocaleString()}₫</span>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  className="h-14 rounded-2xl font-black shadow-luxury"
                  onClick={() => navigate("/buyer/checkout")}
                >
                  THANH TOÁN NGAY
                </Button>
                
                <div className="flex gap-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                  <SafetyCertificateOutlined className="text-primary text-xl" />
                  <p className="text-[10px] leading-relaxed font-bold text-primary/70 uppercase tracking-widest">
                    Mọi giao dịch đều được Re:Wear bảo hộ 100%. Xác thực hàng thật, hoàn tiền x2 nếu sai phạm.
                  </p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
