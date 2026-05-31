/**
 * Performance Monitoring Page (Manager)
 * System performance and monitoring
 */

import { useState } from "react";
import { Card, Row, Col, Spin, Empty, Statistic, Table, Progress, Typography } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

interface MetricData {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
}

export default function PerformanceMonitoringPage() {
  const [isLoading] = useState(false);
  const [metrics] = useState<MetricData[]>([
    { name: "Thời gian hoạt động", value: 99.9, unit: "%", status: "good" },
    { name: "Thời gian phản hồi API", value: 145, unit: "ms", status: "good" },
    { name: "Hiệu suất Database", value: 95, unit: "%", status: "good" },
    { name: "Tỷ lệ Cache Hit", value: 88, unit: "%", status: "warning" },
  ]);

  const columns = [
    { title: "Chỉ số", dataIndex: "name", key: "name" },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (value: number, record: MetricData) => <span>{value}{record.unit}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          good: "#52c41a",
          warning: "#faad14",
          critical: "#ff4d4f",
        };
        const labelMap: Record<string, string> = {
          good: "Tốt",
          warning: "Cảnh báo",
          critical: "Nghiêm trọng",
        };
        return (
          <span className="flex items-center gap-2 font-bold" style={{ color: colorMap[status] }}>
            <span className="text-[10px]">●</span> {labelMap[status]}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
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
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Giám sát hệ thống</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Theo dõi sức khỏe hệ thống, hiệu suất API và các chỉ số vận hành quan trọng trong thời gian thực.
          </Paragraph>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {[
          { title: "Trạng thái hệ thống", value: "Hoạt động tốt", color: "text-emerald-500", suffix: "" },
          { title: "Người dùng trực tuyến", value: 1523, color: "text-blue-500", suffix: "", prefix: <ArrowUpOutlined /> },
          { title: "Tỷ lệ lỗi", value: 0.2, color: "text-amber-500", suffix: "%" },
          { title: "Tải hệ thống", value: 65, color: "text-slate-700", suffix: "%" },
        ].map((s, i) => (
          <Col key={i} xs={24} sm={12} md={6}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{s.title}</div>
              <div className={`font-display text-2xl font-bold ${s.color}`}>
                {s.prefix}{s.value}{s.suffix}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            title={<span className="font-display text-xl font-bold uppercase tracking-widest text-text-dark">Tài nguyên máy chủ</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm"
          >
            <div className="space-y-8">
              {[
                { label: "Sử dụng CPU", percent: 45 },
                { label: "Sử dụng RAM", percent: 62 },
                { label: "Dung lượng ổ đĩa", percent: 78, status: "active" as const },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{item.label}</p>
                  <Progress percent={item.percent} strokeColor={item.percent > 70 ? "#ff4d4f" : "#primary"} size={["100%", 12]} className="luxury-progress" />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title={<span className="font-display text-xl font-bold uppercase tracking-widest text-text-dark">Hiệu suất API</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm"
          >
            <Row gutter={[16, 40]}>
              <Col span={12}>
                <Statistic title={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng yêu cầu</span>} value={125432} styles={{ content: { fontWeight: 900 } }} />
              </Col>
              <Col span={12}>
                <Statistic title={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thành công</span>} value={124658} styles={{ content: { color: "#52c41a", fontWeight: 900 } }} />
              </Col>
              <Col span={12}>
                <Statistic title={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thất bại</span>} value={774} styles={{ content: { color: "#ff4d4f", fontWeight: 900 } }} />
              </Col>
              <Col span={12}>
                <Statistic title={<span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thời gian TB</span>} value={145} suffix="ms" styles={{ content: { fontWeight: 900 } }} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card
        title={<span className="font-display text-xl font-bold uppercase tracking-widest text-text-dark">Chỉ số vận hành</span>}
        className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm"
      >
        <Table
          columns={columns}
          dataSource={metrics.map((m, i) => ({ ...m, key: i }))}
          pagination={false}
          className="luxury-table"
        />
        {metrics.length === 0 && (
          <div className="py-10 text-center">
            <Empty description="Không có chỉ số nào" />
          </div>
        )}
      </Card>
    </div>
  );
}
