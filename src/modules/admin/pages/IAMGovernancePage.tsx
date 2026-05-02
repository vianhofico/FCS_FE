/**
 * IAM Governance Page (Admin)
 * Manage IAM policies and access control
 */

import { useState, useEffect } from "react";
import { Card, Table, Spin, Modal, message, Space, Row, Col, Typography } from "antd";
import { DeleteOutlined, EditOutlined, SafetyOutlined, PlusOutlined, PartitionOutlined } from "@ant-design/icons";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

interface IAMPolicy {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt: string;
}

interface PageState {
  policies: IAMPolicy[];
  isLoading: boolean;
  error: string | null;
  total: number;
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export default function IAMGovernancePage() {
  const [state, setState] = useState<PageState>({
    policies: [],
    isLoading: true,
    error: null,
    total: 0,
    stats: { total: 0, active: 0, inactive: 0 },
  });

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const mockPolicies: IAMPolicy[] = [
          { id: "p1", name: "Chính sách Người mua", description: "Quyền truy cập mặc định cho người mua", type: "ROLE", status: "ACTIVE", createdAt: new Date().toISOString() },
          { id: "p2", name: "Chính sách Người bán", description: "Quyền truy cập mặc định cho người bán", type: "ROLE", status: "ACTIVE", createdAt: new Date().toISOString() },
          { id: "p3", name: "Chính sách Quản trị", description: "Toàn quyền quản trị hệ thống", type: "ROLE", status: "ACTIVE", createdAt: new Date().toISOString() },
        ];

        setState((prev) => ({
          ...prev,
          policies: mockPolicies,
          total: mockPolicies.length,
          stats: {
            total: mockPolicies.length,
            active: mockPolicies.filter((p) => p.status === "ACTIVE").length,
            inactive: mockPolicies.filter((p) => p.status === "INACTIVE").length,
          },
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load policies",
        }));
      }
    };

    fetchPolicies();
  }, []);

  const handleDeletePolicy = (policyId: string) => {
    Modal.confirm({
      title: "Xóa chính sách",
      content: "Bạn có chắc chắn muốn xóa chính sách này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          message.success("Đã xóa chính sách");
          setState((prev) => ({
            ...prev,
            policies: prev.policies.filter((p) => p.id !== policyId),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to delete policy");
        }
      },
    });
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tên chính sách</span>,
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className="font-bold text-slate-700">{name}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mô tả</span>,
      dataIndex: "description",
      key: "description",
      render: (desc: string) => <span className="text-slate-500 font-medium italic">{desc}</span>,
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
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          ACTIVE: "Active",
          INACTIVE: "Inactive",
        };
        return <Badge status={statusMap[status] || "Active"}>{status}</Badge>;
      },
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: IAMPolicy) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-primary hover:!bg-pink-50 rounded-xl font-bold"
          >
            Sửa
          </Button>
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePolicy(record.id)}
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
    { label: "Tổng chính sách", value: state.stats.total, color: "bg-slate-50 text-slate-500" },
    { label: "Đang hiệu lực", value: state.stats.active, color: "bg-emerald-50 text-emerald-500" },
    { label: "Tạm ngưng", value: state.stats.inactive, color: "bg-red-50 text-red-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Quản trị IAM</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Quản lý tập trung các chính sách truy cập, phân quyền vai trò (RBAC) và kiểm soát định danh trên toàn hệ thống.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <SafetyOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quyền truy cập</div>
            <div className="font-display text-2xl font-bold text-slate-800">Governance</div>
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
                  <div className="font-display text-2xl font-bold text-slate-800">Policies</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-2">
          <div className="flex items-center gap-4">
            <PartitionOutlined className="text-xl text-primary/60" />
            <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Danh sách chính sách</Title>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="rounded-2xl h-12 px-8 font-bold shadow-luxury"
          >
            Tạo chính sách mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={state.policies.map((p) => ({ ...p, key: p.id }))}
          pagination={false}
          className="luxury-table"
        />

        {state.policies.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Chưa có chính sách nào"
              description="Hãy bắt đầu bằng việc tạo một chính sách truy cập mới cho hệ thống."
            />
          </div>
        )}
      </Card>
    </div>
  );
}
