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
  Rate,
  Spin,
  message,
  Upload,
  Typography,
  Row,
  Col,
} from "antd";
import { ArrowLeftOutlined, StarFilled, CameraOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { reviewApi } from "@/modules/product/api/reviewApi";
import { productApi } from "@/modules/product/api/productApi";
import type { ProductReviewCreateRequest } from "@/shared/contracts/reviewContract";
import type { ProductSummary } from "@/shared/contracts/productContract";
import type { RcFile, UploadFile } from "antd/es/upload";
import { Button, EmptyState } from "@/shared/ui";

const { Title, Text, Paragraph } = Typography;

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
        const errorMsg = "Không thể tải thông tin sản phẩm";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchProduct();
  }, [productId]);

  const handleMediaUpload = async (_file: RcFile) => {
    // Media upload not implemented yet
    return false;
  };

  // @ts-ignore - handleRemoveMedia is planned for future media support
  const handleRemoveMedia = (_mediaId: string) => {
    // Media upload not implemented yet
  };

  const handleSubmit = async (_values: { title: string; description: string }) => {
    if (state.rating === 0) {
      message.error("Vui lòng chọn mức độ hài lòng");
      return;
    }

    if (!state.title.trim()) {
      message.error("Vui lòng nhập tiêu đề đánh giá");
      return;
    }

    if (!state.description.trim()) {
      message.error("Vui lòng nhập nội dung đánh giá");
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
        message.success("Đã gửi đánh giá thành công!");
        setTimeout(() => {
          navigate(`/buyer/products/${productId}`);
        }, 1000);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Gửi đánh giá thất bại");
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
      <div className="p-6 max-w-2xl mx-auto text-center space-y-6">
        {state.error ? (
          <Card className="bg-red-50 border-red-200">
            <p className="text-red-800 font-medium italic">{state.error}</p>
          </Card>
        ) : (
          <EmptyState title="Không tìm thấy sản phẩm" description="Sản phẩm bạn đang đánh giá không tồn tại hoặc đã bị gỡ bỏ." />
        )}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/products")}
          className="rounded-xl border-pink-100"
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/buyer/products/${productId}`)}
          type="text"
          className="rounded-xl border-border/60 bg-white/50 text-slate-500 transition-soft hover:border-primary hover:text-primary px-4 py-2 h-auto"
        >
          Quay lại sản phẩm
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Chia sẻ trải nghiệm</Text>
          <div className="h-px flex-1 bg-pink-100/50" />
        </div>
        <Title className="!m-0 !font-display !text-4xl !font-bold uppercase tracking-tight text-text-dark">Đánh giá sản phẩm</Title>
        <Paragraph className="text-lg font-medium text-slate-400 opacity-80 italic">"{state.product.name}"</Paragraph>
      </div>

      <Row gutter={[48, 48]}>
        <Col xs={24} lg={14}>
          <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="space-y-8"
              size="large"
            >
              <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Mức độ hài lòng</span>} required>
                <div className="flex items-center gap-6 rounded-2xl bg-slate-50 p-6 border border-slate-100">
                  <Rate
                    value={state.rating}
                    onChange={(value) => setState((prev) => ({ ...prev, rating: value }))}
                    className="!text-3xl !text-yellow-400"
                  />
                  <span className="font-display text-lg font-bold text-slate-400">
                    {state.rating > 0 ? `${state.rating} / 5 điểm` : "Chọn số sao"}
                  </span>
                </div>
              </Form.Item>

              <Form.Item
                label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tiêu đề đánh giá</span>}
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input
                  placeholder="Ví dụ: Chất lượng tuyệt vời, giao hàng nhanh"
                  value={state.title}
                  className="rounded-2xl border-pink-100"
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Nội dung chi tiết</span>}
                name="description"
                rules={[
                  { required: true, message: "Vui lòng nhập nội dung đánh giá" },
                  {
                    min: 20,
                    message: "Nội dung phải có ít nhất 20 ký tự",
                  },
                ]}
              >
                <Input.TextArea
                  placeholder="Chia sẻ cảm nhận của bạn về chất liệu, form dáng, tình trạng sản phẩm..."
                  rows={6}
                  className="rounded-2xl border-pink-100 p-4"
                  value={state.description}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </Form.Item>

              <Form.Item label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Hình ảnh / Video thực tế</span>}>
                <div className="space-y-4">
                  <Upload
                    accept="image/*,video/*"
                    maxCount={5}
                    listType="picture-card"
                    beforeUpload={(file) => {
                      handleMediaUpload(file);
                      return false;
                    }}
                    disabled={state.uploadingMedia}
                    className="luxury-upload"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <CameraOutlined className="text-2xl text-primary/40" />
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thêm ảnh</div>
                    </div>
                  </Upload>
                </div>
              </Form.Item>

              <div className="pt-6">
                <Button
                  type="primary"
                  size="large"
                  block
                  htmlType="submit"
                  loading={state.isSubmitting}
                  className="h-16 rounded-2xl font-black shadow-luxury text-lg"
                >
                  GỬI ĐÁNH GIÁ NGAY
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10} className="space-y-8">
          <Card className="rounded-[2.5rem] border-blue-100 bg-blue-50/30 p-10 backdrop-blur-md shadow-sm">
            <h3 className="font-display text-xl font-black uppercase tracking-tight text-blue-900 mb-6 flex items-center gap-3">
              <StarFilled className="text-yellow-400" /> Tips cho đánh giá tốt
            </h3>
            <ul className="space-y-4">
              {[
                "Mô tả chi tiết về cảm giác khi mặc sản phẩm.",
                "Đính kèm ảnh thực tế giúp cộng đồng tin tưởng hơn.",
                "Nhận xét về độ chính xác của mô tả so với thực tế.",
                "Góp ý chân thành giúp Re:Wear nâng cao chất lượng.",
                "Sử dụng ngôn từ lịch sự và văn minh."
              ].map((tip, i) => (
                <li key={i} className="flex gap-4 text-sm font-medium text-blue-800/80 leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          <div className="rounded-[2.5rem] border border-pink-100/50 bg-white/40 p-8 text-center backdrop-blur-sm">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary text-2xl">
               <ShoppingCartOutlined />
             </div>
             <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Cảm ơn bạn đã tin tưởng Re:Wear</div>
          </div>
        </Col>
      </Row>
    </div>
  );
}
