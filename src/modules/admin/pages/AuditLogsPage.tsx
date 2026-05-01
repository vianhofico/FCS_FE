/**
 * Audit Logs Page (Admin)
 * Track all system audit logs
 */

import { useState, useEffect } from "react";
import { Card, Button, Table, Spin, Empty, Tag, Row, Col, Statistic, Input } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

interface AuditLog {
  id: string;
  action: string;
  user: string;
  resource: string;
  status: string;
  timestamp: string;
  details: string;
}

interface PageState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
  search: string;
}

export default function AuditLogsPage() {
  const [state, setState] = useState<PageState>({
    logs: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 20,
    total: 0,
    search: "",
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const mockLogs: AuditLog[] = [
          { id: "l1", action: "LOGIN", user: "admin@example.com", resource: "IAM", status: "SUCCESS", timestamp: new Date().toISOString(), details: "User logged in" },
          { id: "l2", action: "CREATE_USER", user: "admin@example.com", resource: "User", status: "SUCCESS", timestamp: new Date(Date.now() - 3600000).toISOString(), details: "New user created" },
          { id: "l3", action: "UPDATE_POLICY", user: "admin@example.com", resource: "Policy", status: "SUCCESS", timestamp: new Date(Date.now() - 7200000).toISOString(), details: "Policy updated" },
        ];

        setState((prev) => ({
          ...prev,
          logs: mockLogs,
          total: mockLogs.length,
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load logs",
        }));
      }
    };

    fetchLogs();
  }, [state.page, state.size, state.search]);

  const handleExportLogs = () => {
    const csvContent = `Audit Logs\nGenerated: ${new Date().toISOString()}\n\n${JSON.stringify(state.logs)}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
  };

  const columns = [
    { title: "Action", dataIndex: "action", key: "action", render: (action: string) => <Tag>{action}</Tag> },
    { title: "User", dataIndex: "user", key: "user" },
    { title: "Resource", dataIndex: "resource", key: "resource" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={status === "SUCCESS" ? "green" : "red"}>{status}</Tag>,
    },
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp", render: (date: string) => new Date(date).toLocaleString() },
    { title: "Details", dataIndex: "details", key: "details" },
  ];

  if (state.isLoading && state.logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Audit Logs</h1>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={12}>
            <Card className="shadow-sm">
              <Statistic title="Total Logs" value={state.total} />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card className="shadow-sm">
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportLogs} block>
                Export Logs
              </Button>
            </Card>
          </Col>
        </Row>

        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        <Card
          title="Logs"
          className="shadow-sm"
          extra={
            <Input.Search
              placeholder="Search logs..."
              value={state.search}
              onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))}
              style={{ width: 200 }}
            />
          }
        >
          <Table columns={columns} dataSource={state.logs.map((log) => ({ ...log, key: log.id }))} pagination={false} loading={state.isLoading} />
          {state.logs.length === 0 && <Empty description="No logs" />}
        </Card>
      </div>
    </div>
  );
}
