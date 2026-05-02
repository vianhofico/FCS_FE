/**
 * Returns Moderation Page (Manager)
 * Manage return requests
 */

import { useState, useEffect } from "react";
import { Card, Table, Spin, Modal, message, Space, Row, Col, Typography } from "antd";
import { CheckOutlined, CloseOutlined, ReloadOutlined, HistoryOutlined } from "@ant-design/icons";
import { returnApi } from "@/modules/order/api/returnApi";
import type { ReturnRequestSummary } from "@/shared/contracts/returnContract";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

interface PageState {
  returns: ReturnRequestSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
  stats: {
    total: number;
    pending: number;
    approved: number;
  };
}

export default function ReturnsModerationPage() {
  const [state, setState] = useState<PageState>({
    returns: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
    stats: { total: 0, pending: 0, approved: 0 },
  });

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await returnApi.getReturns({
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          const returns = response.data.content || [];
          setState((prev) => ({
            ...prev,
            returns,
            total: response.data?.totalElements || 0,
            stats: {
              total: returns.length,
              pending: returns.filter((r) => r.status === "PENDING").length,
              approved: returns.filter((r) => r.status === "APPROVED").length,
            },
            isLoading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load returns",
        }));
      }
    };

    fetchReturns();
  }, [state.page, state.size]);

  const handleApproveReturn = (returnId: string) => {
    Modal.confirm({
      title: "Phê duyệt trả hàng",
      content: "Bạn có chắc chắn muốn chấp nhận yêu cầu trả hàng này?",
      okText: "Phê duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          message.success("Đã phê duyệt yêu cầu");
          setState((prev) => ({
            ...prev,
            returns: prev.returns.map((r) =>
              r.id === returnId ? { ...r, status: "APPROVED" } : r
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to approve");
        }
      },
    });
  };

  const handleRejectReturn = (returnId: string) => {
    Modal.confirm({
      title: "Từ chối trả hàng",
      content: "Thao tác này sẽ bác bỏ yêu cầu trả hàng. Tiếp tục?",
      okText: "Từ chối",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          message.success("Đã từ chối yêu cầu");
          setState((prev) => ({
            ...prev,
            returns: prev.returns.map((r) =>
              r.id === returnId ? { ...r, status: "REJECTED" } : r
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to reject");
        }
      },
    });
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã yêu cầu</span>,
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
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          PENDING: "Pending",
          APPROVED: "Verified",
          REJECTED: "Rejected",
        };
        return <Badge status={statusMap[status] || "Pending"}>{status}</Badge>;
      },
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: ReturnRequestSummary) =>
        record.status === "PENDING" && (
          <Space size="middle">
            <Button
              type="text"
              icon={<CheckOutlined />}
              onClick={() => handleApproveReturn(record.id)}
              className="text-emerald-500 hover:!bg-emerald-50 rounded-xl font-bold"
            >
              Duyệt
            </Button>
            <Button
              danger
              type="text"
              icon={<CloseOutlined />}
              onClick={() => handleRejectReturn(record.id)}
              className="hover:!bg-red-50 rounded-xl font-bold"
            >
              Từ chối
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
    { label: "Tổng yêu cầu", value: state.stats.total, color: "bg-slate-50 text-slate-500" },
    { label: "Đang chờ duyệt", value: state.stats.pending, color: "bg-amber-50 text-amber-500" },
    { label: "Đã phê duyệt", value: state.stats.approved, color: "bg-emerald-50 text-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Kiểm duyệt trả hàng</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Xử lý các yêu cầu hoàn trả sản phẩm từ người mua, đảm bảo quyền lợi khách hàng và uy tín của hệ thống.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <ReloadOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quy trình xử lý</div>
            <div className="font-display text-2xl font-bold text-slate-800">Return Policy</div>
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
                  <div className="font-display text-2xl font-bold text-slate-800">Requests</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center gap-4 px-2">
          <HistoryOutlined className="text-xl text-primary/60" />
          <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Danh sách yêu cầu</Title>
        </div>

        <Table
          columns={columns}
          dataSource={state.returns.map((ret) => ({ ...ret, key: ret.id }))}
          pagination={false}
          className="luxury-table"
        />

        {state.returns.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Mọi thứ đã xong"
              description="Hiện không có yêu cầu hoàn trả nào đang chờ phê duyệt."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

