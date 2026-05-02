/**
 * Financial Review Page (Manager)
 * Financial transaction review and oversight
 */

import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Table, Typography } from "antd";
import { WalletOutlined, TransactionOutlined, BankOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Badge, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface PageState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  stats: {
    totalRevenue: number;
    totalWithdrawals: number;
    pendingApprovals: number;
  };
}

export default function FinancialReviewPage() {
  const [state, setState] = useState<PageState>({
    transactions: [],
    isLoading: true,
    error: null,
    stats: {
      totalRevenue: 0,
      totalWithdrawals: 0,
      pendingApprovals: 0,
    },
  });

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Mock data
        const mockTransactions: Transaction[] = [
          {
            id: "t1",
            type: "ORDER",
            amount: 500000,
            status: "COMPLETED",
            createdAt: new Date().toISOString(),
          },
          {
            id: "t2",
            type: "WITHDRAWAL",
            amount: 1000000,
            status: "PENDING",
            createdAt: new Date().toISOString(),
          },
        ];

        setState((prev) => ({
          ...prev,
          transactions: mockTransactions,
          stats: {
            totalRevenue: 50000000,
            totalWithdrawals: 15000000,
            pendingApprovals: 3,
          },
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load financial data",
        }));
      }
    };

    fetchFinancials();
  }, []);

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã giao dịch</span>,
      dataIndex: "id",
      key: "id",
      render: (id: string) => <span className="font-mono text-xs font-bold text-slate-400">#{id.toUpperCase()}</span>,
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
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số tiền</span>,
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => <span className="font-display text-lg font-bold text-slate-700">{amount.toLocaleString()}₫</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          COMPLETED: "Verified",
          PENDING: "Pending",
          FAILED: "Rejected",
        };
        return <Badge status={statusMap[status] || "Pending"}>{status}</Badge>;
      },
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày giao dịch</span>,
      dataIndex: "createdAt",
      key: "date",
      render: (date: string) => <span className="font-medium text-slate-500">{new Date(date).toLocaleDateString()}</span>,
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
    { label: "Tổng doanh thu", value: state.stats.totalRevenue.toLocaleString(), color: "bg-emerald-50 text-emerald-500", icon: <BankOutlined />, suffix: "₫" },
    { label: "Tiền rút", value: state.stats.totalWithdrawals.toLocaleString(), color: "bg-blue-50 text-blue-500", icon: <WalletOutlined />, suffix: "₫" },
    { label: "Yêu cầu rút tiền", value: state.stats.pendingApprovals, color: "bg-amber-50 text-amber-500", icon: <ClockCircleOutlined />, suffix: "" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Kiểm soát tài chính</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Theo dõi luồng tiền, phê duyệt các yêu cầu rút tiền và giám sát mọi giao dịch kinh tế trên nền tảng.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <WalletOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số dư hệ thống</div>
            <div className="font-display text-2xl font-bold text-slate-800">Financial Integrity</div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={8}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  <div className="font-display text-2xl font-bold text-slate-800">{s.value}{s.suffix}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center gap-4 px-2">
          <TransactionOutlined className="text-xl text-primary/60" />
          <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Giao dịch gần đây</Title>
        </div>

        <Table
          columns={columns}
          dataSource={state.transactions.map((t) => ({ ...t, key: t.id }))}
          pagination={false}
          className="luxury-table"
        />

        {state.transactions.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Chưa có giao dịch"
              description="Hiện tại không có hoạt động tài chính nào được ghi nhận."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

