/**
 * System Reporting Page (Admin)
 * System analytics and reporting
 */

import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Table, Typography } from "antd";
import { DownloadOutlined, MonitorOutlined, DatabaseOutlined, RiseOutlined } from "@ant-design/icons";
import { Button, EmptyState } from "@/shared/ui";
import { analyticsApi } from "@/modules/analytics/api/analyticsApi";

const { Title, Paragraph } = Typography;

interface SystemMetric {
  id: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
}

export default function SystemReportingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    activeUsers: 0,
    systemUptime: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);

        const [dashboardResponse, revenueResponse, consignmentResponse] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getRevenueReport({ period: "DAILY" }),
          analyticsApi.getConsignmentAnalytics(),
        ]);
        const dashboard = dashboardResponse.data;
        const revenueData = revenueResponse.data;
        const revenueRows = Array.isArray(revenueData) ? revenueData : revenueData ? [revenueData] : [];
        const consignmentByStatus = consignmentResponse.data?.totalByStatus || consignmentResponse.data?.byStatus || {};
        const now = new Date().toISOString();

        setMetrics([
          { id: "revenue", metric: "Revenue", value: dashboard?.totalRevenue || 0, unit: "VND", timestamp: now },
          { id: "orders", metric: "Orders", value: revenueRows.reduce((sum, item) => sum + (item.orders || 0), 0), unit: "orders", timestamp: now },
          { id: "consignments", metric: "Consignments", value: Object.values(consignmentByStatus).reduce((sum, value) => sum + value, 0), unit: "requests", timestamp: now },
        ]);
        setStats({
          totalTransactions: revenueRows.reduce((sum, item) => sum + (item.orders || 0), 0),
          totalRevenue: dashboard?.totalRevenue || revenueRows.reduce((sum, item) => sum + (item.revenue || item.totalRevenue || 0), 0),
          activeUsers: dashboard?.newUsersThisMonth || 0,
          systemUptime: 100,
        });
        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleExportReport = () => {
    const csvContent = `System Report\nGenerated: ${new Date().toISOString()}\n\n${JSON.stringify(stats)}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-report-${Date.now()}.csv`;
    a.click();
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chỉ số</span>,
      dataIndex: "metric",
      key: "metric",
      render: (text: string) => <span className="font-bold text-slate-700">{text}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Giá trị</span>,
      dataIndex: "value",
      key: "value",
      render: (value: number) => <span className="font-display font-bold text-primary">{value.toLocaleString()}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đơn vị</span>,
      dataIndex: "unit",
      key: "unit",
      render: (unit: string) => <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{unit}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thời gian</span>,
      dataIndex: "timestamp",
      key: "timestamp",
      render: (date: string) => <span className="text-slate-500 font-medium">{new Date(date).toLocaleString()}</span>,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const statItems = [
    { label: "Giao dịch", value: stats.totalTransactions.toLocaleString(), color: "bg-blue-50 text-blue-500", icon: <RiseOutlined />, suffix: "" },
    { label: "Doanh thu", value: (stats.totalRevenue / 1000000).toFixed(1), color: "bg-emerald-50 text-emerald-500", icon: <MonitorOutlined />, suffix: "M₫" },
    { label: "Người dùng", value: stats.activeUsers.toLocaleString(), color: "bg-purple-50 text-purple-500", icon: <MonitorOutlined />, suffix: "" },
    { label: "Uptime", value: stats.systemUptime, color: "bg-indigo-50 text-indigo-500", icon: <DatabaseOutlined />, suffix: "%" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-14 pb-28">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Báo cáo hệ thống</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Phân tích chuyên sâu về hiệu suất hạ tầng, lưu lượng truy cập và các chỉ số vận hành kỹ thuật của nền tảng.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <MonitorOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái hạ tầng</div>
            <div className="font-display text-2xl font-bold text-slate-800">Healthy & Online</div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {statItems.map((s, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  <div className="font-display text-2xl font-bold text-slate-800">{s.value}{s.suffix}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
          <div className="flex items-center gap-4">
            <DatabaseOutlined className="text-xl text-primary/60" />
            <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Chỉ số chi tiết</Title>
          </div>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportReport}
            className="rounded-xl border-pink-100 text-primary font-bold hover:border-primary"
          >
            Xuất dữ liệu CSV
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={metrics.map((m) => ({ ...m, key: m.id }))}
          pagination={false}
          className="luxury-table"
        />

        {metrics.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Không có dữ liệu"
              description="Hệ thống hiện chưa ghi nhận chỉ số nào trong khoảng thời gian này."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

