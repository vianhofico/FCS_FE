/**
 * Product List Page (Buyer)
 * Browse and search products with comprehensive filtering and sorting
 */

import {
  ArrowRightOutlined,
  ClearOutlined,
  FilterOutlined,
  FireOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  SortAscendingOutlined,
  StarFilled,
} from "@ant-design/icons";
import {
  Card,
  Col,
  Drawer,
  Input,
  Pagination,
  Row,
  Select,
  Slider,
  Space,
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import heroImage from "@/assets/buyer-hero-start.jpg";
import { productApi } from "@/modules/product/api/productApi";
import { Button, EmptyState, GradeBadge } from "@/shared/ui";
import type { ProductCategory, ProductQuery, ProductSummary } from "@/shared/contracts/productContract";

const { Title, Text, Paragraph } = Typography;

interface BuyerProductListPageState {
  products: ProductSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  filters: Omit<ProductQuery, "page" | "size">;
  categories: ProductCategory[];
  categoriesLoading: boolean;
  sortBy: string; // "newest" | "price_asc" | "price_desc"
}

export default function BuyerProductListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [state, setState] = useState<BuyerProductListPageState>({
    products: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    filters: {
      keyword: searchParams.get("q") || "",
      minPrice: 0,
      maxPrice: 100000000,
      minCondition: 0,
      maxCondition: 100,
      status: "SELLING",
      brandId: undefined,
      categoryId: undefined,
      categoryIds: [],
    },
    categories: [],
    categoriesLoading: false,
    sortBy: "newest",
  });

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setState((prev) => ({ ...prev, categoriesLoading: true }));
        const categoriesRes = await productApi.getCategories();
        if (categoriesRes.success && categoriesRes.data) {
          setState((prev) => ({
            ...prev,
            categories: Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.content || [],
            categoriesLoading: false,
          }));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        setState((prev) => ({ ...prev, categoriesLoading: false }));
      }
    };
    loadCategories();
  }, []);

  // Load products on filters or page change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        let sortParam = "";
        if (state.sortBy === "price_asc") {
          sortParam = "salePrice,asc";
        } else if (state.sortBy === "price_desc") {
          sortParam = "salePrice,desc";
        } else {
          sortParam = "createdAt,desc"; // newest
        }

        const query: ProductQuery = {
          ...state.filters,
          page: state.page,
          size: state.size,
          sort: sortParam,
        };

        const response = await productApi.getProducts(query);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            products: response.data.content,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load products";
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
      }
    };

    fetchProducts();
  }, [state.page, state.size, state.filters, state.sortBy]);

  const handleSearch = (keyword: string) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, keyword },
      page: 0,
    }));
  };

  const handlePriceChange = (values: [number, number]) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, minPrice: values[0], maxPrice: values[1] },
      page: 0,
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setState((prev) => {
      const selectedCategoryIds = prev.filters.categoryIds || [];
      const categoryIds = selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter((id) => id !== categoryId)
        : [...selectedCategoryIds, categoryId];

      return {
        ...prev,
        filters: { ...prev.filters, categoryIds, categoryId: undefined },
        page: 0,
      };
    });
  };

  const handleClearCategories = () => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, categoryIds: [], categoryId: undefined },
      page: 0,
    }));
  };

  const handleResetFilters = () => {
    setState((prev) => ({
      ...prev,
      filters: {
        keyword: "",
        minPrice: 0,
        maxPrice: 100000000,
        minCondition: 0,
        maxCondition: 100,
        status: "SELLING",
        brandId: undefined,
        categoryId: undefined,
        categoryIds: [],
      },
      sortBy: "newest",
      page: 0,
    }));
  };

  const getConditionLabel = (condition: number) => {
    if (condition >= 90) return "S (Mới)";
    if (condition >= 80) return "A (Tuyệt vời)";
    if (condition >= 65) return "B (Tốt)";
    return "C (Khá)";
  };

  const productGrid = (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {state.products.map((product) => (
        <Card
          key={product.id}
          hoverable
          className="group flex h-full flex-col overflow-hidden rounded-3xl border-border/40 bg-white transition-premium hover:shadow-luxury"
          styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '14px 16px' } }}
          cover={
            <div className="relative aspect-square overflow-hidden bg-bg-secondary">
              {product.imageUrl ? (
                <img
                  alt={product.name}
                  src={product.imageUrl}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 text-slate-300 text-sm">
                  Không có ảnh
                </div>
              )}
              <div className="absolute top-3 left-3 z-10">
                <GradeBadge grade={getConditionLabel(product.conditionPercent ?? product.condition ?? 0).split(" ")[0]} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button
                  shape="circle"
                  icon={<ShoppingCartOutlined />}
                  className="translate-y-4 scale-110 border-none bg-white/90 transition-premium group-hover:translate-y-0 hover:!bg-primary hover:!text-white flex items-center justify-center w-10 h-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/buyer/products/${product.id}`);
                  }}
                />
              </div>
            </div>
          }
          onClick={() => navigate(`/buyer/products/${product.id}`)}
        >
          <div className="flex flex-col gap-1">
            {product.brandName && (
              <Text className="block truncate text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {product.brandName}
              </Text>
            )}
            <Title level={5} className="!m-0 !line-clamp-2 !font-display !text-base !font-bold !leading-snug !text-slate-800 transition-soft group-hover:!text-primary">
              {product.name}
            </Title>
            <div className="mt-1 flex items-baseline gap-2">
              <Text className="text-base font-black text-primary">
                {product.salePrice.toLocaleString()}₫
              </Text>
              {product.originalPrice && product.originalPrice > product.salePrice && (
                <Text delete className="text-[11px] text-slate-300">
                  {product.originalPrice.toLocaleString()}₫
                </Text>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const filterContent = (
    <div className="space-y-10">
      <div>
        <Title level={5} className="!mb-6 !font-display border-b border-border/60 pb-3">Tìm kiếm</Title>
        <Input
          prefix={<SearchOutlined className="text-primary/40" />}
          placeholder="Tên sản phẩm, thương hiệu..."
          value={state.filters.keyword}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded-2xl border-border bg-bg-main"
        />
      </div>

      <div>
        <Title level={5} className="!mb-6 !font-display border-b border-border/60 pb-3">Danh mục</Title>
        <div className="flex flex-wrap gap-2">
          <Button
            className={`rounded-full px-4 text-xs uppercase tracking-wider transition-soft ${
              (state.filters.categoryIds || []).length === 0
                ? "!border-primary bg-primary/5 font-black text-primary shadow-sm ring-1 ring-primary/20"
                : "border-border font-bold text-slate-500"
            }`}
            onClick={handleClearCategories}
          >
            Tất cả
          </Button>
          {state.categories.map((cat) => {
            const isSelected = (state.filters.categoryIds || []).includes(cat.id);
            return (
              <Button
                key={cat.id}
                className={`rounded-full px-4 text-xs uppercase tracking-wider transition-soft ${
                  isSelected
                    ? "!border-primary bg-primary/5 font-black text-primary shadow-sm ring-1 ring-primary/20"
                    : "border-border font-bold text-slate-500"
                }`}
                onClick={() => handleCategoryToggle(cat.id)}
              >
                {cat.name}
              </Button>
            );
          })}
        </div>
      </div>

      <div>
        <Title level={5} className="!mb-6 !font-display border-b border-border/60 pb-3">Khoảng giá</Title>
        <Slider
          range
          min={0}
          max={10000000}
          step={500000}
          value={[state.filters.minPrice || 0, state.filters.maxPrice || 10000000]}
          onChange={handlePriceChange}
          className="luxury-slider"
        />
        <div className="mt-4 flex justify-between text-[11px] font-black text-slate-400">
          <span>{state.filters.minPrice?.toLocaleString()}₫</span>
          <span>{state.filters.maxPrice?.toLocaleString()}₫</span>
        </div>
      </div>

      <Button
        type="link"
        danger
        block
        icon={<ClearOutlined />}
        className="font-black uppercase tracking-widest text-xs"
        onClick={handleResetFilters}
      >
        Xóa tất cả bộ lọc
      </Button>
    </div>
  );

  return (
    <div className="responsive-page">
      <section className="page-hero">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-pink-100/40 blur-3xl" />
        <Row gutter={[48, 48]} align="middle" className="relative z-10">
          <Col xs={24} lg={12}>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-2">
                <FireOutlined className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Thời trang ký gửi thế hệ mới</span>
              </div>

              <div className="space-y-2">
                <Title className="page-title uppercase">
                  Phong cách
                </Title>
                <Title className="page-title !font-light italic !text-primary uppercase">
                  thời trang bền vững
                </Title>
                <Title className="page-title uppercase">
                  cho Gen Z.
                </Title>
              </div>

              <Paragraph className="page-subtitle">
                Nền tảng mua sắm thời trang ký gửi Local Brand dành cho giới trẻ.
              </Paragraph>

              <Space size="middle" className="flex w-full flex-wrap">
                <Button type="primary" size="large" className="h-12 rounded-2xl px-7 font-black shadow-luxury sm:px-8">
                  Khám phá ngay <ArrowRightOutlined />
                </Button>
                <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-pink-100 bg-white/70 px-4 py-3 shadow-sm backdrop-blur sm:rounded-full sm:px-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
                    <StarFilled />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary/70">Ra mắt mới</div>
                    <div className="text-sm font-black text-slate-800">Sau 02 Ngày : 14 Giờ</div>
                  </div>
                </div>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={12}>
            <div className="relative mx-auto max-w-xl overflow-hidden rounded-[2rem] shadow-2xl shadow-pink-200/50 sm:rounded-[3rem] lg:ml-auto">
              <img loading="lazy" src={heroImage} alt="Thời trang ký gửi thế hệ mới" className="aspect-[4/5] w-full object-cover" />
            </div>
          </Col>
        </Row>
      </section>

      <div className="flex flex-col gap-10 md:flex-row">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-32 rounded-[2rem] border border-border/60 bg-white/50 p-8 backdrop-blur-md">
            {filterContent}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          <div className="responsive-toolbar items-start md:items-end">
            <div className="space-y-2">
              <Title className="!m-0 !font-display !text-2xl !font-black uppercase tracking-tight sm:!text-3xl">Bộ sưu tập mới</Title>
              <Text className="text-sm font-medium text-slate-400">Đã kiểm định chất lượng: {state.totalElements} sản phẩm</Text>
            </div>

            <Space size={12} className="w-full flex-wrap sm:w-auto">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowMobileFilters(true)}
                className="flex h-11 items-center rounded-xl border-border bg-white font-bold text-slate-500 lg:hidden"
              >
                Bộ lọc
              </Button>
              <Select
                value={state.sortBy}
                onChange={(val) => setState(prev => ({ ...prev, sortBy: val, page: 0 }))}
                className="h-11 min-w-full sm:min-w-[200px]"
                suffixIcon={<SortAscendingOutlined className="text-primary" />}
                options={[
                  { label: "Mới nhất", value: "newest" },
                  { label: "Giá: Thấp đến Cao", value: "price_asc" },
                  { label: "Giá: Cao đến Thấp", value: "price_desc" },
                ]}
              />
            </Space>
          </div>

          <Spin spinning={state.isLoading} size="large">
            {state.products.length > 0 ? (
              <>
                {productGrid}
                <div className="mt-16 flex justify-center pb-10">
                  <Pagination
                    current={state.page + 1}
                    pageSize={state.size}
                    total={state.totalElements}
                    onChange={(p) => setState(prev => ({ ...prev, page: p - 1 }))}
                    showSizeChanger={false}
                    className="luxury-pagination"
                  />
                </div>
              </>
            ) : (
              <EmptyState
                title="Không tìm thấy sản phẩm"
                description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm thấy món đồ ưng ý."
                action={
                  <Button type="primary" onClick={handleResetFilters}>
                    Xóa tất cả bộ lọc
                  </Button>
                }
              />
            )}
          </Spin>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={<Title level={4} className="!m-0 !font-display uppercase">Bộ lọc tìm kiếm</Title>}
        placement="left"
        onClose={() => setShowMobileFilters(false)}
        open={showMobileFilters}
        size={360}
        className="rounded-r-[2rem]"
      >
        <div className="p-1 sm:p-2">{filterContent}</div>
      </Drawer>
    </div>
  );
}
