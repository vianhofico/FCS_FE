import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Empty, Spin, Tag, Typography } from "antd";

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
    <div className="space-y-4">
      <Card title="Audit Logs">
        {logs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {logs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="flex w-full cursor-pointer flex-col items-start gap-1 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Typography.Text strong>{item.action || "Unknown action"}</Typography.Text>
                  <Tag>{item.actor || "System"}</Tag>
                  {item.id === selectedId && <Badge status="processing" text="Selected" />}
                </div>
                <Typography.Text type="secondary">{item.createdAt || "No timestamp"}</Typography.Text>
              </button>
            ))}
          </div>
        ) : (
          <Empty description="No audit logs found" />
        )}
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
    </div>
  );
}
