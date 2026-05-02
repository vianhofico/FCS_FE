/**
 * Dispute Resolution Page (Manager)
 * Handle disputes between buyers and sellers
 */

import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Spin,
  Modal,
  message,
  Space,
  Row,
  Col,
  Typography,
} from "antd";
import { CheckOutlined, AlertOutlined, SafetyOutlined } from "@ant-design/icons";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface PageState {
  disputes: Dispute[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
  stats: {
    total: number;
    pending: number;
    resolved: number;
  };
}

export default function DisputeResolutionPage() {
  const [state, setState] = useState<PageState>({
    disputes: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
    stats: { total: 0, pending: 0, resolved: 0 },
  });

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Mock data for disputes
        const mockDisputes: Dispute[] = [
          {
            id: "d1",
            orderId: "o1",
            buyerId: "b1",
            sellerId: "s1",
            reason: "Vấn đề chất lượng sản phẩm",
            status: "PENDING",
            createdAt: new Date().toISOString(),
          },
        ];

        setState((prev) => ({
          ...prev,
          disputes: mockDisputes,
          total: mockDisputes.length,
          stats: {
            total: mockDisputes.length,
            pending: mockDisputes.filter((d) => d.status === "PENDING").length,
            resolved: mockDisputes.filter((d) => d.status === "RESOLVED").length,
          },
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load disputes",
        }));
      }
    };

    fetchDisputes();
  }, []);

  const handleResolveDispute = (disputeId: string, resolution: string) => {
    Modal.confirm({
      title: "Giải quyết khiếu nại",
      content: `Hình thức giải quyết: ${resolution}`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          message.success("Đã giải quyết khiếu nại");
          setState((prev) => ({
            ...prev,
            disputes: prev.disputes.map((d) =>
              d.id === disputeId ? { ...d, status: "RESOLVED" } : d
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to resolve dispute");
        }
      },
    });
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã khiếu nại</span>,
      dataIndex: "id",
      key: "id",
      render: (id: string) => <span className="font-mono text-xs font-bold text-slate-400">#{id.toUpperCase()}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã đơn hàng</span>,
      dataIndex: "orderId",
      key: "orderId",
      render: (id: string) => <span className="font-bold text-slate-700">#{id}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lý do</span>,
      dataIndex: "reason",
      key: "reason",
      render: (reason: string) => <span className="font-medium text-slate-600">{reason}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          PENDING: "Pending",
          RESOLVED: "Verified",
        };
        return <Badge status={statusMap[status] || "Pending"}>{status}</Badge>;
      },
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: Dispute) => (
        <Space size="middle">
          {record.status === "PENDING" && (
            <>
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleResolveDispute(record.id, "Bênh vực Người mua")}
                className="text-emerald-500 hover:!bg-emerald-50 rounded-xl font-bold"
              >
                Ưu tiên Người mua
              </Button>
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleResolveDispute(record.id, "Bênh vực Người bán")}
                className="text-primary hover:!bg-pink-50 rounded-xl font-bold"
              >
                Ưu tiên Người bán
              </Button>
            </>
          )}
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
    { label: "Tổng khiếu nại", value: state.stats.total, color: "bg-slate-50 text-slate-500" },
    { label: "Chưa giải quyết", value: state.stats.pending, color: "bg-amber-50 text-amber-500" },
    { label: "Đã xử lý", value: state.stats.resolved, color: "bg-emerald-50 text-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Giải quyết khiếu nại</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Xử lý các tranh chấp giữa người mua và người bán để đảm bảo tính công bằng và minh bạch trong mọi giao dịch.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <SafetyOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trung tâm hỗ trợ</div>
            <div className="font-display text-2xl font-bold text-slate-800">Dispute Center</div>
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
                  <div className="font-display text-2xl font-bold text-slate-800">Cases</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center gap-4 px-2">
          <AlertOutlined className="text-xl text-primary/60" />
          <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Danh sách tranh chấp</Title>
        </div>

        <Table
          columns={columns}
          dataSource={state.disputes.map((dispute) => ({ ...dispute, key: dispute.id }))}
          pagination={false}
          className="luxury-table"
        />

        {state.disputes.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Mọi thứ đều ổn"
              description="Hiện không có khiếu nại nào cần xử lý."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

