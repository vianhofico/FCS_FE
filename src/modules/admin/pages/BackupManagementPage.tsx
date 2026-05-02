/**
 * Backup Management Page (Admin)
 * System backup and restore management
 */

import { useState, useEffect } from "react";
import { Card, Table, Spin, Modal, message, Space, Row, Col, Typography } from "antd";
import { DownloadOutlined, DeleteOutlined, CloudSyncOutlined, DatabaseOutlined } from "@ant-design/icons";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

interface Backup {
  id: string;
  name: string;
  size: number;
  status: string;
  createdAt: string;
  type: string;
}

interface PageState {
  backups: Backup[];
  isLoading: boolean;
  error: string | null;
  total: number;
  stats: {
    total: number;
    successful: number;
    failed: number;
  };
}

export default function BackupManagementPage() {
  const [state, setState] = useState<PageState>({
    backups: [],
    isLoading: true,
    error: null,
    total: 0,
    stats: { total: 0, successful: 0, failed: 0 },
  });
  const [performingBackup, setPerformingBackup] = useState(false);

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const mockBackups: Backup[] = [
          { id: "b1", name: "Backup-2025-01-15", size: 2048, status: "SUCCESS", createdAt: new Date().toISOString(), type: "FULL" },
          { id: "b2", name: "Backup-2025-01-14", size: 1024, status: "SUCCESS", createdAt: new Date(Date.now() - 86400000).toISOString(), type: "FULL" },
          { id: "b3", name: "Backup-2025-01-13", size: 512, status: "SUCCESS", createdAt: new Date(Date.now() - 172800000).toISOString(), type: "INCREMENTAL" },
        ];

        setState((prev) => ({
          ...prev,
          backups: mockBackups,
          total: mockBackups.length,
          stats: {
            total: mockBackups.length,
            successful: mockBackups.filter((b) => b.status === "SUCCESS").length,
            failed: mockBackups.filter((b) => b.status === "FAILED").length,
          },
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load backups",
        }));
      }
    };

    fetchBackups();
  }, []);

  const handlePerformBackup = () => {
    Modal.confirm({
      title: "Sao lưu hệ thống",
      content: "Bắt đầu tạo bản sao lưu mới? Quá trình này có thể mất vài phút.",
      okText: "Bắt đầu",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setPerformingBackup(true);
          message.success("Đã bắt đầu quá trình sao lưu");
          setState((prev) => ({
            ...prev,
            backups: [
              {
                id: `b${state.backups.length + 1}`,
                name: `Backup-${new Date().toISOString().split("T")[0]}`,
                size: 1024,
                status: "SUCCESS",
                createdAt: new Date().toISOString(),
                type: "FULL",
              },
              ...prev.backups,
            ],
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to perform backup");
        } finally {
          setPerformingBackup(false);
        }
      },
    });
  };

  const handleRestoreBackup = () => {
    Modal.confirm({
      title: "Phục hồi hệ thống",
      content: "Bạn có chắc chắn? Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại bằng bản sao lưu.",
      okText: "Phục hồi",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          message.success("Phục hồi hệ thống thành công");
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to restore backup");
        }
      },
    });
  };

  const handleDeleteBackup = (backupId: string) => {
    Modal.confirm({
      title: "Xóa bản sao lưu",
      content: "Thao tác này không thể hoàn tác. Bạn có chắc muốn xóa bản sao lưu này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          message.success("Đã xóa bản sao lưu");
          setState((prev) => ({
            ...prev,
            backups: prev.backups.filter((b) => b.id !== backupId),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to delete backup");
        }
      },
    });
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tên bản sao lưu</span>,
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className="font-bold text-slate-700">{name}</span>,
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
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dung lượng</span>,
      dataIndex: "size",
      key: "size",
      render: (size: number) => <span className="font-mono text-xs font-bold text-slate-400">{(size / 1024).toFixed(2)} MB</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          SUCCESS: "Verified",
          FAILED: "Rejected",
        };
        return <Badge status={statusMap[status] || "Verified"}>{status}</Badge>;
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày tạo</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => <span className="text-slate-500 font-medium">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: Backup) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleRestoreBackup()}
            className="text-primary hover:!bg-pink-50 rounded-xl font-bold"
          >
            Phục hồi
          </Button>
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBackup(record.id)}
            className="hover:!bg-red-50 rounded-xl font-bold"
          >
            Xóa
          </Button>
        </Space>
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
    { label: "Tổng bản lưu", value: state.stats.total, color: "bg-slate-50 text-slate-500" },
    { label: "Thành công", value: state.stats.successful, color: "bg-emerald-50 text-emerald-500" },
    { label: "Thất bại", value: state.stats.failed, color: "bg-red-50 text-red-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Quản lý sao lưu</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Đảm bảo an toàn dữ liệu bằng cách quản lý các bản sao lưu định kỳ và quy trình phục hồi hệ thống khi cần thiết.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <CloudSyncOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">An toàn dữ liệu</div>
            <div className="font-display text-2xl font-bold text-slate-800">Business Continuity</div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={8}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${s.color}`}>
                  {s.value}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  <div className="font-display text-2xl font-bold text-slate-800">Backups</div>
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
            <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Danh sách bản lưu</Title>
          </div>
          <Button
            type="primary"
            icon={<CloudSyncOutlined />}
            onClick={handlePerformBackup}
            loading={performingBackup}
            className="rounded-2xl h-12 px-8 font-bold shadow-luxury"
          >
            Tạo bản sao lưu ngay
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={state.backups.map((b) => ({ ...b, key: b.id }))}
          pagination={false}
          className="luxury-table"
        />

        {state.backups.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Chưa có bản sao lưu"
              description="Hãy bắt đầu tạo bản sao lưu đầu tiên để bảo vệ dữ liệu hệ thống."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

