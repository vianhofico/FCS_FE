/**
 * Sales Report Page (Seller)
 * View sales analytics and reports
 */

import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Empty, Statistic, Table, DatePicker, Button, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { orderApi } from "@/modules/order/api/orderApi";
import type { OrderSummary } from "@/shared/contracts/orderContract";
import { useAuth } from "@/shared/context/AuthContext";

interface PageState {
  orders: OrderSummary[];
  isLoading: boolean;
  error: string | null;
  stats: {
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    totalRevenue: number;
  };
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null];
}

export default function SalesReportPage() {
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({
    orders: [],
    isLoading: true,
    error: null,
    stats: {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      totalRevenue: 0,
    },
    dateRange: [dayjs().subtract(30, "days"), dayjs()],
  });

  useEffect(() => {
    if (!user) return;

    const fetchSalesData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const response = await orderApi.getOrders({
          page: 0,
          size: 100,
        });

        if (response.success && response.data) {
          const orders = response.data.content || [];
          const totalSales = orders.length;
          const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
          const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

          setState((prev) => ({
            ...prev,
            orders,
            stats: {
              totalSales,
              totalOrders: totalSales,
              averageOrderValue: Math.round(averageOrderValue),
              totalRevenue,
            },
            isLoading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load sales data",
        }));
      }
    };

    fetchSalesData();
  }, [user]);

  const handleExportReport = () => {
    // Export report logic
    const csvContent =
      "Order ID,Total Amount,Status,Created Date\n" +
      state.orders
        .map((o) => `${o.id},${o.totalAmount},${o.status},${new Date(o.createdAt || "").toLocaleDateString()}`)
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales-report.csv";
    a.click();
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `$${amount.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
          <Button icon={<DownloadOutlined />} onClick={handleExportReport}>
            Export Report
          </Button>
        </div>

        {/* Date Range */}
        <Card className="mb-6 shadow-sm">
          <Space>
            <span>Date Range:</span>
            <DatePicker.RangePicker
              value={state.dateRange}
              onChange={(dates) =>
                setState((prev) => ({
                  ...prev,
                  dateRange: [dates?.[0] || null, dates?.[1] || null],
                }))
              }
            />
          </Space>
        </Card>

        {/* Statistics */}
        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic title="Total Orders" value={state.stats.totalOrders} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Revenue"
                value={state.stats.totalRevenue}
                prefix="$"
                valueStyle={{ fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Average Order Value"
                value={state.stats.averageOrderValue}
                prefix="$"
                valueStyle={{ fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Sales"
                value={state.stats.totalSales}
                valueStyle={{ fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Table */}
        <Card title="Recent Orders" className="shadow-sm">
          <Table
            columns={columns}
            dataSource={state.orders.slice(0, 10).map((order) => ({ ...order, key: order.id }))}
            pagination={false}
            loading={state.isLoading}
          />
          {state.orders.length === 0 && <Empty description="No sales data" />}
        </Card>
      </div>
    </div>
  );
}
