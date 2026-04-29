import { Card, List, Space, Typography } from "antd";

import { appRoutes } from "@/app/router/routeManifest";

export function DashboardPage() {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Dashboard
      </Typography.Title>

      <Card>
        <Typography.Paragraph style={{ margin: 0 }}>
          Core FE da san sang: React + TypeScript + Vite + Ant Design + Router.
        </Typography.Paragraph>
      </Card>

      <Card title="FE-BE module alignment">
        <List
          size="small"
          dataSource={appRoutes.filter((route) => route.backendModule !== "common")}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text>
                <b>{item.label}</b>: <code>/{item.backendModule}</code>
              </Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
