/**
 * Consignment Request List Page (Seller)
 * View all consignment requests with status filtering
 */

import {
  AuditOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import {
  Card,
  Col,
  Pagination,
  Row,
  Spin,
  Table,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import { useAuth } from "@/shared/context/AuthContext";
import { Badge, Button, EmptyState } from "@/shared/ui";
import type { ConsignmentRequestSummary } from "@/shared/contracts/consignmentContract";
import { ConsignmentRequestStatus } from "@/shared/contracts/commonContract";

const { Title, Paragraph } = Typography;

interface PageState {
  requests: ConsignmentRequestSummary[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
}

export default function ConsignmentRequestListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({
    requests: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
  });

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await consignmentApi.getConsignmentRequests({
          consignorId: user.id,
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            requests: response.data?.content || [],
            total: response.data?.totalElements || 0,
            isLoading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({ ...prev, isLoading: false, error: "Không thể tải danh sách yêu cầu" }));
      }
    };
    fetchRequests();
  }, [user, state.page, state.size]);

  const columns = [
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mã yêu cầu</span>,
      dataIndex: "id",
      key: "id",
      render: (id: string, record: ConsignmentRequestSummary) => (
        <span className="font-mono text-xs font-bold text-slate-400">{record.code ?? `#${id.slice(-8).toUpperCase()}`}</span>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        // Map backend status to UI status if they differ, otherwise pass through
        const statusMap: Record<string, string> = {
          PENDING: "Pending",
          ACCEPTED: "Verified",
          REJECTED: "Rejected",
          CANCELLED: "Inactive",
          SUBMITTED: "Submitted",
          APPROVED: "Verified",
          REVIEWING: "OnlineReview",
        };
        return <Badge status={statusMap[status] || status}>{status}</Badge>;
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày tạo</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date?: string) => {
        if (!date) return <span className="font-bold text-slate-400">—</span>;
        const createdAt = new Date(date);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-700">{createdAt.toLocaleDateString()}</span>
            <span className="text-[10px] text-slate-400">{createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      },
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      fixed: "right" as const,
      width: 130,
      render: (_: any, record: ConsignmentRequestSummary) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/seller/consignments/${record.id}`)}
          className="rounded-xl bg-pink-50 font-bold text-primary hover:!bg-primary hover:!text-white border-none h-10 px-4 flex items-center justify-center"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  const stats = [
    { label: "Yêu cầu đã gửi", value: state.total, icon: <ReconciliationOutlined />, color: "bg-primary/5 text-primary" },
    { label: "Đã được duyệt", value: state.requests.filter(r => r.status === ConsignmentRequestStatus.APPROVED).length, icon: <AuditOutlined />, color: "bg-emerald-50 text-emerald-500" },
    { label: "Đang chờ xử lý", value: state.requests.filter(r => r.status === ConsignmentRequestStatus.SUBMITTED || r.status === ConsignmentRequestStatus.REVIEWING).length, icon: <ClockCircleOutlined />, color: "bg-blue-50 text-blue-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Lịch sử ký gửi</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Theo dõi hành trình của từng món đồ từ lúc gửi yêu cầu cho đến khi được niêm yết chính thức.
          </Paragraph>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => navigate("/seller/consignments/new")}
          className="shadow-luxury"
        >
          TẠO YÊU CẦU MỚI
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={8}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  <div className="font-display text-3xl font-bold text-slate-800">{s.value}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm">
        <Spin spinning={state.isLoading && state.requests.length === 0}>
          <Table
            columns={columns}
            dataSource={state.requests.map(r => ({ ...r, key: r.id }))}
            pagination={false}
            scroll={{ x: 620 }}
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
          {state.requests.length === 0 && !state.isLoading && (
            <div className="py-10">
              <EmptyState
                title="Chưa có yêu cầu ký gửi"
                description="Bạn chưa gửi yêu cầu ký gửi sản phẩm nào. Hãy bắt đầu hành trình ký gửi món đồ đầu tiên!"
                action={
                  <Button type="primary" onClick={() => navigate("/seller/consignments/new")}>
                    Gửi yêu cầu ngay
                  </Button>
                }
              />
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
}
