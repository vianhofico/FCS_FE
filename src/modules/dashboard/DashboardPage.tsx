import { ArrowRightOutlined, DashboardOutlined } from "@ant-design/icons";
import { Card, Col, List, Row, Typography } from "antd";

import { appRoutes } from "@/app/router/routeManifest";

export function DashboardPage() {
  const modules = appRoutes.filter((route) => route.backendModule !== "common");

  return (
    <div className="responsive-page">
      <section className="page-hero">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            <DashboardOutlined className="text-primary" /> System Overview
          </div>
          <Typography.Title className="page-title uppercase">Re:Wear Dashboard</Typography.Title>
          <Typography.Paragraph className="page-subtitle">
            Core frontend đã sẵn sàng với React, TypeScript, Vite, Ant Design và routing theo module.
          </Typography.Paragraph>
        </div>
      </section>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="responsive-card h-full">
            <div className="space-y-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modules</div>
              <div className="font-display text-5xl font-black text-primary">{modules.length}</div>
              <Typography.Text className="text-sm font-medium text-slate-500">FE-BE alignment đang được gom theo route manifest.</Typography.Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card className="responsive-card h-full" title={<span className="font-display text-lg font-black uppercase tracking-widest">FE-BE module alignment</span>}>
            <List
              size="small"
              dataSource={modules}
              renderItem={(item) => (
                <List.Item className="!px-0">
                  <div className="flex w-full flex-col gap-2 rounded-2xl border border-border/50 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <Typography.Text className="font-bold text-slate-700">{item.label}</Typography.Text>
                    <Typography.Text className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                      /{item.backendModule} <ArrowRightOutlined />
                    </Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
