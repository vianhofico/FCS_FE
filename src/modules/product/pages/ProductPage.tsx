/**
 * ProductPage (Manager/Admin)
 * Manage product lifecycle: READY_TO_LIST → SELLING, SELLING → ARCHIVED/HOLD
 */

import { useState, useEffect, useCallback } from "react";
import {
  App, Card, Col, Descriptions, Drawer, Form, Input, InputNumber,
  Modal, Pagination, Row, Select, Space, Spin, Table, Tag, Tooltip, Typography,
} from "antd";
import {
  CheckCircleOutlined, EditOutlined, EyeOutlined, PauseCircleOutlined,
  ShopOutlined, StopOutlined,
} from "@ant-design/icons";
import { productApi } from "@/modules/product/api/productApi";
import type { ProductSummary, ProductDetail } from "@/shared/contracts/productContract";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph, Text } = Typography;

const STATUS_CONFIG: Record<string, { label: string; badge: string; color: string }> = {
  DRAFT:         { label: "Nháp",            badge: "Inactive",   color: "default" },
  READY_TO_LIST: { label: "Chờ niêm yết",    badge: "Pending",    color: "blue" },
  SELLING:       { label: "Đang bán",         badge: "Verified",   color: "green" },
  RESERVED:      { label: "Đã đặt cọc",       badge: "Processing", color: "orange" },
  SOLD:          { label: "Đã bán",           badge: "Inactive",   color: "purple" },
  HOLD:          { label: "Tạm giữ",          badge: "Pending",    color: "gold" },
  RETURNED:      { label: "Đã trả lại",       badge: "Rejected",   color: "red" },
  ARCHIVED:      { label: "Lưu trữ",          badge: "Inactive",   color: "default" },
};

const TRANSITION_ACTIONS: Record<string, Array<{ status: string; label: string; className: string }>> = {
  READY_TO_LIST: [
    { status: "SELLING",  label: "Niêm yết ngay",  className: "bg-emerald-50 font-bold text-emerald-600 border-none" },
    { status: "ARCHIVED", label: "Lưu trữ",         className: "bg-slate-50 font-bold text-slate-500 border-none" },
  ],
  SELLING: [
    { status: "HOLD",     label: "Tạm giữ",         className: "bg-amber-50 font-bold text-amber-600 border-none" },
    { status: "ARCHIVED", label: "Thu hồi/Lưu trữ", className: "bg-red-50 font-bold text-red-500 border-none" },
  ],
  ARCHIVED: [
    { status: "READY_TO_LIST", label: "Niêm yết lại",  className: "bg-emerald-50 font-bold text-emerald-600 border-none" },
    { status: "SELLING",       label: "Bán ngay",       className: "bg-blue-50 font-bold text-blue-600 border-none" },
  ],
  HOLD: [
    { status: "SELLING",  label: "Bán lại",          className: "bg-emerald-50 font-bold text-emerald-600 border-none" },
    { status: "RETURNED", label: "Trả lại seller",   className: "bg-red-50 font-bold text-red-500 border-none" },
  ],
};

const PAGE_SIZE = 20;

