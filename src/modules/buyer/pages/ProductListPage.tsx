/**
 * Product List Page (Buyer)
 * Browse and search products with comprehensive filtering and sorting
 */

import {
  ClearOutlined,
  FilterOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  SortAscendingOutlined,
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

import { productApi } from "@/modules/product/api/productApi";
import { Badge, Button, EmptyState, GradeBadge } from "@/shared/ui";
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

const HERO_IMAGE = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

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

  const handleCategoryChange = (categoryId: string | undefined) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, categoryId },
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
    <Row gutter={[24, 32]}>
      {state.products.map((product) => (
        <Col xs={24} sm={12} md={8} key={product.id}>
          <Card
            hoverable
            className="group overflow-hidden rounded-3xl border-border/40 bg-white transition-premium hover:shadow-luxury"
            cover={
              <div className="relative aspect-[3/4] overflow-hidden bg-bg-secondary">
                {product.imageUrl ? (
                  <img
                    alt={product.name}
                    src={product.imageUrl}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-slate-300">
                    Không có ảnh
                  </div>
                )}
                <div className="absolute top-4 left-4 z-10">
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
                  {product.sku}
                </Text>
                <Badge status="Active">{getConditionLabel(product.conditionPercent ?? product.condition ?? 0)}</Badge>
              </div>
              <Title level={5} className="!m-0 !line-clamp-1 !font-display !font-bold !text-text-dark group-hover:text-primary transition-soft">
                {product.name}
              </Title>
              <div className="flex items-baseline gap-2">
                <Text className="text-lg font-black text-primary">
                  {product.salePrice.toLocaleString()}₫
                </Text>
                {product.originalPrice && product.originalPrice > product.salePrice && (
                  <Text delete className="text-xs font-medium text-slate-300">
                    {product.originalPrice.toLocaleString()}₫
                  </Text>
                )}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
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
            className={`rounded-full px-4 text-xs font-bold uppercase tracking-wider transition-soft ${
              !state.filters.categoryId ? "bg-primary text-white border-none" : "border-border text-slate-500"
            }`}
            onClick={() => handleCategoryChange(undefined)}
          >
            Tất cả
          </Button>
          {state.categories.map((cat) => (
            <Button
              key={cat.id}
              className={`rounded-full px-4 text-xs font-bold uppercase tracking-wider transition-soft ${
                state.filters.categoryId === cat.id ? "bg-primary text-white border-none" : "border-border text-slate-500"
              }`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
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
    <div className="space-y-12">
      {/* Banner Section */}
      <section className="group relative h-[380px] overflow-hidden rounded-[2.5rem] shadow-luxury">
        <img src={HERO_IMAGE} alt="Luxury Banner" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent">
          <div className="flex h-full flex-col justify-center px-8 md:px-16 lg:max-w-2xl">
            <Text className="animate-reveal text-[10px] font-black uppercase tracking-[0.4em] text-primary">Ký gửi thời trang cao cấp</Text>
            <Title className="!mt-4 !mb-6 !font-display !text-4xl !font-black !leading-tight !tracking-tight md:!text-5xl uppercase animate-reveal delay-100">
              Phong cách bền vững, <br />
              <span className="italic font-light text-primary/80 lowercase">giá trị vượt thời gian.</span>
            </Title>
            <Paragraph className="animate-reveal delay-200 text-lg font-medium text-slate-500/80">
              Khám phá những món đồ Local Brand đã qua tuyển chọn kỹ lưỡng, đảm bảo độ mới và phong cách riêng biệt.
            </Paragraph>
            <div className="animate-reveal delay-300 mt-6">
              <Button type="primary" size="large" className="shadow-luxury">Khám phá ngay</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="flex flex-col gap-10 md:flex-row">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-32 rounded-[2rem] border border-border/60 bg-white/50 p-8 backdrop-blur-md">
            {filterContent}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-2">
              <Title className="!m-0 !font-display !text-3xl !font-black uppercase tracking-tight">Bộ sưu tập mới</Title>
              <Text className="text-sm font-medium text-slate-400">Đã kiểm định chất lượng: {state.totalElements} sản phẩm</Text>
            </div>

            <Space size={12} className="w-full sm:w-auto">
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
                className="h-11 min-w-[200px]"
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
        className="rounded-r-[2rem]"
      >
        <div className="p-2">{filterContent}</div>
      </Drawer>
    </div>
  );
}
