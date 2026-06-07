/**
 * Product Detail Page (Buyer)
 * View full product details, reviews, and add to cart
 */

import {
  ArrowLeftOutlined,
  HeartOutlined,
  MinusOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Card,
  Col,

  Progress,
  Rate,
  Row,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { orderApi } from "@/modules/order/api/orderApi";
import { productApi } from "@/modules/product/api/productApi";
import { reviewApi } from "@/modules/product/api/reviewApi";
import { useAuth } from "@/shared/context/AuthContext";
import { Badge, Button, EmptyState, GradeBadge } from "@/shared/ui";
import type { ProductDetail } from "@/shared/contracts/productContract";
import type { ProductReview, ReviewSummary } from "@/shared/contracts/reviewContract";

const { Title, Text, Paragraph } = Typography;

interface ProductDetailPageState {
  product: ProductDetail | null;
  reviews: ProductReview[];
  reviewSummary: ReviewSummary | null;
  quantity: number;
  isLoading: boolean;
  isAddingToCart: boolean;
  error: string | null;
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const { user, isAuthenticated, hasRole } = useAuth();
  const isSellerContext = location.pathname.startsWith("/seller/products") && (hasRole("SELLER") || hasRole("BUYER"));
  const canBuyProduct = !isSellerContext && !hasRole("MANAGER") && !hasRole("ADMIN");
  const [state, setState] = useState<ProductDetailPageState>({
    product: null,
    reviews: [],
    reviewSummary: null,
    quantity: 1,
    isLoading: true,
    isAddingToCart: false,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const productResponse = await productApi.getProductDetail(productId);

        let reviewsData: ProductReview[] = [];
        let reviewSummaryData: ReviewSummary | null = null;
        try {
          const reviewsResponse = await reviewApi.getProductReviews(productId);
          if (reviewsResponse.success && reviewsResponse.data) {
            reviewsData = reviewsResponse.data.content;
          }
          const summaryResponse = await reviewApi.getReviewSummary(productId);
          if (summaryResponse.success && summaryResponse.data) {
            reviewSummaryData = summaryResponse.data;
          }
        } catch { /* reviews not available */ }

        setState((prev) => ({
          ...prev,
          product: productResponse.data,
          reviews: reviewsData,
          reviewSummary: reviewSummaryData,
          isLoading: false,
        }));
      } catch {
        setState((prev) => ({ ...prev, isLoading: false, error: "Không tìm thấy thông tin sản phẩm" }));
      }
    };
    fetchData();
  }, [productId]);

  const handleBuyNow = () => {
    if (!isAuthenticated || !user) {
      message.info("Vui lòng đăng nhập để mua hàng");
      navigate("/auth/login");
      return;
    }
    if (!user.id) {
      message.error("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại");
      navigate("/auth/login");
      return;
    }
    if (!state.product) return;

    navigate(`/buyer/checkout?mode=buy-now&productId=${state.product.id}&quantity=${state.quantity}`);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      message.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/auth/login");
      return;
    }
    if (!user.id) {
      message.error("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại");
      navigate("/auth/login");
      return;
    }
    if (!state.product) return;

    try {
      setState((prev) => ({ ...prev, isAddingToCart: true }));
      await orderApi.addToCart(user.id, {
        productId: state.product.id,
        quantity: state.quantity,
      });
      message.success("Đã thêm vào giỏ hàng thành công!");
      setState((prev) => ({ ...prev, isAddingToCart: false }));
    } catch {
      message.error("Lỗi khi thêm vào giỏ hàng");
      setState((prev) => ({ ...prev, isAddingToCart: false }));
    }
  };

  if (state.isLoading) return <div className="flex min-h-screen items-center justify-center"><Spin size="large" /></div>;
  if (!state.product) return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
      <EmptyState
        title="Không tìm thấy sản phẩm"
        description="Thông tin sản phẩm có thể đã bị thay đổi hoặc không tồn tại."
        action={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(isSellerContext ? "/seller/products" : "/buyer/products")} type="primary">Quay lại danh sách</Button>}
      />
    </div>
  );

  const product = state.product;
  const conditionPercent = product.conditionPercent ?? product.condition ?? 0;

  return (
    <div className="mx-auto max-w-[1440px] space-y-14 pb-28">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(isSellerContext ? "/seller/products" : "/buyer/products")}
          type="text"
          className="rounded-xl border-border/60 bg-white/50 text-slate-500 transition-soft hover:border-primary hover:text-primary px-4 py-2 h-auto"
        >
          Quay lại danh sách
        </Button>
      </div>

      <Row gutter={[48, 48]}>
        {/* Product Images Column */}
        <Col xs={24} md={12} lg={13}>
          <div className="sticky top-32 space-y-4">
            <div className="group relative aspect-[3/4] overflow-hidden rounded-[2.5rem] bg-white shadow-luxury">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 text-slate-300 italic font-medium">Không có hình ảnh</div>
              )}
              <div className="absolute top-6 left-6">
                <GradeBadge grade={conditionPercent >= 90 ? 'S' : 'A'} />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <SafetyCertificateOutlined />, text: "Xác thực 100%" },
                { icon: <StarFilled />, text: "Đã kiểm định" },
                { icon: <HeartOutlined />, text: "Eco-Friendly" }
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-2 rounded-3xl border border-pink-100/50 bg-white/40 p-4 backdrop-blur-sm transition-soft hover:bg-white/60">
                  <span className="text-xl text-primary/70">{badge.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Product Info Column */}
        <Col xs={24} md={12} lg={11}>
          <div className="space-y-14">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-yellow-400">
                  <StarFilled />
                  <span className="text-sm font-bold text-slate-700">{state.reviewSummary?.averageRating.toFixed(1) || "5.0"}</span>
                </div>
              </div>
              <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight text-text-dark md:!text-5xl">{product.name}</Title>
              <div className="flex items-center gap-4">
                <Text className="text-4xl font-bold text-primary">{product.salePrice.toLocaleString()}₫</Text>
                {product.originalPrice && product.originalPrice > product.salePrice && (
                  <>
                    <Text delete className="text-lg font-medium text-slate-300">{product.originalPrice.toLocaleString()}₫</Text>
                    <Badge>-{Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}%</Badge>
                  </>
                )}
              </div>
            </div>

            {canBuyProduct && (
              <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex flex-wrap justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Số lượng</span>
                      {product.status === "SELLING" || (product.stock ?? 0) > 0 ? (
                        <span className="text-xs font-bold text-primary italic">
                          {product.stock != null && product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Còn hàng"}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-red-400 italic">Hết hàng</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-1 items-center justify-between rounded-2xl border border-pink-100 bg-white p-1">
                        <Button
                          type="text"
                          icon={<MinusOutlined />}
                          disabled={state.quantity <= 1}
                          onClick={() => setState(p => ({ ...p, quantity: p.quantity - 1 }))}
                          className="h-10 w-10 text-primary flex items-center justify-center"
                        />
                        <span className="font-display text-lg font-bold">{state.quantity}</span>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          disabled={state.quantity >= (product.stock != null ? product.stock : 1)}
                          onClick={() => setState(p => ({ ...p, quantity: p.quantity + 1 }))}
                          className="h-10 w-10 text-primary flex items-center justify-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      className="h-14 rounded-2xl font-bold shadow-luxury"
                      loading={state.isAddingToCart}
                      onClick={handleAddToCart}
                    >
                      THÊM VÀO GIỎ
                    </Button>
                    <Button
                      size="large"
                      className="h-14 rounded-2xl border-primary text-primary font-bold transition-soft hover:!bg-primary hover:!text-white"
                      onClick={handleBuyNow}
                    >
                      MUA NGAY
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="mt-8 space-y-8">
              <div>
                <Title level={5} className="!mb-4 !font-display uppercase tracking-widest text-sm">Mô tả sản phẩm</Title>
                <Paragraph className="text-lg leading-relaxed text-slate-600/80">{product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</Paragraph>
              </div>

              <div className="grid grid-cols-1 gap-x-12 gap-y-7 rounded-[2rem] border border-pink-100/20 bg-pink-50/30 p-8 sm:grid-cols-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Tình trạng</div>
                  <div className="mt-1 text-base font-bold text-slate-700">{conditionPercent}/100 - Rất mới</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Mã SKU</div>
                  <div className="mt-1 text-base font-bold text-slate-700">{product.sku}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Xác thực</div>
                  <div className="mt-1 text-base font-bold text-slate-700 italic">Authentic Guaranteed</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Màu sắc</div>
                  <div className="mt-1 text-base font-bold text-slate-700">Tự nhiên</div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Reviews Section */}
      <section className="mt-20 space-y-12">
        <div className="flex flex-col items-center text-center">
          <Title className="!font-display !text-4xl !font-bold uppercase tracking-tight">Đánh giá cộng đồng</Title>
          <div className="mt-4 h-1 w-20 rounded-full bg-primary/30" />
        </div>

        <Row gutter={[48, 48]}>
          <Col xs={24} lg={8}>
            <div className="rounded-[2.5rem] border border-pink-100/50 bg-white/50 p-10 backdrop-blur-md shadow-sm">
              <div className="text-center">
                <div className="font-display text-7xl font-bold text-primary leading-none">
                  {state.reviewSummary?.totalReviews ? state.reviewSummary.averageRating.toFixed(1) : "—"}
                </div>
                <Rate disabled value={Math.round(state.reviewSummary?.averageRating ?? 0)} className="mt-6 !text-yellow-400" />
                <div className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Dựa trên {state.reviewSummary?.totalReviews ?? 0} đánh giá
                </div>
              </div>
              <div className="mt-10 space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-4">
                    <span className="w-10 text-xs font-bold text-slate-400">{rating} sao</span>
                    <Progress
                      percent={state.reviewSummary?.ratingDistribution?.[rating as keyof typeof state.reviewSummary.ratingDistribution] || 0}
                      showInfo={false}
                      strokeColor={rating >= 4 ? "#d94a7a" : "#f08ab1"}
                      className="m-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              {state.reviews.length > 0 ? (
                state.reviews.map((review) => (
                  <Card key={review.id} className="rounded-3xl border-pink-100/40 bg-white transition-soft hover:shadow-luxury">
                    <div className="flex items-start gap-4">
                      <Avatar size={48} className="bg-pink-50 text-primary font-bold">{review.reviewedBy?.[0]?.toUpperCase()}</Avatar>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Title level={5} className="!m-0 !font-sans !font-bold text-slate-800">{review.reviewedBy}</Title>
                          <Text className="text-xs font-bold text-slate-400">{new Date(review.createdAt || "").toLocaleDateString()}</Text>
                        </div>
                        <Rate disabled value={review.rating} className="text-xs !text-yellow-400" />
                        <Paragraph className="text-slate-600 leading-relaxed italic mt-3">"{review.comment}"</Paragraph>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyState
                  title="Chưa có đánh giá"
                  description="Sản phẩm này chưa có đánh giá nào từ cộng đồng. Hãy là người đầu tiên sở hữu!"
                />
              )}
            </div>
          </Col>
        </Row>
      </section>
    </div>
  );
}
