/**
 * Product List Page (Buyer)
 * Browse and search products with filtering
 */

import { useState, useEffect } from "react";
import { Row, Col, Card, Input, Button, Slider, Space, Spin, Empty, Pagination, Tag } from "antd";
import { SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { productApi } from "@/modules/product/api/productApi";
import type { ProductSummary, ProductQuery } from "@/shared/contracts/productContract";


interface BuyerProductListPageState {
  products: ProductSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  filters: Omit<ProductQuery, "page" | "size">;
}

/**
 * Buyer Product List Page component
 */
export default function BuyerProductListPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<BuyerProductListPageState>({
    products: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    filters: {
      keyword: "",
      minPrice: 0,
      maxPrice: 10000000,
      minCondition: 0,
      maxCondition: 100,
      status: undefined,
    },
  });

  // Load products on filters or page change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const query: ProductQuery = {
          ...state.filters,
          page: state.page,
          size: state.size,
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
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchProducts();
  }, [state.page, state.size, state.filters]);

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

  const handleConditionChange = (values: [number, number]) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, minCondition: values[0], maxCondition: values[1] },
      page: 0,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setState((prev) => ({ ...prev, page: newPage - 1 }));
  };

  const handleProductClick = (productId: string) => {
    navigate(`/buyer/products/${productId}`);
  };

  const getConditionLabel = (condition: number) => {
    if (condition >= 90) return "Excellent";
    if (condition >= 75) return "Very Good";
    if (condition >= 60) return "Good";
    if (condition >= 45) return "Fair";
    return "Poor";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Products</h1>
          <p className="text-gray-600">Discover amazing fashion items from trusted consignors</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8 shadow-sm">
          <Space direction="vertical" size="large" className="w-full">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search by name, brand, category..."
                size="large"
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full md:w-1/2"
              />
            </div>

            {/* Filters Grid */}
            <Row gutter={[16, 16]}>
              {/* Price Range */}
              <Col xs={24} md={12}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Price Range: ${state.filters.minPrice?.toLocaleString()} - ${state.filters.maxPrice?.toLocaleString()}
                  </label>
                  <Slider
                    range
                    min={0}
                    max={10000000}
                    step={100000}
                    defaultValue={[state.filters.minPrice || 0, state.filters.maxPrice || 10000000]}
                    onChange={handlePriceChange}
                  />
                </div>
              </Col>

              {/* Condition Range */}
              <Col xs={24} md={12}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Condition: {getConditionLabel(state.filters.minCondition || 0)} -{" "}
                    {getConditionLabel(state.filters.maxCondition || 100)}
                  </label>
                  <Slider
                    range
                    min={0}
                    max={100}
                    step={5}
                    marks={{ 0: "Poor", 50: "Fair", 100: "Excellent" }}
                    defaultValue={[state.filters.minCondition || 0, state.filters.maxCondition || 100]}
                    onChange={handleConditionChange}
                  />
                </div>
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Error Message */}
        {state.error && (
          <Card className="mb-8 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Products Grid */}
        <Spin spinning={state.isLoading}>
          {state.products.length > 0 ? (
            <>
              <Row gutter={[16, 16]} className="mb-8">
                {state.products.map((product) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <Card
                      hoverable
                      className="h-full cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
                      cover={
                        product.imageUrl ? (
                          <img alt={product.name} src={product.imageUrl} className="h-48 object-cover" />
                        ) : (
                          <div className="h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )
                      }
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className="flex flex-col h-full">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.sku}</p>
                        <p className="text-sm text-gray-500 mb-3">
                          {product.condition && `Condition: ${product.condition}/100`}
                        </p>
                        <div className="flex justify-between items-end mt-auto">
                          <span className="text-lg font-bold text-blue-600">${product.salePrice.toLocaleString()}</span>
                          <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/buyer/products/${product.id}`);
                            }}
                          >
                            View
                          </Button>
                        </div>
                        {product.status !== "ACTIVE" && (
                          <Tag color="red" className="mt-2">
                            {product.status}
                          </Tag>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              <div className="flex justify-center mt-8">
                <Pagination
                  current={state.page + 1}
                  pageSize={state.size}
                  total={state.totalElements}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </div>
            </>
          ) : (
            <Empty
              description="No products found"
              className="py-12"
              style={{ marginTop: "100px" }}
            />
          )}
        </Spin>
      </div>
    </div>
  );
}
