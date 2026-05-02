/**
 * Performance Monitoring Page (Manager)
 * System performance and monitoring
 */

import { useState } from "react";
import { Card, Row, Col, Spin, Empty, Statistic, Table, Progress } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";

interface MetricData {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
}

export default function PerformanceMonitoringPage() {
  const [isLoading] = useState(false);
  const [metrics] = useState<MetricData[]>([
    { name: "Server Uptime", value: 99.9, unit: "%", status: "good" },
    { name: "API Response Time", value: 145, unit: "ms", status: "good" },
    { name: "Database Performance", value: 95, unit: "%", status: "good" },
    { name: "Cache Hit Rate", value: 88, unit: "%", status: "warning" },
  ]);

  const columns = [
    { title: "Metric", dataIndex: "name", key: "name" },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (value: number) => <span>{value}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          good: "green",
          warning: "orange",
          critical: "red",
        };
        return <span style={{ color: colorMap[status] }}>●</span>;
      },
    },
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Performance Monitoring</h1>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic
                title="System Status"
                value="Healthy"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Active Users"
                value={1523}
                prefix={<ArrowUpOutlined style={{ color: "#52c41a" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Error Rate"
                value={0.2}
                suffix="%"
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Load" value={65} suffix="%" />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} md={12}>
            <Card title="Server Performance" className="shadow-sm">
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <p className="text-sm text-gray-600 mb-2">CPU Usage</p>
                  <Progress percent={45} />
                </Col>
                <Col xs={24}>
                  <p className="text-sm text-gray-600 mb-2">Memory Usage</p>
                  <Progress percent={62} />
                </Col>
                <Col xs={24}>
                  <p className="text-sm text-gray-600 mb-2">Disk Usage</p>
                  <Progress percent={78} status="active" />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="API Endpoints" className="shadow-sm">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Statistic title="Total Requests" value={125432} />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic title="Successful" value={124658} valueStyle={{ color: "#52c41a" }} />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic title="Failed" value={774} valueStyle={{ color: "#ff4d4f" }} />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic title="Avg Response" value={145} suffix="ms" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Card title="Metrics" className="shadow-sm">
          <Table
            columns={columns}
            dataSource={metrics.map((m, i) => ({ ...m, key: i }))}
            pagination={false}
          />
          {metrics.length === 0 && <Empty description="No metrics available" />}
        </Card>
      </div>
    </div>
  );
}
