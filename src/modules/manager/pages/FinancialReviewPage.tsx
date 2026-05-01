/**
 * Financial Review Page (Manager)
 * Financial transaction review and oversight
 */

import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Empty, Statistic, Table } from "antd";

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
            amount: 500,
            status: "COMPLETED",
            createdAt: new Date().toISOString(),
          },
          {
            id: "t2",
            type: "WITHDRAWAL",
            amount: 1000,
            status: "PENDING",
            createdAt: new Date().toISOString(),
          },
        ];

        setState((prev) => ({
          ...prev,
          transactions: mockTransactions,
          stats: {
            totalRevenue: 50000,
            totalWithdrawals: 15000,
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
    { title: "Transaction ID", dataIndex: "id", key: "id" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Amount", dataIndex: "amount", key: "amount", render: (amount: number) => `$${amount}` },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Date", dataIndex: "createdAt", key: "date", render: (date: string) => new Date(date).toLocaleDateString() },
  ];

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Financial Review</h1>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Total Revenue" value={state.stats.totalRevenue} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Total Withdrawals" value={state.stats.totalWithdrawals} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="shadow-sm">
              <Statistic title="Pending Approvals" value={state.stats.pendingApprovals} valueStyle={{ color: "#faad14" }} />
            </Card>
          </Col>
        </Row>

        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        <Card title="Recent Transactions" className="shadow-sm">
          <Table
            columns={columns}
            dataSource={state.transactions.map((t) => ({ ...t, key: t.id }))}
            pagination={false}
            loading={state.isLoading}
          />
          {state.transactions.length === 0 && <Empty description="No transactions" />}
        </Card>
      </div>
    </div>
  );
}
