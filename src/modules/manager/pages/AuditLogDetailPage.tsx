import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Empty, List, Space, Spin, Tag, Typography } from "antd";

import { activityLogApi } from "@/modules/audit/api/activityLogApi";
import TimelineWidget from "@/shared/components/TimelineWidget";

type ActivityLogSummary = {
  id: string;
  action?: string;
  actor?: string;
  createdAt?: string;
};

export default function AuditLogDetailPage() {
  const [logs, setLogs] = useState<ActivityLogSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await activityLogApi.getActivityLogs();
        setLogs(response.data || []);
        setSelectedId((current) => current || response.data?.[0]?.id || null);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const selectedLog = useMemo(
    () => logs.find((log) => log.id === selectedId) || null,
    [logs, selectedId]
  );

  const timelineItems = selectedLog
    ? [
        {
          id: selectedLog.id,
          title: selectedLog.action || "Audit event",
          description: selectedLog.actor || "System",
          createdAt: selectedLog.createdAt,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card title="Audit Logs">
        <List
          dataSource={logs}
          locale={{ emptyText: <Empty description="No audit logs found" /> }}
          renderItem={(item) => (
            <List.Item onClick={() => setSelectedId(item.id)} style={{ cursor: "pointer" }}>
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Space>
                  <Typography.Text strong>{item.action || "Unknown action"}</Typography.Text>
                  <Tag>{item.actor || "System"}</Tag>
                  {item.id === selectedId && <Badge status="processing" text="Selected" />}
                </Space>
                <Typography.Text type="secondary">{item.createdAt || "No timestamp"}</Typography.Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      <TimelineWidget
        title="Selected Audit Event"
        items={timelineItems}
      />

      {selectedLog && (
        <Card title="Event Details">
          <Typography.Paragraph style={{ marginBottom: 8 }}>
            <strong>Event ID:</strong> {selectedLog.id}
          </Typography.Paragraph>
          <Typography.Paragraph style={{ marginBottom: 8 }}>
            <strong>Action:</strong> {selectedLog.action || "Unknown"}
          </Typography.Paragraph>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            <strong>Actor:</strong> {selectedLog.actor || "System"}
          </Typography.Paragraph>
        </Card>
      )}
    </Space>
  );
}
