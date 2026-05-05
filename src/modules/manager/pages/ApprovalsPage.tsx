/**
 * Approvals Page (Manager)
 * System approvals and requests
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
import { CheckOutlined, CloseOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import type { ConsignmentRequestSummary } from "@/shared/contracts/consignmentContract";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

const CONSIGNOR_LABELS: Record<string, string> = {
  "cccccccc-cccc-cccc-cccc-cccccccccccc": "consignor_jane",
};

type ApprovalRequest = ConsignmentRequestSummary;

interface PageState {
  approvals: ApprovalRequest[];
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

export default function ApprovalsPage() {
  const [state, setState] = useState<PageState>({
    approvals: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
    stats: { total: 0, pending: 0, approved: 0 },
  });

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const response = await consignmentApi.getConsignmentRequests({
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          const approvals = response.data.content.filter((request) =>
            ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"].includes(request.status)
          );

          setState((prev) => ({
            ...prev,
            approvals,
            total: response.data?.totalElements || approvals.length,
            stats: {
              total: approvals.length,
              pending: approvals.filter((a) => ["SUBMITTED", "UNDER_REVIEW"].includes(a.status)).length,
              approved: approvals.filter((a) => a.status === "APPROVED").length,
            },
            isLoading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Không thể tải danh sách phê duyệt",
        }));
      }
    };

    fetchApprovals();
  }, [state.page, state.size]);

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: "Phê duyệt yêu cầu",
      content: "Bạn có chắc chắn muốn phê duyệt yêu cầu này không?",
      okText: "Phê duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await consignmentApi.acceptConsignment(id);
          if (response.success) {
            message.success("Đã phê duyệt yêu cầu");
            setState((prev) => ({
              ...prev,
              approvals: prev.approvals.map((a) =>
                a.id === id ? { ...a, status: "APPROVED" } : a
              ),
            }));
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Phê duyệt thất bại");
        }
      },
    });
  };

  const handleReject = (id: string) => {
    Modal.confirm({
      title: "Từ chối yêu cầu",
      content: "Bạn có chắc chắn muốn từ chối yêu cầu này không?",
      okText: "Từ chối",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await consignmentApi.rejectConsignment(id, {
            reason: "Từ chối bởi quản lý",
          });
          if (response.success) {
            message.success("Đã từ chối yêu cầu");
            setState((prev) => ({
              ...prev,
              approvals: prev.approvals.map((a) =>
                a.id === id ? { ...a, status: "REJECTED" } : a
              ),
            }));
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Từ chối thất bại");
        }
      },
    });
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loại phê duyệt</span>,
      key: "type",
      render: () => <span className="font-bold text-slate-700">Yêu cầu ký gửi</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Người yêu cầu</span>,
      key: "requester",
      render: (_: unknown, record: ApprovalRequest) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{CONSIGNOR_LABELS[record.consignorId] || "Người ký gửi"}</span>
          <span className="font-mono text-[10px] text-slate-400">#{record.consignorId.slice(-8).toUpperCase()}</span>
        </div>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nội dung</span>,
      key: "description",
      render: (_: unknown, record: ApprovalRequest) => record.note || record.code,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          SUBMITTED: "Submitted",
          UNDER_REVIEW: "Processing",
          APPROVED: "Verified",
          REJECTED: "Rejected",
        };
        const statusLabels: Record<string, string> = {
          SUBMITTED: "Đã gửi",
          UNDER_REVIEW: "Đang xem xét",
          APPROVED: "Đã duyệt",
          REJECTED: "Bị từ chối",
        };
        return <Badge status={statusMap[status] || "Pending"}>{statusLabels[status] || status}</Badge>;
      },
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: ApprovalRequest) => (
        <Space size="middle">
          {["SUBMITTED", "UNDER_REVIEW"].includes(record.status) && (
            <>
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                className="text-emerald-500 hover:!bg-emerald-50 rounded-xl font-bold"
              >
                Phê duyệt
              </Button>
              <Button
                danger
                type="text"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
                className="hover:!bg-red-50 rounded-xl font-bold"
              >
                Từ chối
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
    { label: "Tổng yêu cầu", value: state.stats.total, color: "bg-slate-50 text-slate-500" },
    { label: "Đang chờ xử lý", value: state.stats.pending, color: "bg-blue-50 text-blue-500" },
    { label: "Đã phê duyệt", value: state.stats.approved, color: "bg-emerald-50 text-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Phê duyệt hệ thống</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Quản lý và kiểm soát các yêu cầu ký gửi, xác minh sản phẩm và các thay đổi quan trọng khác.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <SafetyCertificateOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Độ tin cậy hệ thống</div>
            <div className="font-display text-2xl font-bold text-slate-800">High Integrity</div>
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
                  <div className="font-display text-2xl font-bold text-slate-800">Yêu cầu</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm">
        <Table
          columns={columns}
          dataSource={state.approvals.map((approval) => ({ ...approval, key: approval.id }))}
          pagination={false}
          className="luxury-table"
        />
        {state.approvals.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState title="Tất cả đã hoàn tất" description="Không có yêu cầu phê duyệt nào đang chờ xử lý." />
          </div>
        )}
      </Card>
    </div>
  );
}
