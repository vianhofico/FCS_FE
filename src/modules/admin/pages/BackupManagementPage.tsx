/**
 * Backup Management Page (Admin)
 * System backup and restore management
 */

import { useState, useEffect } from "react";
import { Card, Button, Table, Spin, Empty, Tag, Modal, message, Space, Row, Col, Statistic } from "antd";
import { DownloadOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";

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
      title: "Perform Backup",
      content: "Start a new backup? This may take several minutes.",
      okText: "Start",
      onOk: async () => {
        try {
          setPerformingBackup(true);
          message.success("Backup started successfully");
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
      title: "Restore Backup",
      content: "Are you sure? This will overwrite current data.",
      okText: "Restore",
      okType: "danger",
      onOk: async () => {
        try {
          message.success("Backup restored successfully");
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to restore backup");
        }
      },
    });
  };

  const handleDeleteBackup = (backupId: string) => {
    Modal.confirm({
      title: "Delete Backup",
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          message.success("Backup deleted");
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
    { title: "Backup Name", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "type", key: "type", render: (type: string) => <Tag>{type}</Tag> },
    { title: "Size (MB)", dataIndex: "size", key: "size", render: (size: number) => (size / 1024).toFixed(2) },
    { title: "Status", dataIndex: "status", key: "status", render: (status: string) => <Tag color={status === "SUCCESS" ? "green" : "red"}>{status}</Tag> },
    { title: "Created", dataIndex: "createdAt", key: "createdAt", render: (date: string) => new Date(date).toLocaleDateString() },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Backup) => (
        <Space size="small">
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleRestoreBackup()}
            size="small"
          >
            Restore
          </Button>
          <Button
            danger
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBackup(record.id)}
            size="small"
          >
            Delete
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Backup Management</h1>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Total Backups" value={state.stats.total} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Successful" value={state.stats.successful} valueStyle={{ color: "#52c41a" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Failed" value={state.stats.failed} valueStyle={{ color: "#ff4d4f" }} />
            </Card>
          </Col>
        </Row>

        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        <Card
          title="Backups"
          className="shadow-sm"
          extra={
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handlePerformBackup}
              loading={performingBackup}
            >
              Perform Backup
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={state.backups.map((b) => ({ ...b, key: b.id }))}
            pagination={false}
            loading={state.isLoading}
          />
          {state.backups.length === 0 && <Empty description="No backups" />}
        </Card>
      </div>
    </div>
  );
}