export function ProductPage() {
  const { message } = App.useApp();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState("");

  // Detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editForm] = Form.useForm();
  const [editSaving, setEditSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.getProducts({
        status: statusFilter as any,
        keyword: keyword || undefined,
        page,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      });
      if (res.success && res.data) {
        setProducts(res.data.content);
        setTotal(res.data.totalElements);
      }
    } catch { message.error("Không thể tải danh sách sản phẩm"); }
    finally { setLoading(false); }
  }, [page, statusFilter, keyword]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openDetail = async (id: string) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await productApi.getProductDetail(id);
      if (res.success) setSelected(res.data);
    } catch { message.error("Không thể tải chi tiết sản phẩm"); }
    finally { setDetailLoading(false); }
  };

  const changeStatus = async (productId: string, status: string) => {
    try {
      const res = await productApi.updateProductStatus(productId, { status: status as any });
      if (res.success) {
        message.success(`Sản phẩm → ${STATUS_CONFIG[status]?.label ?? status}`);
        setProducts((p) => p.map((pr) => pr.id === productId ? { ...pr, status: status as any } : pr));
        if (selected?.id === productId) setSelected((s) => s ? { ...s, status: status as any } : s);
      }
    } catch (e) { message.error(e instanceof Error ? e.message : "Cập nhật thất bại"); }
  };

  const confirmChangeStatus = (productId: string, status: string, label: string) => {
    const needsConfirm = ["ARCHIVED", "RETURNED", "HOLD"].includes(status);
    if (!needsConfirm) {
      changeStatus(productId, status);
      return;
    }
    Modal.confirm({
      title: `Xác nhận: ${label}`,
      content: `Bạn có chắc muốn chuyển sản phẩm sang "${STATUS_CONFIG[status]?.label}"?`,
      okText: label,
      okType: status === "ARCHIVED" || status === "RETURNED" ? "danger" : "primary",
      cancelText: "Hủy",
      onOk: () => changeStatus(productId, status),
    });
  };

  const handleEditSave = async (values: any) => {
    if (!selected) return;
    setEditSaving(true);
    try {
      const res = await productApi.updateProduct(selected.id, {
        ...values,
        sku: selected.sku,
        salePrice: values.salePrice,
      });
      if (res.success) {
        message.success("Đã cập nhật sản phẩm");
        setSelected(res.data);
        setProducts((p) => p.map((pr) => pr.id === selected.id
          ? { ...pr, name: values.name, salePrice: values.salePrice } : pr));
        setEditModal(false);
      }
    } catch { message.error("Cập nhật thất bại"); }
    finally { setEditSaving(false); }
  };

  // Stats
  const readyCount = products.filter((p) => p.status === "READY_TO_LIST").length;
  const sellingCount = products.filter((p) => p.status === "SELLING").length;

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SKU</span>,
      dataIndex: "sku",
      key: "sku",
      render: (sku: string) => <span className="font-mono text-xs text-slate-500">{sku}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tên sản phẩm</span>,
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className="font-bold text-slate-700">{name}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Giá bán</span>,
      dataIndex: "salePrice",
      key: "salePrice",
      render: (price: number) => (
        <span className="font-display font-bold text-primary">
          {Number(price).toLocaleString("vi-VN")}₫
        </span>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Độ mới</span>,
      dataIndex: "conditionPercent",
      key: "condition",
      render: (v: number) => v != null ? (
        <Tag color={v >= 80 ? "green" : v >= 60 ? "orange" : "red"}>{v}%</Tag>
      ) : "—",
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (s: string) => {
        const cfg = STATUS_CONFIG[s] ?? { label: s, badge: "Pending" };
        return <Badge status={cfg.badge as any}>{cfg.label}</Badge>;
      },
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      fixed: "right" as const,
      width: 320,
      render: (_: unknown, r: ProductSummary) => {
        const actions = TRANSITION_ACTIONS[r.status] ?? [];
        return (
          <Space size="small" wrap>
            <Button type="text" size="small" icon={<EyeOutlined />}
              onClick={() => openDetail(r.id)}
              className="rounded-xl bg-pink-50 font-bold text-primary border-none">
              Chi tiết
            </Button>
            {actions.map((a) => (
              <Tooltip key={a.status} title={a.label}>
                <Button type="text" size="small"
                  icon={a.status === "SELLING"
                    ? <CheckCircleOutlined />
                    : a.status === "HOLD"
                    ? <PauseCircleOutlined />
                    : <StopOutlined />}
                  onClick={() => confirmChangeStatus(r.id, a.status, a.label)}
                  className={`rounded-xl ${a.className}`}>
                  {a.label}
                </Button>
              </Tooltip>
            ))}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-14 pb-28">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-3">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-5xl uppercase">
            Quản lý sản phẩm
          </Title>
          <Paragraph className="max-w-lg text-base font-medium text-slate-400 italic">
            Niêm yết sản phẩm đã được duyệt, quản lý trạng thái bán hàng.
          </Paragraph>
        </div>
        {readyCount > 0 && (
          <div className="flex items-center gap-4 rounded-3xl bg-blue-50 px-6 py-3 border border-blue-100">
            <ShopOutlined className="text-2xl text-blue-500" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                Chờ niêm yết
              </div>
              <div className="font-display text-2xl font-bold text-blue-600">{readyCount} sản phẩm</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        {[
          { label: "Chờ niêm yết", count: readyCount, color: "bg-blue-50 text-blue-500" },
          { label: "Đang bán", count: sellingCount, color: "bg-emerald-50 text-emerald-600" },
          { label: "Tổng trong trang", count: products.length, color: "bg-pink-50 text-primary" },
        ].map((s) => (
          <Col xs={24} sm={8} key={s.label}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/60 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black ${s.color}`}>
                  {s.count}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter + Table */}
      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white shadow-sm">
        <div className="mb-4 flex flex-wrap gap-3">
          <Input.Search
            placeholder="Tìm theo tên sản phẩm / SKU..."
            allowClear
            onSearch={(v) => { setKeyword(v); setPage(0); }}
            className="w-72"
          />
          <Select allowClear placeholder="Lọc trạng thái" value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(0); }}
            className="w-52"
            options={Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))}
          />
        </div>

        {!statusFilter && !keyword && (
          <div className="mb-3 rounded-xl bg-blue-50/70 px-4 py-3 text-sm text-blue-600 flex items-center gap-2">
            <ShopOutlined />
            <span>
              Lọc theo <strong>Chờ niêm yết</strong> để thấy các sản phẩm cần được đưa lên bán.
            </span>
          </div>
        )}

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={products.map((p) => ({ ...p, key: p.id }))}
            pagination={false}
            className="luxury-table"
            scroll={{ x: 900 }}
          />
          {!loading && products.length === 0 && (
            <div className="py-16 text-center">
              <EmptyState
                title="Không có sản phẩm"
                description={statusFilter === "READY_TO_LIST"
                  ? "Chưa có sản phẩm nào chờ niêm yết. Hãy tạo sản phẩm từ đơn ký gửi đã duyệt."
                  : "Không tìm thấy sản phẩm phù hợp."}
              />
            </div>
          )}
        </Spin>

        <div className="mt-6 flex justify-center">
          <Pagination current={page + 1} pageSize={PAGE_SIZE} total={total}
            onChange={(p) => setPage(p - 1)} showSizeChanger={false} />
        </div>
      </Card>

      {/* ── Detail Drawer ── */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <span className="font-display font-bold uppercase text-sm">{selected?.name ?? "Chi tiết"}</span>
            {selected && (
              <Badge status={STATUS_CONFIG[selected.status]?.badge as any ?? "Pending"}>
                {STATUS_CONFIG[selected.status]?.label ?? selected.status}
              </Badge>
            )}
          </div>
        }
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={560}
        extra={
          selected && (
            <Space wrap>
              <Button icon={<EditOutlined />}
                onClick={() => {
                  editForm.setFieldsValue({
                    name: selected.name,
                    description: selected.description,
                    salePrice: selected.salePrice,
                    originalPrice: selected.originalPrice,
                    conditionPercent: selected.conditionPercent,
                  });
                  setEditModal(true);
                }}>
                Chỉnh sửa
              </Button>
              {(TRANSITION_ACTIONS[selected.status] ?? []).map((a) => (
                <Button key={a.status} type={a.status === "SELLING" ? "primary" : "default"}
                  danger={["ARCHIVED", "RETURNED"].includes(a.status)}
                  icon={a.status === "SELLING" ? <CheckCircleOutlined /> : <StopOutlined />}
                  onClick={() => confirmChangeStatus(selected.id, a.status, a.label)}>
                  {a.label}
                </Button>
              ))}
            </Space>
          )
        }
      >
        {detailLoading ? (
          <div className="flex h-64 items-center justify-center"><Spin /></div>
        ) : selected ? (
          <div className="space-y-5">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="SKU">
                <span className="font-mono font-bold">{selected.sku}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Tên sản phẩm">
                <span className="font-bold">{selected.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Giá gốc">
                {selected.originalPrice
                  ? `${Number(selected.originalPrice).toLocaleString("vi-VN")}₫`
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Giá bán">
                <span className="font-bold text-primary text-lg">
                  {Number(selected.salePrice).toLocaleString("vi-VN")}₫
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Độ mới">
                {selected.conditionPercent != null ? (
                  <Tag color={Number(selected.conditionPercent) >= 80 ? "green" : "orange"}>
                    {selected.conditionPercent}%
                  </Tag>
                ) : "—"}
              </Descriptions.Item>
              {selected.description && (
                <Descriptions.Item label="Mô tả">{selected.description}</Descriptions.Item>
              )}
              <Descriptions.Item label="Trạng thái">
                <Badge status={STATUS_CONFIG[selected.status]?.badge as any ?? "Pending"}>
                  {STATUS_CONFIG[selected.status]?.label ?? selected.status}
                </Badge>
              </Descriptions.Item>
            </Descriptions>

            {/* Quick-action highlight for READY_TO_LIST */}
            {selected.status === "READY_TO_LIST" && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-xl text-emerald-500 mt-0.5" />
                  <div className="space-y-2">
                    <Text className="font-bold text-emerald-700 text-sm">Sẵn sàng niêm yết!</Text>
                    <Paragraph className="!mb-0 text-xs text-emerald-600">
                      Sản phẩm đã được kiểm định và có đầy đủ thông tin. Nhấn <strong>Niêm yết ngay</strong>
                      để hiển thị cho buyer mua hàng.
                    </Paragraph>
                    <Button type="primary" icon={<CheckCircleOutlined />}
                      onClick={() => changeStatus(selected.id, "SELLING")}
                      className="bg-emerald-500 border-emerald-500 rounded-xl font-bold">
                      Niêm yết ngay
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      {/* ── Edit Modal ── */}
      <Modal open={editModal}
        onCancel={() => { setEditModal(false); editForm.resetFields(); }}
        title={<span className="font-display font-bold uppercase tracking-widest text-sm">Chỉnh sửa sản phẩm</span>}
        footer={null} width={520}>
        <Form form={editForm} layout="vertical" onFinish={handleEditSave} className="mt-4">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
            <Input className="h-11 rounded-xl" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="originalPrice" label="Giá gốc (VND)">
                <InputNumber min={0} className="w-full h-11 rounded-xl"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v!.replace(/,*/g, "") as any} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salePrice" label="Giá bán (VND) *" rules={[{ required: true }]}>
                <InputNumber min={0} className="w-full h-11 rounded-xl"
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(v) => v!.replace(/,*/g, "") as any} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="conditionPercent" label="Độ mới (%)">
            <InputNumber min={0} max={100} suffix="%" className="w-full h-11 rounded-xl" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} className="rounded-xl" />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => { setEditModal(false); editForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={editSaving}>Lưu thay đổi</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
