/**
 * System Reporting Page (Admin)
 * System analytics and reporting
 */

import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Empty, Statistic, Table, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

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

        const mockMetrics: SystemMetric[] = [
          { id: "m1", metric: "API Calls", value: 125432, unit: "requests", timestamp: new Date().toISOString() },
          { id: "m2", metric: "DB Queries", value: 89234, unit: "queries", timestamp: new Date().toISOString() },
          { id: "m3", metric: "Cache Hits", value: 98765, unit: "hits", timestamp: new Date().toISOString() },
        ];

        setMetrics(mockMetrics);
        setStats({
          totalTransactions: 5234,
          totalRevenue: 325000,
          activeUsers: 1523,
          systemUptime: 99.95,
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
    { title: "Metric", dataIndex: "metric", key: "metric" },
    { title: "Value", dataIndex: "value", key: "value", render: (value: number) => value.toLocaleString() },
    { title: "Unit", dataIndex: "unit", key: "unit" },
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp", render: (date: string) => new Date(date).toLocaleString() },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">System Reporting</h1>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Total Transactions" value={stats.totalTransactions} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Total Revenue" value={stats.totalRevenue} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Active Users" value={stats.activeUsers} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Uptime" value={stats.systemUptime} suffix="%" />
            </Card>
          </Col>
        </Row>

        <Card title="System Metrics" className="shadow-sm" extra={<Button icon={<DownloadOutlined />} onClick={handleExportReport}>Export</Button>}>
          <Table columns={columns} dataSource={metrics.map((m) => ({ ...m, key: m.id }))} pagination={false} loading={isLoading} />
          {metrics.length === 0 && <Empty description="No metrics" />}
        </Card>
      </div>
    </div>
  );
}
