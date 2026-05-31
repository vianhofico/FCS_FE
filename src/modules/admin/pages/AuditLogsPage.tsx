/**
 * Audit Logs Page (Admin)
 * Track all system audit logs
 */

import { useState, useEffect } from "react";
import { Card, Table, Spin, Row, Col, Input, Typography } from "antd";
import { DownloadOutlined, HistoryOutlined, SearchOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

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
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Hành động</span>,
      dataIndex: "action",
      key: "action",
      render: (action: string) => (
        <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-100">
          {action}
        </span>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Người dùng</span>,
      dataIndex: "user",
      key: "user",
      render: (user: string) => <span className="font-bold text-slate-700">{user}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tài nguyên</span>,
      dataIndex: "resource",
      key: "resource",
      render: (resource: string) => <span className="font-medium text-slate-500">{resource}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          SUCCESS: "Verified",
          FAILURE: "Rejected",
        };
        return <Badge status={statusMap[status] || "Verified"}>{status}</Badge>;
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thời gian</span>,
      dataIndex: "timestamp",
      key: "timestamp",
      render: (date: string) => <span className="text-xs font-bold text-slate-400">{new Date(date).toLocaleString()}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Chi tiết</span>,
      dataIndex: "details",
      key: "details",
      render: (details: string) => <span className="text-slate-600 italic">"{details}"</span>,
    },
  ];

  if (state.isLoading && state.logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-14 pb-28">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Nhật ký hệ thống</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Ghi lại mọi hoạt động quan trọng trên hệ thống để phục vụ công tác kiểm tra, giám sát và đảm bảo tính minh bạch.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <SafetyCertificateOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Độ tin cậy</div>
            <div className="font-display text-2xl font-bold text-slate-800">Tamper-proof Logs</div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12}>
          <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 text-2xl font-black">
                {state.total}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng số bản ghi</div>
                <div className="font-display text-2xl font-bold text-slate-800">Audit Logs</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportLogs}
            className="h-full min-h-[92px] w-full rounded-[2rem] font-bold uppercase tracking-widest text-[11px] shadow-luxury"
          >
            Xuất dữ liệu nhật ký (CSV)
          </Button>
        </Col>
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
          <div className="flex items-center gap-4">
            <HistoryOutlined className="text-xl text-primary/60" />
            <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Danh sách hoạt động</Title>
          </div>
          <Input
            placeholder="Tìm kiếm hành động, người dùng..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={state.search}
            onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))}
            className="h-12 w-full md:w-80 rounded-2xl border-slate-100 bg-slate-50/50 font-medium"
          />
        </div>

        <Table
          columns={columns}
          dataSource={state.logs.map((log) => ({ ...log, key: log.id }))}
          pagination={false}
          className="luxury-table"
        />

        {state.logs.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Không có nhật ký nào"
              description="Hệ thống hiện chưa ghi nhận hoạt động nào phù hợp với tìm kiếm."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

