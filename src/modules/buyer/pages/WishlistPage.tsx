/**
 * Wishlist Page (Buyer)
 * Manage saved products for future purchase
 */

import { useEffect, useState } from 'react';
import { Card, Spin, Row, Col, Typography } from 'antd';
import { HeartFilled, ShopOutlined, ArrowLeftOutlined, ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { http } from '@/shared/api/http';
import { endpoints } from '@/shared/api/endpoints';
import { Button, EmptyState, GradeBadge } from '@/shared/ui';

const { Title, Text, Paragraph } = Typography;

type WishlistItem = {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  salePrice: number;
  sku: string;
  condition: number;
};

export default function WishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await http.get(endpoints.wishlist);
      setItems(res.data?.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const getConditionLabel = (condition: number) => {
    if (condition >= 90) return "S";
    if (condition >= 80) return "A";
    if (condition >= 65) return "B";
    return "C";
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Danh sách yêu thích</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Lưu giữ những món đồ thời trang tinh hoa bạn đang quan tâm để hoàn thiện phong cách riêng.
          </Paragraph>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/products")}
          className="rounded-xl border-pink-100 text-primary font-bold hover:border-primary h-12 px-6"
        >
          TIẾP TỤC MUA SẮM
        </Button>
      </div>

      <Spin spinning={loading} size="large">
        {items.length > 0 ? (
          <Row gutter={[24, 32]}>
            {items.map((item) => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <Card
                  hoverable
                  className="group overflow-hidden rounded-3xl border-border/40 bg-white transition-premium hover:shadow-luxury"
                  cover={
                    <div className="relative aspect-[3/4] overflow-hidden bg-bg-secondary">
                      {item.productImage ? (
                        <img
                          alt={item.productName}
                          src={item.productImage}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-slate-100 text-slate-300 italic">No Image</div>
                      )}
                      <div className="absolute top-4 left-4 z-10">
                        <GradeBadge grade={getConditionLabel(item.condition)} />
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          shape="circle"
                          icon={<DeleteOutlined />}
                          danger
                          className="border-none bg-white/90 shadow-sm hover:!bg-rose-500 hover:!text-white flex items-center justify-center w-8 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete logic here
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Button
                          shape="circle"
                          icon={<ShoppingCartOutlined />}
                          className="translate-y-4 scale-110 border-none bg-white/90 transition-premium group-hover:translate-y-0 hover:!bg-primary hover:!text-white flex items-center justify-center w-10 h-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/buyer/products/${item.productId}`);
                          }}
                        />
                      </div>
                    </div>
                  }
                  onClick={() => navigate(`/buyer/products/${item.productId}`)}
                >
                  <div className="space-y-2">
                    <Text className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
                      {item.sku}
                    </Text>
                    <Title level={5} className="!m-0 !line-clamp-1 !font-display !font-bold !text-text-dark group-hover:text-primary transition-soft">
                      {item.productName}
                    </Title>
                    <div className="flex items-baseline gap-2">
                      <Text className="text-lg font-black text-primary">
                        {item.salePrice.toLocaleString()}₫
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : !loading && (
          <div className="py-20 text-center bg-white/30 rounded-[3rem] border border-dashed border-pink-100/50 backdrop-blur-sm">
            <EmptyState
              title="Danh sách đang trống"
              description="Hãy bắt đầu khám phá và lưu lại những món đồ bạn yêu thích nhất."
              action={
                <Button type="primary" size="large" icon={<ShopOutlined />} onClick={() => navigate("/buyer/products")}>
                  KHÁM PHÁ NGAY
                </Button>
              }
            />
          </div>
        )}
      </Spin>

      <div className="flex justify-center pt-8">
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <HeartFilled className="text-primary text-xl" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Yêu thích của bạn</div>
            <div className="font-display text-2xl font-bold text-slate-800">{items.length} Sản phẩm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
