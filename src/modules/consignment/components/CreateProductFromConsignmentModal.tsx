/**
 * CreateProductFromConsignmentModal
 * Used by ApprovalsPage and ConsignmentPage.
 * Lets the manager pick images from the consignment request, upload new ones,
 * and fill in product details — then creates the product + links images.
 */

import { useState, useEffect } from "react";
import {
  Modal, Form, Row, Col, Input, InputNumber, Select,
  Checkbox, Upload, Image, Spin, Typography,
} from "antd";
import { InboxOutlined, ShopOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import { productApi } from "@/modules/product/api/productApi";
import { brandApi } from "@/modules/catalog/api/brandApi";
import { categoryApi } from "@/modules/catalog/api/categoryApi";
import type { BrandSummary } from "@/modules/catalog/api/brandApi";
import type { CategorySummary } from "@/modules/catalog/api/categoryApi";
import type { ConsignmentItem, MediaAsset } from "@/shared/contracts/consignmentContract";
import { Button } from "@/shared/ui";
import { http } from "@/shared/api/http";
import { endpoints } from "@/shared/api/endpoints";

const { Text } = Typography;
const { Dragger } = Upload;

interface Props {
  open: boolean;
  onClose: () => void;
  requestId: string;
  selectedItem: ConsignmentItem;
  onSuccess: () => void;
  messageApi: { success: (msg: string) => void; error: (msg: string) => void };
}

export function CreateProductFromConsignmentModal({
  open,
  onClose,
  requestId,
  selectedItem,
  onSuccess,
  messageApi,
}: Props) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Catalog
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Consignment images
  const [consignmentImages, setConsignmentImages] = useState<MediaAsset[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

  // New images to upload
  const [newFiles, setNewFiles] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: selectedItem.suggestedName ?? "",
      salePrice: selectedItem.suggestedPrice,
      originalPrice: selectedItem.originalPrice,
      conditionPercent: 80,
    });
    loadCatalog();
    loadConsignmentImages();
  }, [open, selectedItem]);

  const loadCatalog = async () => {
    if (brands.length && categories.length) return;
    setCatalogLoading(true);
    try {
      const [br, ca] = await Promise.all([brandApi.getBrands(), categoryApi.getCategories()]);
      setBrands(Array.isArray(br.data) ? br.data : (br.data as any)?.content ?? []);
      setCategories(Array.isArray(ca.data) ? ca.data : (ca.data as any)?.content ?? []);
    } finally {
      setCatalogLoading(false);
    }
  };

  const loadConsignmentImages = async () => {
    setImagesLoading(true);
    try {
      const res = await consignmentApi.getMediaByRequest(requestId);
      const images = res.data ?? [];
      setConsignmentImages(images);
      // Pre-select all images by default
      setSelectedImageIds(images.map((m) => m.id));
    } finally {
      setImagesLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setNewFiles([]);
    setSelectedImageIds([]);
    setConsignmentImages([]);
    onClose();
  };

  const handleFinish = async (values: any) => {
    setSaving(true);
    try {
      const sku = values.sku || `SKU-${Date.now()}`;
      const res = await productApi.createProduct({
        consignmentItemId: selectedItem.id,
        brandId: values.brandId,
        sku,
        name: values.name,
        description: values.description,
        conditionPercent: values.conditionPercent,
        originalPrice: values.originalPrice,
        salePrice: values.salePrice,
        status: "READY_TO_LIST",
      } as any);

      if (!res.success || !res.data) throw new Error("Tạo sản phẩm thất bại");

      const productId = (res.data as any).id;

      // Assign categories
      if (values.categoryIds?.length && productId) {
        await http.put(`${endpoints.products}/${productId}/categories`, {
          categoryIds: values.categoryIds,
        });
      }

      // Register selected consignment images as PRODUCT media
      const selectedImages = consignmentImages.filter((m) => selectedImageIds.includes(m.id));
      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        await http.post(endpoints.media, {
          ownerType: "PRODUCT",
          ownerId: productId,
          mediaType: "IMAGE",
          url: img.url,
          mimeType: img.mimeType,
          sizeBytes: img.sizeBytes,
          displayOrder: i,
          isPrimary: i === 0,
        });
      }

      // Upload new images then register
      const existingCount = selectedImages.length;
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i].originFileObj as File;
        if (!file) continue;
        try {
          const uploadRes = await consignmentApi.uploadImages([file]);
          if (uploadRes.data?.[0]) {
            const u = uploadRes.data[0];
            await http.post(endpoints.media, {
              ownerType: "PRODUCT",
              ownerId: productId,
              mediaType: "IMAGE",
              url: u.url,
              mimeType: u.contentType,
              sizeBytes: u.sizeBytes,
              displayOrder: existingCount + i,
              isPrimary: existingCount === 0 && i === 0,
            });
          }
        } catch {
          // Non-fatal: image upload failed but product created
        }
      }

      // Mark item as CONVERTED_TO_PRODUCT
      await consignmentApi.updateItemStatus(selectedItem.id, { status: "CONVERTED_TO_PRODUCT" as any });

      const totalImages = selectedImages.length + newFiles.length;
      messageApi.success(
        `Tạo sản phẩm thành công! ${totalImages > 0 ? `${totalImages} hình ảnh đã được gắn.` : ""} Sản phẩm đang ở trạng thái READY_TO_LIST.`
      );
      handleClose();
      onSuccess();
    } catch (e) {
      messageApi.error(e instanceof Error ? e.message : "Tạo sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={<span className="font-display font-bold uppercase tracking-widest text-sm">Tạo sản phẩm từ ký gửi</span>}
      footer={null}
      width={720}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        {/* ── Basic Info ── */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="name" label="Tên sản phẩm *" rules={[{ required: true }]}>
              <Input className="h-11 rounded-xl" placeholder="Tên chính thức" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="sku" label="SKU">
              <Input className="h-11 rounded-xl" placeholder="Tự động nếu trống" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="brandId" label="Thương hiệu">
              <Select
                allowClear showSearch optionFilterProp="label"
                loading={catalogLoading}
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
                className="h-11 [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-xl"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="conditionPercent" label="Độ mới (%) *" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} suffix="%" className="w-full h-11 rounded-xl" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="originalPrice" label="Giá gốc (VND)">
              <InputNumber
                min={0} className="w-full h-11 rounded-xl"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => v!.replace(/,*/g, "") as any}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="salePrice" label="Giá bán (VND) *" rules={[{ required: true }]}>
              <InputNumber
                min={0} className="w-full h-11 rounded-xl"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => v!.replace(/,*/g, "") as any}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="categoryIds" label="Danh mục (có thể chọn nhiều)">
          <Select
            mode="multiple" allowClear showSearch optionFilterProp="label"
            loading={catalogLoading}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            className="[&_.ant-select-selector]:!rounded-xl"
          />
        </Form.Item>

        <Form.Item name="description" label="Mô tả sản phẩm">
          <Input.TextArea rows={3} placeholder="Mô tả chi tiết cho buyer..." className="rounded-xl" />
        </Form.Item>

        {/* ── Image Selection ── */}
        <div className="mb-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-3">
            Hình ảnh sản phẩm
          </Text>

          {/* Consignment images */}
          {imagesLoading ? (
            <div className="flex h-24 items-center justify-center">
              <Spin size="small" />
            </div>
          ) : consignmentImages.length > 0 ? (
            <div className="mb-4 rounded-2xl border border-pink-100/50 bg-pink-50/30 p-4">
              <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block mb-3">
                Ảnh từ người ký gửi — chọn ảnh muốn dùng
              </Text>
              <Checkbox.Group
                value={selectedImageIds}
                onChange={(vals) => setSelectedImageIds(vals as string[])}
                className="w-full"
              >
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  <Image.PreviewGroup>
                    {consignmentImages.map((img) => (
                      <div key={img.id} className="relative">
                        <Checkbox value={img.id} className="absolute top-1.5 left-1.5 z-10" />
                        <div
                          className={`overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                            selectedImageIds.includes(img.id)
                              ? "border-primary shadow-md"
                              : "border-transparent opacity-50"
                          }`}
                          onClick={() =>
                            setSelectedImageIds((prev) =>
                              prev.includes(img.id)
                                ? prev.filter((id) => id !== img.id)
                                : [...prev, img.id]
                            )
                          }
                        >
                          <Image
                            src={img.url}
                            className="aspect-square w-full object-cover"
                            preview={{ mask: false }}
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                          />
                        </div>
                      </div>
                    ))}
                  </Image.PreviewGroup>
                </div>
              </Checkbox.Group>
              <Text className="mt-2 block text-[11px] text-slate-400">
                Đã chọn {selectedImageIds.length}/{consignmentImages.length} ảnh
              </Text>
            </div>
          ) : (
            <div className="mb-4 rounded-2xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
              Người ký gửi chưa tải ảnh lên
            </div>
          )}

          {/* New image upload */}
          <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-1">
            <Text className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block px-3 pt-2 mb-2">
              Thêm ảnh mới (tùy chọn)
            </Text>
            <Dragger
              multiple
              accept="image/*"
              listType="picture"
              fileList={newFiles}
              beforeUpload={() => false}
              onChange={({ fileList }) => setNewFiles(fileList)}
              className="!border-0 !bg-transparent"
            >
              <p className="ant-upload-drag-icon"><InboxOutlined className="text-2xl text-primary/50" /></p>
              <p className="text-sm text-slate-400">Kéo thả hoặc click để chọn ảnh thêm</p>
            </Dragger>
          </div>
        </div>

        <div className="rounded-xl bg-violet-50 p-3 text-xs text-violet-600 mb-4">
          Sản phẩm sẽ được tạo ở trạng thái <strong>Chờ niêm yết</strong>.
          Vào trang <strong>Sản phẩm</strong> để chuyển sang <strong>Đang bán</strong>.
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={saving} icon={<ShopOutlined />}>
            Tạo sản phẩm
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
