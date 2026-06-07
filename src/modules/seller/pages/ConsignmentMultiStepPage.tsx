/**
 * Consignment Multi-Step Page (Seller)
 * 4 steps: Thông tin cơ bản → Hình ảnh → Định giá → Xác nhận
 */

import { useEffect, useState } from "react";
import {
  App,
  Form,
  Input,
  InputNumber,
  Typography,
  Steps,
  Card,
  Upload,
  Select,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CameraOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import { categoryApi } from "@/modules/catalog/api/categoryApi";
import { brandApi } from "@/modules/catalog/api/brandApi";
import type { CategorySummary } from "@/modules/catalog/api/categoryApi";
import type { BrandSummary } from "@/modules/catalog/api/brandApi";
import { Button, Badge } from "@/shared/ui";
import { useAuth } from "@/shared/context/AuthContext";

const { Title, Text, Paragraph } = Typography;

interface FormValues {
  name: string;
  categoryId?: string;
  brandId?: string;
  conditionNote: string;
  suggestedPrice?: number;
  originalPrice?: number;
}

export default function ConsignmentMultiStepPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Catalog data
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Upload state
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const steps = [
    { title: "Thông tin cơ bản", icon: <ShoppingOutlined />, description: "Tên, danh mục, thương hiệu" },
    { title: "Hình ảnh thực tế", icon: <CameraOutlined />, description: "Tối đa 8 ảnh" },
    { title: "Định giá & Phí", icon: <DollarOutlined />, description: "Giá gốc & giá đề xuất" },
    { title: "Xác nhận gửi", icon: <SafetyCertificateOutlined />, description: "Hoàn tất" },
  ];

  // Load categories and brands once
  useEffect(() => {
    setCatalogLoading(true);
    Promise.all([categoryApi.getCategories(), brandApi.getBrands()])
      .then(([catRes, brandRes]) => {
        const cats = Array.isArray(catRes.data)
          ? catRes.data
          : (catRes.data as any)?.content ?? [];
        const brs = Array.isArray(brandRes.data)
          ? brandRes.data
          : (brandRes.data as any)?.content ?? [];
        setCategories(cats);
        setBrands(brs);
      })
      .catch(() => {
        // Non-critical — form still usable
      })
      .finally(() => setCatalogLoading(false));
  }, []);

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrent((c) => c + 1);
      window.scrollTo(0, 0);
    } catch {
      /* validation error shown inline */
    }
  };

  const handlePrev = () => {
    setCurrent((c) => c - 1);
    window.scrollTo(0, 0);
  };

  const onFinish = async (values: FormValues) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const allValues: FormValues = { ...form.getFieldsValue(true), ...values };
      const code = `CR-${Date.now()}`;

      // 1. Create consignment request + item atomically
      const res = await consignmentApi.createConsignment({
        consignorId: user.id,
        code,
        status: "SUBMITTED",
        note: allValues.conditionNote,
        suggestedName: allValues.name,
        suggestedPrice: allValues.suggestedPrice,
        originalPrice: allValues.originalPrice,
        suggestedBrandId: allValues.brandId,
        suggestedCategoryId: allValues.categoryId,
        conditionNote: allValues.conditionNote,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message ?? "Tạo yêu cầu thất bại");
      }

      const requestId = res.data.id;

      // 2. Upload ảnh nếu có
      const realFiles = fileList
        .map((f) => f.originFileObj as File | undefined)
        .filter((f): f is File => f instanceof File);

      if (realFiles.length > 0) {
        setUploadingImages(true);
        try {
          const uploadRes = await consignmentApi.uploadImages(realFiles);
          if (uploadRes.success && uploadRes.data?.length) {
            await consignmentApi.registerMedia(
              uploadRes.data.map((u, idx) => ({
                ownerType: "CONSIGNMENT_REQUEST" as const,
                ownerId: requestId,
                url: u.url,
                mimeType: u.contentType,
                sizeBytes: u.sizeBytes,
                displayOrder: idx,
                isPrimary: idx === 0,
              }))
            );
          }
        } catch {
          // Upload failure non-critical — request already created
          message.warning("Yêu cầu đã gửi nhưng tải ảnh thất bại. Bạn có thể thêm ảnh sau.");
        } finally {
          setUploadingImages(false);
        }
      }

      message.success("Gửi yêu cầu ký gửi thành công!");
      navigate("/seller/consignments");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gửi yêu cầu thất bại. Vui lòng thử lại.";
      message.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadProps: UploadProps = {
    listType: "picture-card",
    multiple: true,
    maxCount: 8,
    fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(`${file.name} không phải file ảnh`);
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Ảnh phải nhỏ hơn 5MB");
        return Upload.LIST_IGNORE;
      }
      return false; // prevent auto-upload, we handle manually on submit
    },
    onChange: ({ fileList: newList }) => setFileList(newList),
    className: "luxury-upload-large",
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Form.Item
              name="name"
              label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tên sản phẩm ký gửi *</span>}
              rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
            >
              <Input
                placeholder="Ví dụ: Túi Chanel Classic Flap Medium"
                className="h-14 rounded-2xl border-pink-100"
              />
            </Form.Item>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Form.Item
                name="categoryId"
                label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Danh mục *</span>}
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select
                  placeholder="Chọn danh mục..."
                  loading={catalogLoading}
                  showSearch
                  optionFilterProp="label"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  className="h-14 [&_.ant-select-selector]:!h-14 [&_.ant-select-selector]:!rounded-2xl [&_.ant-select-selector]:!border-pink-100 [&_.ant-select-selection-item]:!leading-[56px]"
                />
              </Form.Item>

              <Form.Item
                name="brandId"
                label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Thương hiệu</span>}
              >
                <Select
                  placeholder="Chọn thương hiệu..."
                  loading={catalogLoading}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                  className="h-14 [&_.ant-select-selector]:!h-14 [&_.ant-select-selector]:!rounded-2xl [&_.ant-select-selector]:!border-pink-100 [&_.ant-select-selection-item]:!leading-[56px]"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="conditionNote"
              label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Mô tả tình trạng & ghi chú *</span>}
              rules={[{ required: true, message: "Vui lòng mô tả sản phẩm" }]}
            >
              <Input.TextArea
                rows={5}
                placeholder="Mô tả chi tiết: độ mới, các vết trầy xước (nếu có), phụ kiện đi kèm (hộp, túi, thẻ bảo hành)..."
                className="rounded-2xl border-pink-100 p-4"
              />
            </Form.Item>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="rounded-[1.75rem] border border-dashed border-pink-200 bg-pink-50/20 p-6 text-center sm:rounded-[2rem] sm:p-8">
              <Upload {...uploadProps}>
                {fileList.length < 8 && (
                  <div className="flex flex-col items-center gap-3 p-2">
                    <CameraOutlined className="text-4xl text-primary/40" />
                    <div>
                      <div className="text-sm font-bold text-slate-700">Tải ảnh sản phẩm</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                        {fileList.length}/8 ảnh • PNG, JPG • tối đa 5MB/ảnh
                      </div>
                    </div>
                  </div>
                )}
              </Upload>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Ảnh chính diện", desc: "Toàn bộ sản phẩm, nền trắng/sáng" },
                { title: "Ảnh chi tiết lỗi", desc: "Vết xước, sờn nếu có" },
                { title: "Ảnh tem/nhãn", desc: "Chứng minh nguồn gốc hãng" },
                { title: "Ảnh phụ kiện", desc: "Hộp, túi vải, thẻ card" },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-pink-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary text-xs font-black">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-700">{tip.title}</div>
                    <div className="text-[10px] text-slate-400 italic">{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {fileList.length === 0 && (
              <p className="text-center text-xs text-slate-400 italic">
                Ảnh là tùy chọn — bạn có thể bỏ qua và thêm sau. Tuy nhiên ảnh thực tế giúp manager duyệt nhanh hơn.
              </p>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Form.Item
                name="originalPrice"
                label={
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">
                    Giá gốc khi mua (VND)
                  </span>
                }
              >
                <InputNumber
                  className="w-full h-14 rounded-2xl border-pink-100 flex items-center luxury-input-number"
                  placeholder="Giá bạn đã mua sản phẩm"
                  min={0}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v!.replace(/,*/g, "") as any}
                  suffix="₫"
                />
              </Form.Item>

              <Form.Item
                name="suggestedPrice"
                label={
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">
                    Giá đề xuất bán (VND) *
                  </span>
                }
                rules={[{ required: true, message: "Vui lòng nhập giá đề xuất" }]}
              >
                <InputNumber
                  className="w-full h-14 rounded-2xl border-pink-100 flex items-center luxury-input-number"
                  placeholder="Giá bạn muốn bán"
                  min={0}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v!.replace(/,*/g, "") as any}
                  suffix="₫"
                />
              </Form.Item>
            </div>

            <Card className="rounded-3xl border-none bg-primary/5 p-6">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary text-xl shadow-sm">
                  <InfoCircleOutlined />
                </div>
                <div className="space-y-3">
                  <Title level={5} className="!m-0 !font-display uppercase tracking-widest text-xs">
                    Cơ cấu hoa hồng Re:Wear
                  </Title>
                  <Paragraph className="!mb-0 text-sm text-slate-500 leading-relaxed">
                    Phí dịch vụ ký gửi được thoả thuận trong hợp đồng sau khi được duyệt.
                    Mức phí chuẩn là <span className="font-bold text-primary">15%</span> giá trị đơn hàng.
                  </Paragraph>
                  <ul className="space-y-1.5">
                    {[
                      "Kiểm định hàng chính hãng chuyên sâu",
                      "Chụp ảnh studio & Niêm yết sản phẩm",
                      "Bảo quản trong kho tiêu chuẩn cao cấp",
                      "Vận chuyển & Chăm sóc khách hàng",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <CheckCircleOutlined className="text-primary/60 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center py-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 text-5xl mb-6">
              <CheckCircleOutlined />
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <Title className="!m-0 !font-display !text-3xl !font-bold uppercase tracking-tight">
                Sẵn sàng gửi yêu cầu
              </Title>
              <Paragraph className="text-lg text-slate-400 italic">
                Đội ngũ Re:Wear sẽ xem xét trong vòng 24–48 giờ làm việc.
              </Paragraph>
            </div>

            <div className="mt-8 space-y-4 rounded-[1.75rem] border border-pink-100 bg-white p-5 text-left sm:rounded-[2.5rem] sm:p-8">
              {[
                { label: "Sản phẩm", value: form.getFieldValue("name") },
                {
                  label: "Danh mục",
                  value: categories.find((c) => c.id === form.getFieldValue("categoryId"))?.name ?? "—",
                },
                {
                  label: "Thương hiệu",
                  value: brands.find((b) => b.id === form.getFieldValue("brandId"))?.name ?? "—",
                },
                {
                  label: "Giá gốc",
                  value: form.getFieldValue("originalPrice")
                    ? `${Number(form.getFieldValue("originalPrice")).toLocaleString()}₫`
                    : "—",
                },
                {
                  label: "Giá đề xuất",
                  value: `${(form.getFieldValue("suggestedPrice") || 0).toLocaleString()}₫`,
                },
                {
                  label: "Số ảnh đính kèm",
                  value: `${fileList.length} ảnh`,
                },
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  className={`flex flex-wrap justify-between gap-3 ${i < arr.length - 1 ? "border-b border-pink-50 pb-4" : ""}`}
                >
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</Text>
                  <Text className="font-bold text-slate-800">{value}</Text>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isLoading = isSubmitting || uploadingImages;

  return (
    <div className="responsive-page max-w-[1200px]">
      <div className="responsive-toolbar items-start lg:items-end">
        <div className="space-y-4">
          <Title className="page-title uppercase">Ký gửi sản phẩm</Title>
          <Paragraph className="page-subtitle italic">
            Chia sẻ những tuyệt tác thời trang của bạn. Quy trình minh bạch và chuyên nghiệp.
          </Paragraph>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/seller/consignments")}
          className="h-12 w-full rounded-xl border-pink-100 px-6 font-bold text-slate-400 hover:border-primary sm:w-auto"
        >
          HỦY BỎ
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="rounded-[1.5rem] border border-pink-100/50 bg-white/70 p-4 sm:rounded-[2rem] sm:p-5 lg:sticky lg:top-32 lg:border-none lg:bg-transparent lg:p-0">
            <Steps
              responsive
              orientation="vertical"
              current={current}
              className="luxury-steps"
              items={steps.map((s) => ({
                title: <span className="font-display text-xs font-black uppercase tracking-widest">{s.title}</span>,
                content: <span className="text-[10px] font-medium text-slate-400 italic">{s.description}</span>,
                icon: s.icon,
              }))}
            />
          </div>
        </div>

        <div className="lg:col-span-8">
          <Card className="responsive-card flex min-h-[520px] flex-col border-pink-100/40 p-1 shadow-luxury sm:min-h-[560px] sm:p-4 lg:p-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="flex-1"
            >
              <div className="mb-8">
                <Badge status={current === 3 ? "Verified" : "Pending"}>
                  BƯỚC {current + 1} / 4
                </Badge>
              </div>

              {renderStepContent()}

              <div className="mt-10 flex flex-col gap-4 border-t border-pink-50 pt-6 sm:mt-14 sm:flex-row sm:pt-8">
                {current > 0 && (
                  <Button
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={handlePrev}
                    disabled={isLoading}
                    className="h-14 rounded-2xl border-pink-100 px-8 font-bold text-slate-400"
                  >
                    QUAY LẠI
                  </Button>
                )}
                {current < steps.length - 1 ? (
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleNext}
                    className="h-14 rounded-2xl font-black shadow-luxury tracking-widest text-sm"
                  >
                    TIẾP THEO <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    loading={isLoading}
                    className="h-14 rounded-2xl font-black shadow-luxury tracking-widest text-sm"
                    icon={isLoading && uploadingImages ? <LoadingOutlined /> : undefined}
                  >
                    {uploadingImages ? "ĐANG TẢI ẢNH..." : "GỬI YÊU CẦU KÝ GỬI"}
                  </Button>
                )}
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
