/**
 * Sales Report Page (Seller)
 * View sales analytics and reports
 */

import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Table, DatePicker, Space, Typography } from "antd";
import { DownloadOutlined, LineChartOutlined, ShoppingCartOutlined, TrophyOutlined, WalletOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { orderApi } from "@/modules/order/api/orderApi";
import type { OrderSummary } from "@/shared/contracts/orderContract";
import { useAuth } from "@/shared/context/AuthContext";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

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
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã đơn hàng</span>,
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span className="font-mono text-xs font-bold text-slate-400">#{text.slice(-8).toUpperCase()}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng giá trị</span>,
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => <span className="text-base font-bold text-slate-700">{amount.toLocaleString()}₫</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          DELIVERED: "Verified",
          PENDING: "Pending",
          CANCELLED: "Rejected",
        };
        return <Badge status={statusMap[status] || "Pending"}>{status}</Badge>;
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày tạo</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{new Date(date).toLocaleDateString()}</span>
          <span className="text-[10px] text-slate-400">{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      ),
    },
  ];

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const stats = [
    { label: "Số đơn hàng", value: state.stats.totalOrders, icon: <ShoppingCartOutlined />, color: "bg-blue-50 text-blue-500" },
    { label: "Tổng doanh thu", value: state.stats.totalRevenue, icon: <WalletOutlined />, color: "bg-primary/5 text-primary" },
    { label: "Giá trị trung bình", value: state.stats.averageOrderValue, icon: <LineChartOutlined />, color: "bg-emerald-50 text-emerald-500" },
    { label: "Tỷ lệ tăng trưởng", value: "12%", icon: <TrophyOutlined />, color: "bg-orange-50 text-orange-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Báo cáo kinh doanh</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Phân tích hiệu quả kinh doanh và theo dõi sự phát triển của gian hàng thời trang của bạn.
          </Paragraph>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          onClick={handleExportReport}
          className="shadow-luxury"
        >
          XUẤT BÁO CÁO (CSV)
        </Button>
      </div>

      <Card className="rounded-[2rem] border-pink-100/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
        <Space size="large" className="w-full justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Khoảng thời gian:</span>
            <DatePicker.RangePicker
              value={state.dateRange}
              onChange={(dates) =>
                setState((prev) => ({
                  ...prev,
                  dateRange: [dates?.[0] || null, dates?.[1] || null],
                }))
              }
              className="luxury-datepicker"
            />
          </div>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12} md={6}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  <div className="font-display text-2xl font-bold text-slate-800">
                    {typeof s.value === 'number' ? `${s.value.toLocaleString()}₫` : s.value}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={<span className="font-display text-xl font-bold uppercase tracking-widest text-text-dark">Đơn hàng gần đây</span>}
        className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={state.orders.slice(0, 10).map((order) => ({ ...order, key: order.id }))}
          pagination={false}
          className="luxury-table"
        />
        {state.orders.length === 0 && (
          <div className="py-10">
            <EmptyState title="Chưa có dữ liệu bán hàng" description="Dữ liệu kinh doanh của bạn sẽ hiển thị tại đây khi có đơn hàng đầu tiên." />
          </div>
        )}
      </Card>
    </div>
  );
}
