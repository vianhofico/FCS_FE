/**
 * My Returns Page (Buyer)
 * View all return requests
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spin, Table, Pagination, Select, Typography } from "antd";
import { EyeOutlined, ArrowLeftOutlined, ReconciliationOutlined } from "@ant-design/icons";
import { returnApi } from "@/modules/order/api/returnApi";
import type { ReturnRequestSummary } from "@/shared/contracts/returnContract";
import type { ReturnStatus } from "@/shared/contracts/commonContract";
import { useAuth } from "@/shared/context/AuthContext";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

interface MyReturnsPageState {
  returns: ReturnRequestSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  totalElements: number;
  statusFilter: string;
}

/**
 * My Returns Page component
 */
export default function MyReturnsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<MyReturnsPageState>({
    returns: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    totalElements: 0,
    statusFilter: "",
  });

  // Load returns
  useEffect(() => {
    const fetchReturns = async () => {
      if (!user) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await returnApi.getReturns({
          requestedById: user.id,
          status: state.statusFilter ? (state.statusFilter as ReturnStatus) : undefined,
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            returns: response.data.content,
            totalElements: response.data.totalElements,
            isLoading: false,
          }));
        }
      } catch {
        const errorMsg = "Failed to load returns";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchReturns();
  }, [state.page, state.size, state.statusFilter, user]);

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã yêu cầu</span>,
      dataIndex: "id",
      key: "id",
      render: (id: string) => <span className="font-mono text-xs font-bold text-slate-400">#{id.slice(0, 8).toUpperCase()}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đơn hàng</span>,
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId: string) => <span className="font-bold text-slate-700">#{orderId.slice(0, 8)}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sản phẩm</span>,
      dataIndex: "itemCount",
      key: "items",
      render: (count: number) => <span className="font-bold text-slate-600">{count} món</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lý do</span>,
      dataIndex: "reason",
      key: "reason",
      render: (reason: string) => <span className="text-slate-500 font-medium italic">"{reason}"</span>,
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
          ITEM_RECEIVED: "Processing",
          REFUNDED: "Verified",
        };
        const statusLabels: Record<string, string> = {
          PENDING: "Đang chờ",
          APPROVED: "Đã duyệt",
          REJECTED: "Bị từ chối",
          ITEM_RECEIVED: "Đã nhận hàng",
          REFUNDED: "Đã hoàn tiền",
        };
        return <Badge status={statusMap[status] || "Pending"}>{statusLabels[status] || status}</Badge>;
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày tạo</span>,
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => <span className="text-slate-500 font-medium">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: "",
      key: "action",
      align: "right" as const,
      render: (_: unknown, record: ReturnRequestSummary) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/buyer/returns/${record.id}`)}
          className="rounded-xl bg-pink-50 font-bold text-primary hover:!bg-primary hover:!text-white border-none h-10 px-4 flex items-center justify-center"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  if (state.isLoading && state.returns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Yêu cầu hoàn trả</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Theo dõi trạng thái các yêu cầu đổi trả và hoàn tiền để đảm bảo quyền lợi mua sắm tốt nhất.
          </Paragraph>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/orders")}
          className="rounded-xl border-pink-100 text-primary font-bold hover:border-primary h-12 px-6"
        >
          QUAY LẠI ĐƠN HÀNG
        </Button>
      </div>

      {state.error && (
        <Card className="rounded-[2rem] border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
          <Paragraph className="!m-0 font-medium text-red-800 italic">{state.error}</Paragraph>
        </Card>
      )}

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white/80 p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Lọc trạng thái:</span>
            <Select
              value={state.statusFilter}
              onChange={(value) => setState((prev) => ({ ...prev, statusFilter: value, page: 0 }))}
              placeholder="Tất cả yêu cầu"
              className="h-11 min-w-[200px]"
              allowClear
              options={[
                { label: "Tất cả", value: "" },
                { label: "Đang chờ", value: "PENDING" },
                { label: "Đã duyệt", value: "APPROVED" },
                { label: "Bị từ chối", value: "REJECTED" },
                { label: "Đã nhận hàng", value: "ITEM_RECEIVED" },
                { label: "Đã hoàn tiền", value: "REFUNDED" },
              ]}
            />
          </div>
        </div>

        {state.returns.length > 0 ? (
          <>
            <Spin spinning={state.isLoading}>
              <Table
                columns={columns}
                dataSource={state.returns.map((ret) => ({ ...ret, key: ret.id }))}
                pagination={false}
                scroll={{ x: "max-content" }}
                className="luxury-table"
              />
            </Spin>

            <div className="mt-10 flex justify-center">
              <Pagination
                current={state.page + 1}
                pageSize={state.size}
                total={state.totalElements}
                onChange={(newPage) =>
                  setState((prev) => ({ ...prev, page: newPage - 1 }))
                }
                showSizeChanger={false}
                className="luxury-pagination"
              />
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <EmptyState
              title="Không có yêu cầu nào"
              description="Bạn chưa có yêu cầu hoàn trả nào trong danh sách."
            />
          </div>
        )}
      </Card>

      <div className="flex justify-center pt-8">
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <ReconciliationOutlined className="text-primary text-xl" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quản lý hoàn trả</div>
            <div className="font-display text-2xl font-bold text-slate-800">{state.totalElements} Yêu cầu</div>
          </div>
        </div>
      </div>
    </div>
  );
}
