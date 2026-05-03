import { Card, Space, Tag, Typography } from "antd";

type ModulePlaceholderPageProps = {
  moduleKey: string;
  title: string;
  backendPackage: string;
  notes?: string;
};

export function ModulePlaceholderPage({
  moduleKey,
  title,
  backendPackage,
  notes,
}: ModulePlaceholderPageProps) {
  return (
    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      <Card>
        <Space orientation="vertical" size={8}>
          <Typography.Paragraph style={{ margin: 0 }}>
            FE module key: <Tag>{moduleKey}</Tag>
          </Typography.Paragraph>
          <Typography.Paragraph style={{ margin: 0 }}>
            BE package: <code>{backendPackage}</code>
          </Typography.Paragraph>
          <Typography.Paragraph style={{ margin: 0 }}>
            {notes ?? "Module scaffold is ready for API integration."}
          </Typography.Paragraph>
        </Space>
      </Card>
    </Space>
  );
}
