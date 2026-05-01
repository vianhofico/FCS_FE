/**
 * Reporting Page (Manager)
 * System analytics and reporting
 */

import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Empty, Statistic, Table, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

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

        const mockReports: Report[] = [
          {
            id: "r1",
            title: "Monthly Sales Report",
            type: "SALES",
            generatedAt: new Date().toISOString(),
          },
          {
            id: "r2",
            title: "User Activity Report",
            type: "ACTIVITY",
            generatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ];

        setState((prev) => ({
          ...prev,
          reports: mockReports,
          stats: {
            totalOrders: 5234,
            totalUsers: 1523,
            totalRevenue: 125000,
            activeListings: 3456,
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
    { title: "Report Title", dataIndex: "title", key: "title" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Generated", dataIndex: "generatedAt", key: "date", render: (date: string) => new Date(date).toLocaleDateString() },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Report) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleExportReport(record.id)}
          size="small"
        >
          Export
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reporting</h1>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Total Orders" value={state.stats.totalOrders} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Total Users" value={state.stats.totalUsers} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Total Revenue" value={state.stats.totalRevenue} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Active Listings" value={state.stats.activeListings} />
            </Card>
          </Col>
        </Row>

        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        <Card title="Available Reports" className="shadow-sm">
          <Table
            columns={columns}
            dataSource={state.reports.map((r) => ({ ...r, key: r.id }))}
            pagination={false}
            loading={state.isLoading}
          />
          {state.reports.length === 0 && <Empty description="No reports available" />}
        </Card>
      </div>
    </div>
  );
}
