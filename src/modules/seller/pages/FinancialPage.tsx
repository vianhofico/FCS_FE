/**
 * Financial Page (Seller)
 * Manage earnings, withdrawals, and financial information
 */

import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Empty,
  Statistic,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Select,
} from "antd";
import { DollarOutlined, BankOutlined, WalletOutlined } from "@ant-design/icons";
import { financialApi } from "@/modules/seller/api/financialApi";
import { useAuth } from "@/shared/context/AuthContext";

interface PageState {
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  pendingWithdrawal: number;
  withdrawals: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  bankAccounts: Array<{
    id: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    isPrimary: boolean;
  }>;
  isLoading: boolean;
  error: string | null;
  showWithdrawalModal: boolean;
  showBankAccountModal: boolean;
}

export default function FinancialPage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [state, setState] = useState<PageState>({
    balance: 0,
    totalEarnings: 0,
    totalWithdrawn: 0,
    pendingWithdrawal: 0,
    withdrawals: [],
    bankAccounts: [],
    isLoading: true,
    error: null,
    showWithdrawalModal: false,
    showBankAccountModal: false,
  });

  useEffect(() => {
    if (!user) return;

    const fetchFinancialData = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const [financialResponse, bankAccountResponse] = await Promise.all([
          financialApi.getSellerFinancials(user.id),
          financialApi.getBankAccounts(user.id),
        ]);

        if (financialResponse.success && financialResponse.data) {
          setState((prev) => ({
            ...prev,
            balance: financialResponse.data?.balance || 0,
            totalEarnings: financialResponse.data?.totalEarnings || 0,
            totalWithdrawn: financialResponse.data?.totalWithdrawn || 0,
            pendingWithdrawal: financialResponse.data?.pendingWithdrawal || 0,
            withdrawals: financialResponse.data?.withdrawals || [],
            bankAccounts: bankAccountResponse.success ? bankAccountResponse.data || [] : [],
            isLoading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load financial data",
        }));
      }
    };

    fetchFinancialData();
  }, [user]);

  const handleRequestWithdrawal = async (values: { amount: string; method: string }) => {
    try {
      const response = await financialApi.requestWithdrawal({
        sellerId: user!.id,
        amount: parseFloat(values.amount),
        method: values.method,
      });

      if (response.success) {
        message.success("Withdrawal request submitted");
        setState((prev) => ({
          ...prev,
          showWithdrawalModal: false,
          balance: prev.balance - parseFloat(values.amount),
          pendingWithdrawal: prev.pendingWithdrawal + parseFloat(values.amount),
        }));
        form.resetFields();
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to request withdrawal");
    }
  };

  const handleAddBankAccount = async (values: { bankName: string; accountNumber: string; accountHolder: string }) => {
    if (!user) return;

    try {
      const response = await financialApi.addBankAccount(user.id, values);
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          bankAccounts: [...prev.bankAccounts, { ...response.data, isPrimary: prev.bankAccounts.length === 0 }],
          showBankAccountModal: false,
        }));
        message.success("Bank account added");
      }
    } catch {
      message.error("Failed to add bank account");
    }
  };

  const columns = [
    {
      title: "Withdrawal ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => <span className="font-semibold">${amount.toLocaleString()}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
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
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Financial Management</h1>

        {/* Statistics */}
        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Current Balance"
                value={state.balance}
                prefix={<DollarOutlined />}
                valueStyle={{ fontSize: "1.5rem", color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Earnings"
                value={state.totalEarnings}
                prefix={<WalletOutlined />}
                valueStyle={{ fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Withdrawn"
                value={state.totalWithdrawn}
                prefix={<BankOutlined />}
                valueStyle={{ fontSize: "1.5rem" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Pending Withdrawal"
                value={state.pendingWithdrawal}
                prefix="$"
                valueStyle={{ fontSize: "1.5rem", color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Actions */}
        <Card className="mb-6 shadow-sm">
          <Space>
            <Button
              type="primary"
              size="large"
              onClick={() => setState((prev) => ({ ...prev, showWithdrawalModal: true }))}
              disabled={state.balance <= 0}
            >
              Request Withdrawal
            </Button>
            <Button onClick={() => setState((prev) => ({ ...prev, showBankAccountModal: true }))}>View Bank Accounts</Button>
          </Space>
        </Card>

        <Card title="Bank Accounts" className="mb-6 shadow-sm">
          {state.bankAccounts.length > 0 ? (
            <Space direction="vertical" style={{ width: "100%" }}>
              {state.bankAccounts.map((account) => (
                <Card key={account.id} size="small">
                  <Space direction="vertical" size={4}>
                    <div className="font-semibold">
                      {account.bankName} {account.isPrimary ? <span className="text-green-600">(Primary)</span> : null}
                    </div>
                    <div className="text-sm text-gray-600">{account.accountHolder}</div>
                    <div className="text-sm text-gray-600">{account.accountNumber}</div>
                  </Space>
                </Card>
              ))}
            </Space>
          ) : (
            <Empty description="No bank accounts configured" />
          )}
        </Card>

        {/* Withdrawal History */}
        <Card title="Withdrawal History" className="shadow-sm">
          <Table
            columns={columns}
            dataSource={state.withdrawals.map((w) => ({ ...w, key: w.id }))}
            pagination={{ pageSize: 10 }}
          />
          {state.withdrawals.length === 0 && <Empty description="No withdrawals" />}
        </Card>

        {/* Withdrawal Modal */}
        <Modal
          title="Request Withdrawal"
          open={state.showWithdrawalModal}
          onOk={() => form.submit()}
          onCancel={() => setState((prev) => ({ ...prev, showWithdrawalModal: false }))}
        >
          <Form form={form} layout="vertical" onFinish={handleRequestWithdrawal}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={[
                { required: true, message: "Please enter amount" },
                {
                  pattern: /^\d+(\.\d{1,2})?$/,
                  message: "Please enter valid amount",
                },
              ]}
            >
              <Input placeholder={`Max: $${state.balance.toLocaleString()}`} prefix="$" />
            </Form.Item>
            <Form.Item
              name="method"
              label="Withdrawal Method"
              rules={[{ required: true, message: "Please select method" }]}
            >
              <Select
                placeholder="Select method"
                options={[
                  { label: "Bank Transfer", value: "BANK_TRANSFER" },
                  { label: "Wallet", value: "WALLET" },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Add Bank Account"
          open={state.showBankAccountModal}
          onCancel={() => setState((prev) => ({ ...prev, showBankAccountModal: false }))}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical" onFinish={handleAddBankAccount}>
            <Form.Item name="bankName" label="Bank Name" rules={[{ required: true, message: "Please enter bank name" }]}>
              <Input placeholder="Bank name" />
            </Form.Item>
            <Form.Item name="accountNumber" label="Account Number" rules={[{ required: true, message: "Please enter account number" }]}>
              <Input placeholder="Account number" />
            </Form.Item>
            <Form.Item name="accountHolder" label="Account Holder" rules={[{ required: true, message: "Please enter account holder" }]}>
              <Input placeholder="Account holder name" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
