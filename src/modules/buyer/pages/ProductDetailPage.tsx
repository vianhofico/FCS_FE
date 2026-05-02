/**
 * Product Detail Page (Buyer)
 * View full product details, reviews, and add to cart
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Spin,
  Empty,
  Row,
  Col,
  Divider,
  InputNumber,
  Rate,
  Tag,
  message,
  Tabs,
  Progress,
} from "antd";
import { ShoppingCartOutlined, ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { productApi } from "@/modules/product/api/productApi";
import { reviewApi } from "@/modules/product/api/reviewApi";
import { orderApi } from "@/modules/order/api/orderApi";
import type { ProductDetail } from "@/shared/contracts/productContract";
import type { ProductReview, ReviewSummary } from "@/shared/contracts/reviewContract";
import { useAuth } from "@/shared/context/AuthContext";

interface ProductDetailPageState {
  product: ProductDetail | null;
  reviews: ProductReview[];
  reviewSummary: ReviewSummary | null;
  quantity: number;
  isLoading: boolean;
  isAddingToCart: boolean;
  error: string | null;
}

/**
 * Product Detail Page component
 */
export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<ProductDetailPageState>({
    product: null,
    reviews: [],
    reviewSummary: null,
    quantity: 1,
    isLoading: true,
    isAddingToCart: false,
    error: null,
  });

  // Load product details and reviews
  useEffect(() => {
    const fetchData = async () => {
      if (!productId) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Fetch product details
        const productResponse = await productApi.getProductDetail(productId);

        // Fetch reviews
        let reviewsData: ProductReview[] = [];
        let reviewSummaryData: ReviewSummary | null = null;
        try {
          const reviewsResponse = await reviewApi.getProductReviews(productId);
          if (reviewsResponse.success && reviewsResponse.data) {
            reviewsData = reviewsResponse.data.content;
          }

          // Fetch review summary
          const summaryResponse = await reviewApi.getReviewSummary(productId);
          if (summaryResponse.success && summaryResponse.data) {
            reviewSummaryData = summaryResponse.data;
          }
        } catch {
          // Reviews might not be available
        }

        setState((prev) => ({
          ...prev,
          product: productResponse.data,
          reviews: reviewsData,
          reviewSummary: reviewSummaryData,
          isLoading: false,
        }));
      } catch {
        const errorMsg = "Failed to load product";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchData();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!state.product || !user) {
      message.error("Please log in to add items to cart");
      return;
    }

    try {
      setState((prev) => ({ ...prev, isAddingToCart: true }));

      await orderApi.addToCart(user.id, {
        productId: state.product.id,
        quantity: state.quantity,
      });

      message.success(`Added ${state.quantity} item(s) to cart`);
      setState((prev) => ({ ...prev, isAddingToCart: false }));

      // Navigate to cart after 1 second
      setTimeout(() => {
        navigate("/buyer/cart");
      }, 1000);
    } catch {
      message.error("Failed to add to cart");
      setState((prev) => ({ ...prev, isAddingToCart: false }));
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!state.product) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/buyer/products")}
            className="mb-4"
          >
            Back to Products
          </Button>
          <Empty description="Product not found" />
        </div>
      </div>
    );
  }

  const product = state.product;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/products")}
          className="mb-6"
        >
          Back to Products
        </Button>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Product Details */}
        <Row gutter={[32, 32]}>
          {/* Images */}
          <Col xs={24} md={12}>
            <Card className="shadow-sm">
              {product.imageUrl ? (
                <div>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400">No Image Available</span>
                </div>
              )}
            </Card>
          </Col>

          {/* Info */}
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" className="w-full">
              {/* Title and Status */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex gap-2 items-center">
                  <Tag color={product.status === "ACTIVE" ? "green" : "orange"}>{product.status}</Tag>
                  {product.condition && (
                    <span className="text-sm text-gray-600">
                      Condition: {product.condition}/100
                    </span>
                  )}
                </div>
              </div>

              {/* Brand and Category */}
              <div className="text-gray-600">
                <p>
                  <strong>Brand ID:</strong> {product.brandId || "N/A"}
                </p>
                <p>
                  <strong>Categories:</strong> {product.categoryIds?.join(", ") || "N/A"}
                </p>
              </div>

              <Divider />

              {/* Price */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-2">Sale Price</p>
                <p className="text-4xl font-bold text-blue-600">${product.salePrice.toLocaleString()}</p>
                {product.originalPrice && product.originalPrice > product.salePrice && (
                  <p className="text-gray-500 text-sm mt-1">
                    Original: <s>${product.originalPrice.toLocaleString()}</s>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>

              {/* Quantity and Cart */}
              <Card className="bg-gray-50">
                <Space direction="vertical" size="large" className="w-full">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <InputNumber
                      min={1}
                      max={10}
                      value={state.quantity}
                      onChange={(value) => setState((prev) => ({ ...prev, quantity: value || 1 }))}
                      size="large"
                      className="w-full"
                    />
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    loading={state.isAddingToCart}
                    block
                    disabled={product.status !== "ACTIVE"}
                  >
                    Add to Cart
                  </Button>
                </Space>
              </Card>

              {/* Seller Info */}
              <Card className="bg-blue-50 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Product Info</p>
                <p className="text-sm text-gray-700">SKU: {product.sku}</p>
              </Card>
            </Space>
          </Col>
        </Row>

        {/* Reviews */}
        <Card className="mt-8 shadow-sm">
          {/* Review Summary */}
          {state.reviewSummary && (
            <div className="mb-8 pb-8 border-b">
              <Row gutter={[32, 32]}>
                {/* Average Rating */}
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-yellow-500 mb-2">
                      {state.reviewSummary.averageRating.toFixed(1)}
                    </div>
                    <Rate value={Math.round(state.reviewSummary.averageRating)} disabled />
                    <p className="text-gray-600 text-sm mt-2">
                      Based on {state.reviewSummary.totalReviews} reviews
                    </p>
                  </div>
                </Col>

                {/* Rating Distribution */}
                <Col xs={24} sm={12} md={18}>
                  <Space direction="vertical" size="middle" className="w-full">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="w-12 text-sm font-medium text-gray-600">{rating} ★</span>
                        <Progress
                          percent={
                            state.reviewSummary.totalReviews > 0
                              ? ((state.reviewSummary.ratingDistribution?.[rating as keyof typeof state.reviewSummary.ratingDistribution] || 0) / state.reviewSummary.totalReviews) * 100
                              : 0
                          }
                          size="small"
                          strokeColor={{ 0: "#ffd666", 100: "#ffd666" }}
                        />
                        <span className="w-12 text-right text-xs text-gray-500">
                          {state.reviewSummary.ratingDistribution?.[rating as keyof typeof state.reviewSummary.ratingDistribution] || 0}
                        </span>
                      </div>
                    ))}
                  </Space>
                </Col>
              </Row>
            </div>
          )}

          {/* Leave Review Button */}
          {user && (
            <div className="mb-6">
              <Button
                type="primary"
                size="large"
                icon={<EditOutlined />}
                onClick={() => navigate(`/buyer/products/${productId}/review`)}
              >
                Leave a Review
              </Button>
            </div>
          )}

          {/* Reviews List */}
          <Tabs
            items={[
              {
                key: "reviews",
                label: `Reviews (${state.reviews.length})`,
                children:
                  state.reviews.length > 0 ? (
                    <Space direction="vertical" size="large" className="w-full">
                      {state.reviews.map((review) => (
                        <Card key={review.id} size="small" className="bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{review.reviewedBy}</p>
                              <Rate value={review.rating} disabled size="small" />
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt || "").toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                        </Card>
                      ))}
                    </Space>
                  ) : (
                    <Empty description="No reviews yet" />
                  ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
