import { Button, Card, Space, Typography } from "antd";
import { useState } from "react";

import type { ApiError } from "@/shared/api/http";
import { healthApi } from "@/modules/health/api/healthApi";

export function HealthPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const ping = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await healthApi.getHealth();
      setResult(JSON.stringify({ message: res.message, data: res.data }));
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Health
      </Typography.Title>

      <Card>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Paragraph style={{ margin: 0 }}>
            Goi thu <code>GET /api/v1/health</code> toi backend (baseURL lay tu <code>VITE_API_BASE_URL</code>
            ).
          </Typography.Paragraph>

          <div>
            <Button type="primary" onClick={ping} loading={loading}>
              Ping API
            </Button>
          </div>

          {result && (
            <Typography.Paragraph style={{ margin: 0 }}>
              <b>Result:</b> <code>{result}</code>
            </Typography.Paragraph>
          )}

          {error && (
            <Typography.Paragraph style={{ margin: 0 }}>
              <b>Error:</b> <code>{error.status ?? "N/A"}</code> — {error.message}
            </Typography.Paragraph>
          )}
        </Space>
      </Card>
    </Space>
  );
}
