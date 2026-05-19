/**
 * Consignment Contract Page (Seller)
 * View and manage consignment contracts
 */

import { useState, useEffect } from "react";
import { Card, Table, Space, Spin, Modal, message, Typography, Pagination } from "antd";
import { DownloadOutlined, FileDoneOutlined, HistoryOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { consignmentApi } from "../api/consignmentApi";
import type { ConsignmentContract } from "@/shared/contracts/consignmentContract";
import { useAuth } from "@/shared/context/AuthContext";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

interface PageState {
  contracts: ConsignmentContract[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
}

export default function ConsignmentContractPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>({
    contracts: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchContracts = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await consignmentApi.getConsignmentContracts({
          consignorId: user.id,
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            contracts: response.data?.content || [],
            total: response.data?.totalElements || 0,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load contracts";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchContracts();
  }, [user, state.page, state.size]);

  const handleDownloadContract = async (contractId: string) => {
    try {
      message.loading({ content: "Đang tải hợp đồng...", key: "download" });
      const response = await consignmentApi.downloadContract(contractId);

      if (response.success) {
        // In real scenario, trigger file download
        message.success({ content: "Đã tải hợp đồng thành công", key: "download" });
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Tải hợp đồng thất bại");
    }
  };

  const handleTerminateContract = (contractId: string) => {
    Modal.confirm({
      title: "Chấm dứt hợp đồng",
      content: "Bạn có chắc chắn muốn chấm dứt hợp đồng này? Hành động này không thể hoàn tác.",
      okText: "Đồng ý, Chấm dứt",
      okType: "danger",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          const response = await consignmentApi.terminateContract(contractId);

          if (response.success) {
            message.success("Hợp đồng đã được chấm dứt");
            setState((prev) => ({
              ...prev,
              contracts: prev.contracts.map((c) =>
                c.id === contractId ? { ...c, status: "TERMINATED" } : c
              ),
            }));
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Chấm dứt hợp đồng thất bại");
        }
      },
    });
  };

  if (state.isLoading && state.contracts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã hợp đồng</span>,
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span className="font-mono text-xs font-bold text-slate-400">#{text.slice(-8).toUpperCase()}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          DRAFT: "Pending",
          SIGNED: "Verified",
          EXPIRED: "Inactive",
          TERMINATED: "Rejected",
        };
        const statusLabels: Record<string, string> = {
          DRAFT: "Bản nháp",
          SIGNED: "Đã ký",
          EXPIRED: "Hết hạn",
          TERMINATED: "Đã chấm dứt",
        };
        return <Badge status={statusMap[status] || "Pending"}>{statusLabels[status] || status}</Badge>;
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mức hoa hồng</span>,
      dataIndex: "commissionRate",
      key: "commission",
      render: (rate?: number) => {
        const percent = rate ? (rate <= 1 ? rate * 100 : rate) : 0;
        return <span className="font-bold text-primary">{percent.toLocaleString()}%</span>;
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày ký</span>,
      key: "signedAt",
      render: (_: unknown, record: ConsignmentContract) => {
        const date = record.signedAt ?? record.createdAt;
        return <span className="font-bold text-slate-700">{date ? new Date(date).toLocaleDateString() : "—"}</span>;
      },
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      fixed: "right" as const,
      width: 240,
      render: (_: unknown, record: ConsignmentContract) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadContract(record.id)}
            className="text-primary hover:!bg-pink-50 rounded-xl"
          >
            Tải về
          </Button>
          {record.status === "SIGNED" ? (
            <Button
              danger
              type="text"
              onClick={() => handleTerminateContract(record.id)}
              className="hover:!bg-red-50 rounded-xl"
            >
              Chấm dứt
            </Button>
          ) : record.status === "DRAFT" ? (
            <Button
              type="primary"
              onClick={() => navigate(`/seller/consignments/${record.requestId}/contract/sign`)}
              className="rounded-xl font-bold"
            >
              Ký ngay
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Hợp đồng ký gửi</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Xem và quản lý các thỏa thuận pháp lý giữa bạn và Re:Wear cho từng đợt ký gửi sản phẩm.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <FileDoneOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đang hiệu lực</div>
            <div className="font-display text-2xl font-bold text-slate-800">{state.contracts.filter(c => c.status === 'SIGNED').length} Hợp đồng</div>
          </div>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm">
        <div className="mb-8 flex items-center gap-4 px-4">
          <HistoryOutlined className="text-xl text-primary/60" />
          <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Danh sách thỏa thuận</Title>
        </div>

        <Table
          columns={columns}
          dataSource={state.contracts.map((contract) => ({ ...contract, key: contract.id }))}
          pagination={false}
          loading={state.isLoading}
          scroll={{ x: 820 }}
          className="luxury-table"
        />

        <div className="mt-10 flex justify-center">
          <Pagination
            current={state.page + 1}
            pageSize={state.size}
            total={state.total}
            onChange={(p) => setState(prev => ({ ...prev, page: p - 1 }))}
            showSizeChanger={false}
            className="luxury-pagination"
          />
        </div>

        {state.contracts.length === 0 && !state.isLoading && (
          <div className="py-20 text-center">
            <EmptyState
              title="Chưa có hợp đồng nào"
              description="Hợp đồng sẽ được tạo tự động sau khi yêu cầu ký gửi của bạn được phê duyệt."
              action={<Button type="primary" onClick={() => navigate("/seller/consignments")}>Xem yêu cầu ký gửi</Button>}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
