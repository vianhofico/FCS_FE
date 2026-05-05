/**
 * My Products Page (Seller)
 * View and manage seller's consigned products
 */

import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Card,
  Col,
  Input,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { productApi } from "@/modules/product/api/productApi";
import { useAuth } from "@/shared/context/AuthContext";
import { Badge, Button, EmptyState } from "@/shared/ui";
import type { ProductStatus } from "@/shared/contracts/commonContract";
import type { ProductSummary } from "@/shared/contracts/productContract";

const { Title, Paragraph } = Typography;

interface PageState {
  products: ProductSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
  filters: {
    search: string;
    status: string;
  };
}

export default function MyProductsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({
    products: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
    filters: {
      search: "",
      status: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    const fetchProducts = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await productApi.getProducts({
          keyword: state.filters.search || undefined,
          status: state.filters.status ? (state.filters.status as ProductStatus) : undefined,
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            products: response.data?.content || [],
            total: response.data?.totalElements || 0,
            isLoading: false,
          }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false, error: "Không thể tải danh sách sản phẩm" }));
      }
    };
    fetchProducts();
  }, [user, state.page, state.size, state.filters]);

  const columns = [
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</span>,
      key: "product",
      render: (_: any, record: ProductSummary) => (
        <div className="flex items-center gap-4 py-2">
          <Avatar
            shape="square"
            size={64}
            src={record.imageUrl}
            className="rounded-2xl border border-border/40 bg-bg-secondary shadow-sm"
          />
          <div>
            <p className="font-display text-base font-black text-slate-800">{record.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">{record.sku}</p>
          </div>
        </div>
      ),
    },
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Giá bán</span>,
      key: "price",
      render: (_: any, record: ProductSummary) => (
        <span className="font-display text-lg font-black text-slate-700">{record.salePrice.toLocaleString()}₫</span>
      ),
    },
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Độ mới</span>,
      key: "condition",
      render: (_: any, record: ProductSummary) => {
        const condition = record.conditionPercent ?? record.condition;
        return (
          <Tag color="success" className="inline-flex items-center rounded-full border-0 px-3.5 py-1 text-[10px] font-bold uppercase leading-5 tracking-wider">
            {condition != null ? `${condition}/100` : "—"}
          </Tag>
        );
      },
    },
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái</span>,
      key: "status",
      render: (_: unknown, record: ProductSummary) => {
        const statusMap: Record<string, string> = {
          SELLING: "Active",
          RESERVED: "OnlineReview",
          SOLD: "Verified",
          HOLD: "Pending",
          READY_TO_LIST: "Pending",
          RETURNED: "Inactive",
          ARCHIVED: "Rejected",
          DRAFT: "Pending",
        };
        return (
          <Badge status={statusMap[record.status] || "Pending"}>{record.status}</Badge>
        );
      },
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      fixed: "right" as const,
      width: 150,
      render: (_: any, record: ProductSummary) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/seller/products/${record.id}`)}
            className="text-slate-400 hover:!text-primary"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            disabled
            title="Chức năng chỉnh sửa sản phẩm chưa được hỗ trợ"
            className="text-slate-300"
          />
          <Popconfirm title="Xóa sản phẩm này?" okText="Xác nhận" cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />} className="hover:!bg-red-50" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = [
    { label: "Tổng sản phẩm", value: state.total, icon: <ShoppingOutlined />, color: "bg-blue-50 text-blue-500" },
    { label: "Đang niêm yết", value: state.products.filter(p => p.status === 'SELLING').length, icon: <EyeOutlined />, color: "bg-emerald-50 text-emerald-500" },
    { label: "Bản nháp", value: state.products.filter(p => p.status === 'DRAFT').length, icon: <EditOutlined />, color: "bg-orange-50 text-orange-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-black !leading-tight !tracking-tight md:!text-6xl uppercase">Kho hàng của tôi</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80">
            Quản lý các tuyệt tác thời trang của bạn và theo dõi trạng thái niêm yết trên Re:Wear.
          </Paragraph>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate("/seller/products/new")}
          className="h-14 rounded-2xl px-10 font-black shadow-luxury uppercase tracking-widest text-xs"
        >
          THÊM SẢN PHẨM MỚI
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={8}>
            <Card className="rounded-[2rem] border-border/40 bg-white/50 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
                  <div className="font-display text-3xl font-black text-slate-800">{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-border/60 bg-white p-4 shadow-sm">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center">
          <Input
            prefix={<SearchOutlined className="text-primary/40" />}
            placeholder="Tìm theo tên hoặc SKU..."
            value={state.filters.search}
            onChange={(e) => setState(prev => ({ ...prev, filters: { ...prev.filters, search: e.target.value }, page: 0 }))}
            className="h-12 max-w-sm rounded-2xl bg-bg-main"
          />
          <Select
            placeholder="Tất cả trạng thái"
            allowClear
            className="h-12 min-w-[200px]"
            onChange={(val) => setState(prev => ({ ...prev, filters: { ...prev.filters, status: val || "" }, page: 0 }))}
            options={[
              { label: "Sẵn sàng niêm yết", value: "READY_TO_LIST" },
              { label: "Đang niêm yết", value: "SELLING" },
              { label: "Đã giữ chỗ", value: "RESERVED" },
              { label: "Đã bán", value: "SOLD" },
            ]}
          />
        </div>

        <Spin spinning={state.isLoading && state.products.length === 0}>
          <Table
            columns={columns}
            dataSource={state.products.map(p => ({ ...p, key: p.id }))}
            pagination={false}
            scroll={{ x: 900 }}
            className="luxury-table"
          />
          <div className="mt-10 flex justify-center">
            <Pagination
              current={state.page + 1}
              pageSize={state.size}
              total={state.total}
              onChange={(p) => setState(prev => ({ ...prev, page: p - 1 }))}
              showSizeChanger={false}
              className="luxury-pagination"
            />
          </div>
          {state.products.length === 0 && !state.isLoading && (
            <div className="py-20 text-center">
              <EmptyState
                title="Chưa có sản phẩm nào trong kho"
                description="Hãy bắt đầu hành trình ký gửi món đồ đầu tiên của bạn để làm mới phong cách cho cộng đồng."
                action={
                  <Button type="primary" onClick={() => navigate("/seller/products/new")}>
                    Đăng bán ngay
                  </Button>
                }
              />
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
}
