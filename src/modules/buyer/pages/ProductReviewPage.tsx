/**
 * Product Review Page (Buyer)
 * Leave or edit product review
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Button,
  Rate,
  Spin,
  message,
  Upload,
  Space,
} from "antd";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { reviewApi } from "@/modules/product/api/reviewApi";
import { productApi } from "@/modules/product/api/productApi";
import type { ProductReviewCreateRequest } from "@/shared/contracts/reviewContract";
import type { ProductSummary } from "@/shared/contracts/productContract";
import type { RcFile, UploadFile } from "antd/es/upload";

interface ProductReviewPageState {
  product: ProductSummary | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  rating: number;
  title: string;
  description: string;
  mediaIds: string[];
  uploadingMedia: boolean;
  uploadedFiles: UploadFile[];
}

/**
 * Product Review Page component
 */
export default function ProductReviewPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [state, setState] = useState<ProductReviewPageState>({
    product: null,
    isLoading: true,
    isSubmitting: false,
    error: null,
    rating: 0,
    title: "",
    description: "",
    mediaIds: [],
    uploadingMedia: false,
    uploadedFiles: [],
  });

  // Load product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await productApi.getProductDetail(productId);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            product: response.data,
            isLoading: false,
          }));
        }
      } catch {
        const errorMsg = "Failed to load product";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchProduct();
  }, [productId]);

  const handleMediaUpload = async (file: RcFile) => {
    // Media upload not implemented yet
    void file;
    return false;
  };

  const handleRemoveMedia = (mediaId: string) => {
    // Media upload not implemented yet
    void mediaId;
  };

  const handleSubmit = async (values: { title: string; description: string }) => {
    void values;
    if (state.rating === 0) {
      message.error("Please select a rating");
      return;
    }

    if (!state.title.trim()) {
      message.error("Please enter a title");
      return;
    }

    if (!state.description.trim()) {
      message.error("Please enter a description");
      return;
    }

    try {
      setState((prev) => ({ ...prev, isSubmitting: true }));

      const reviewData: ProductReviewCreateRequest = {
        productId: productId!,
        rating: state.rating,
        comment: state.description,
      };

      const response = await reviewApi.createReview(productId!, reviewData);

      if (response.success) {
        message.success("Review submitted successfully!");
        setTimeout(() => {
          navigate(`/buyer/products/${productId}`);
        }, 1000);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
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
      <div className="p-6 max-w-2xl mx-auto">
        {state.error && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}
        {!state.error && <Card className="mb-6">Product not found</Card>}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/products")}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/buyer/products/${productId}`)}
            className="mb-4"
          >
            Back to Product
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leave a Review</h1>
          <p className="text-gray-600">Product: {state.product.name}</p>
        </div>

        {/* Review Form Card */}
        <Card className="shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-6"
          >
            {/* Rating */}
            <Form.Item label="Rating" required>
              <div className="flex items-center gap-4">
                <Rate
                  value={state.rating}
                  onChange={(value) => setState((prev) => ({ ...prev, rating: value }))}
                  size="large"
                />
                <span className="text-gray-600">
                  {state.rating > 0 ? `${state.rating} out of 5 stars` : "Please select a rating"}
                </span>
              </div>
            </Form.Item>

            {/* Title */}
            <Form.Item
              label="Review Title"
              name="title"
              rules={[{ required: true, message: "Please enter a review title" }]}
            >
              <Input
                placeholder="e.g., Great quality and fast delivery"
                value={state.title}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </Form.Item>

            {/* Description */}
            <Form.Item
              label="Review Description"
              name="description"
              rules={[
                { required: true, message: "Please enter a review description" },
                {
                  min: 20,
                  message: "Review must be at least 20 characters",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Tell us what you think about this product..."
                rows={6}
                value={state.description}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </Form.Item>

            {/* Media Upload */}
            <Form.Item label="Photos/Videos (Optional)">
              <div className="space-y-4">
                <Upload
                  accept="image/*,video/*"
                  maxCount={5}
                  beforeUpload={(file) => {
                    handleMediaUpload(file);
                    return false;
                  }}
                  disabled={state.uploadingMedia}
                >
                  <Button loading={state.uploadingMedia}>
                    Upload Images/Videos
                  </Button>
                </Upload>

                {/* Uploaded Media Preview */}
                {state.uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {state.uploadedFiles.map((file) => (
                      <div
                        key={file.uid}
                        className="relative group border rounded-lg overflow-hidden"
                      >
                        {file.url && (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-24 object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                          <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveMedia(file.uid as string)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Form.Item>

            {/* Submit */}
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={state.isSubmitting}
                >
                  Submit Review
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate(`/buyer/products/${productId}`)}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* Helpful Tips */}
        <Card className="mt-6 shadow-sm bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Tips for a Helpful Review:</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Be specific about what you liked or disliked</li>
            <li>Include photos/videos of the product if possible</li>
            <li>Mention if the product matches the description</li>
            <li>Share any quality or durability observations</li>
            <li>Be respectful and constructive in your feedback</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
