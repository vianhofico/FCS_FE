/**
 * Reporting Page (Manager)
 * System analytics and reporting
 */

import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Table, Typography } from "antd";
import { DownloadOutlined, BarChartOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, EmptyState } from "@/shared/ui";
import { analyticsApi } from "@/modules/analytics/api/analyticsApi";

const { Title, Paragraph } = Typography;

interface Report {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
}

interface PageState {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  stats: {
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    activeListings: number;
  };
}

export default function ReportingPage() {
  const [state, setState] = useState<PageState>({
    reports: [],
    isLoading: true,
    error: null,
    stats: {
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      activeListings: 0,
    },
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const [dashboardResponse, revenueResponse, consignmentResponse] = await Promise.all([
          analyticsApi.getDashboard(),
          analyticsApi.getRevenueReport({ period: "DAILY" }),
          analyticsApi.getConsignmentAnalytics(),
        ]);
        const revenueData = revenueResponse.data;
        const revenueRows = Array.isArray(revenueData) ? revenueData : revenueData ? [revenueData] : [];
        const consignmentByStatus = consignmentResponse.data?.totalByStatus || consignmentResponse.data?.byStatus || {};
        const activeListings = Object.entries(consignmentByStatus)
          .filter(([status]) => ["APPROVED", "ACCEPTED", "REVIEWING", "SUBMITTED"].includes(status))
          .reduce((sum, [, value]) => sum + value, 0);
        const reports: Report[] = [
          {
            id: "revenue",
            title: "Báo cáo doanh thu",
            type: "REVENUE",
            generatedAt: revenueRows[0]?.date || new Date().toISOString(),
          },
          {
            id: "consignments",
            title: "Báo cáo ký gửi",
            type: "CONSIGNMENT",
            generatedAt: new Date().toISOString(),
          },
        ];

        setState((prev) => ({
          ...prev,
          reports,
          stats: {
            totalOrders: revenueRows.reduce((sum, item) => sum + (item.orders || 0), 0),
            totalUsers: dashboardResponse.data?.newUsersThisMonth || 0,
            totalRevenue: dashboardResponse.data?.totalRevenue || revenueRows.reduce((sum, item) => sum + (item.revenue || item.totalRevenue || 0), 0),
            activeListings,
          },
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load reports",
        }));
      }
    };

    fetchReports();
  }, []);

  const handleExportReport = (reportId: string) => {
    const csvContent = `Report ${reportId}\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportId}.csv`;
    a.click();
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tên báo cáo</span>,
      dataIndex: "title",
      key: "title",
      render: (title: string) => <span className="font-bold text-slate-700">{title}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loại</span>,
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-100">
          {type}
        </span>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày tạo</span>,
      dataIndex: "generatedAt",
      key: "date",
      render: (date: string) => <span className="font-medium text-slate-500">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: Report) => (
        <Button
          type="text"
          icon={<DownloadOutlined />}
          onClick={() => handleExportReport(record.id)}
          className="text-primary hover:!bg-pink-50 rounded-xl font-bold"
        >
          Xuất file
        </Button>
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
    { label: "Tổng đơn hàng", value: state.stats.totalOrders, color: "bg-blue-50 text-blue-500", suffix: "" },
    { label: "Người dùng", value: state.stats.totalUsers, color: "bg-purple-50 text-purple-500", suffix: "" },
    { label: "Doanh thu", value: state.stats.totalRevenue.toLocaleString(), color: "bg-emerald-50 text-emerald-500", suffix: "₫" },
    { label: "Niêm yết", value: state.stats.activeListings, color: "bg-amber-50 text-amber-500", suffix: "" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Báo cáo hệ thống</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Phân tích dữ liệu kinh doanh, theo dõi tăng trưởng và xuất các báo cáo chi tiết cho mục đích quản trị.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <BarChartOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái dữ liệu</div>
            <div className="font-display text-2xl font-bold text-slate-800">Real-time Analytics</div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black ${s.color}`}>
                  {s.value}{s.suffix}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  <div className="font-display text-2xl font-bold text-slate-800">Stats</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center gap-4 px-2">
          <FileTextOutlined className="text-xl text-primary/60" />
          <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Danh sách báo cáo</Title>
        </div>

        <Table
          columns={columns}
          dataSource={state.reports.map((r) => ({ ...r, key: r.id }))}
          pagination={false}
          className="luxury-table"
        />

        {state.reports.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Chưa có báo cáo nào"
              description="Hệ thống đang tổng hợp dữ liệu, vui lòng quay lại sau."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

