/**
 * My Products Page (Seller)
 * View and manage seller's consigned products
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Table, Space, Spin, Empty, Pagination, Tag, Input, Select } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { productApi } from "@/modules/product/api/productApi";
import type { ProductSummary } from "@/shared/contracts/productContract";
import { useAuth } from "@/shared/context/AuthContext";

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
          status: (state.filters.status as any) || undefined,
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
  }, [user, state.page, state.size, state.filters]);

  if (state.isLoading && state.products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: ProductSummary) => (
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">SKU: {record.sku}</p>
        </div>
      ),
    },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "image",
      render: (imageUrl?: string) =>
        imageUrl ? (
          <img src={imageUrl} alt="product" className="w-12 h-12 object-cover rounded" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded" />
        ),
    },
    {
      title: "Sale Price",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
      render: (condition?: number) => condition ? `${condition}/100` : "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ACTIVE: "green",
          INACTIVE: "orange",
          ARCHIVED: "red",
          DRAFT: "blue",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ProductSummary) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/seller/products/${record.id}`)}
            size="small"
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/seller/products/${record.id}/edit`)}
            size="small"
          >
            Edit
          </Button>
          <Button
            danger
            type="link"
            icon={<DeleteOutlined />}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/seller/products/new")}
          >
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-sm">
          <Space className="w-full" size="large" wrap>
            <Input.Search
              placeholder="Search products..."
              value={state.filters.search}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  filters: { ...prev.filters, search: e.target.value },
                  page: 0,
                }))
              }
              style={{ width: 200 }}
            />
            <Select
              placeholder="Filter by status"
              value={state.filters.status || undefined}
              onChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  filters: { ...prev.filters, status: value },
                  page: 0,
                }))
              }
              style={{ width: 150 }}
              allowClear
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
                { label: "Archived", value: "ARCHIVED" },
                { label: "Draft", value: "DRAFT" },
              ]}
            />
          </Space>
        </Card>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={state.products.map((product) => ({ ...product, key: product.id }))}
            pagination={false}
            loading={state.isLoading}
            scroll={{ x: 800 }}
          />

          {/* Pagination */}
          <div className="flex justify-center mt-4">
            <Pagination
              current={state.page + 1}
              pageSize={state.size}
              total={state.total}
              onChange={(page) => setState((prev) => ({ ...prev, page: page - 1 }))}
            />
          </div>

          {/* Empty */}
          {state.products.length === 0 && !state.isLoading && (
            <Empty
              description="No products found"
              style={{ marginTop: 24 }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
