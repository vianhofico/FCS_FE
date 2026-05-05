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
  Table,
  Modal,
  Form,
  Input,
  message,
  Select,
  Typography,
} from "antd";
import { DollarOutlined, BankOutlined, WalletOutlined, ArrowUpOutlined, PlusOutlined } from "@ant-design/icons";
import { financialApi } from "@/modules/seller/api/financialApi";
import { useAuth } from "@/shared/context/AuthContext";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

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

        const financialResponse = await financialApi.getSellerFinancials(user.id);

        if (financialResponse.success && financialResponse.data) {
          setState((prev) => ({
            ...prev,
            balance: financialResponse.data?.balance || 0,
            totalEarnings: financialResponse.data?.totalEarnings || 0,
            totalWithdrawn: financialResponse.data?.totalWithdrawn || 0,
            pendingWithdrawal: financialResponse.data?.pendingWithdrawal || 0,
            withdrawals: financialResponse.data?.withdrawals || [],
            bankAccounts: financialResponse.data?.bankAccounts || [],
            isLoading: false,
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Không thể tải dữ liệu tài chính",
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
        message.success("Yêu cầu rút tiền đã được gửi");
        setState((prev) => ({
          ...prev,
          showWithdrawalModal: false,
          balance: prev.balance - parseFloat(values.amount),
          pendingWithdrawal: prev.pendingWithdrawal + parseFloat(values.amount),
        }));
        form.resetFields();
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Gửi yêu cầu rút tiền thất bại");
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
        message.success("Đã thêm tài khoản ngân hàng");
      }
    } catch {
      message.error("Thêm tài khoản ngân hàng thất bại");
    }
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã giao dịch</span>,
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span className="font-mono text-xs font-bold text-slate-400">#{text.slice(-8).toUpperCase()}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số tiền</span>,
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => <span className="text-lg font-bold text-slate-700">{amount.toLocaleString()}₫</span>,
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
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày thực hiện</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{new Date(date).toLocaleDateString()}</span>
          <span className="text-[10px] text-slate-400">{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
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
    { label: "Số dư khả dụng", value: state.balance, icon: <WalletOutlined />, color: "bg-primary/5 text-primary" },
    { label: "Tổng thu nhập", value: state.totalEarnings, icon: <DollarOutlined />, color: "bg-emerald-50 text-emerald-500" },
    { label: "Đã rút", value: state.totalWithdrawn, icon: <BankOutlined />, color: "bg-slate-50 text-slate-500" },
    { label: "Đang chờ duyệt", value: state.pendingWithdrawal, icon: <ArrowUpOutlined />, color: "bg-blue-50 text-blue-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Tài chính</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Quản lý doanh thu, theo dõi các khoản rút tiền và thiết lập thông tin thanh toán của bạn.
          </Paragraph>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            type="primary"
            size="large"
            icon={<ArrowUpOutlined />}
            onClick={() => setState((prev) => ({ ...prev, showWithdrawalModal: true }))}
            disabled={state.balance <= 0}
            className="w-full shadow-luxury sm:w-auto"
          >
            YÊU CẦU RÚT TIỀN
          </Button>
          <Button
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setState((prev) => ({ ...prev, showBankAccountModal: true }))}
            className="w-full rounded-xl border-pink-100 text-primary font-bold transition-soft hover:border-primary sm:w-auto"
          >
            THÊM NGÂN HÀNG
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {stats.map((s, i) => (
          <Col key={i} xs={24} sm={12} md={6}>
            <Card className="rounded-[2rem] border-pink-100/50 bg-white/50 shadow-sm backdrop-blur-md transition-soft hover:shadow-luxury">
              <div className="flex items-center gap-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                  <div className="font-display text-2xl font-bold text-slate-800">{s.value.toLocaleString()}₫</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={<span className="font-display text-xl font-bold uppercase tracking-widest text-text-dark">Lịch sử giao dịch</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm"
          >
            <Table
              columns={columns}
              dataSource={state.withdrawals.map((w) => ({ ...w, key: w.id }))}
              pagination={{ pageSize: 5 }}
              locale={{
                emptyText: <EmptyState title="Chưa có giao dịch" description="Lịch sử rút tiền của bạn sẽ hiển thị tại đây." />,
              }}
              className="luxury-table"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={<span className="font-display text-xl font-bold uppercase tracking-widest text-text-dark">Tài khoản ngân hàng</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-4 shadow-sm"
          >
            {state.bankAccounts.length > 0 ? (
              <div className="space-y-4">
                {state.bankAccounts.map((account) => (
                  <div key={account.id} className="relative overflow-hidden rounded-3xl border border-pink-50 bg-pink-50/20 p-6 transition-soft hover:border-pink-100 hover:bg-white hover:shadow-md">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <BankOutlined className="text-2xl text-primary/60" />
                        {account.isPrimary && <Badge status="Verified">Mặc định</Badge>}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-slate-800">{account.bankName}</div>
                        <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">{account.accountHolder}</div>
                      </div>
                      <div className="font-mono text-base font-bold text-primary tracking-wider">{account.accountNumber}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Chưa có tài khoản"
                description="Vui lòng thêm tài khoản ngân hàng để thực hiện rút tiền."
                action={<Button onClick={() => setState((prev) => ({ ...prev, showBankAccountModal: true }))}>Thêm ngay</Button>}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Modals remain mostly the same but could use some luxury styling in inputs */}
      <Modal
        title={<Title level={4} className="!m-0 !font-display uppercase tracking-tight">Yêu cầu rút tiền</Title>}
        open={state.showWithdrawalModal}
        onOk={() => form.submit()}
        onCancel={() => setState((prev) => ({ ...prev, showWithdrawalModal: false }))}
        footer={null}
        className="luxury-modal"
        centered
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleRequestWithdrawal} className="mt-6">
          <Form.Item
            name="amount"
            label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số tiền muốn rút</span>}
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              { pattern: /^\d+(\.\d{1,2})?$/, message: "Vui lòng nhập số tiền hợp lệ" },
            ]}
          >
            <Input
              placeholder={`Tối đa: ${state.balance.toLocaleString()}₫`}
              suffix="₫"
              className="rounded-2xl border-pink-100 bg-white h-12 hover:border-primary/40 focus:border-primary font-bold text-lg"
            />
          </Form.Item>
          <Form.Item
            name="method"
            label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Phương thức thanh toán</span>}
            rules={[{ required: true, message: "Vui lòng chọn phương thức" }]}
          >
            <Select
              placeholder="Chọn phương thức"
              className="h-12 w-full"
              options={[
                { label: "Chuyển khoản ngân hàng", value: "BANK_TRANSFER" },
                { label: "Ví điện tử", value: "WALLET" },
              ]}
            />
          </Form.Item>
          <div className="mt-10 flex gap-4">
            <Button block size="large" onClick={() => setState((prev) => ({ ...prev, showWithdrawalModal: false }))}>HỦY BỎ</Button>
            <Button type="primary" block size="large" htmlType="submit">XÁC NHẬN RÚT</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={<Title level={4} className="!m-0 !font-display uppercase tracking-tight">Thêm tài khoản ngân hàng</Title>}
        open={state.showBankAccountModal}
        onCancel={() => setState((prev) => ({ ...prev, showBankAccountModal: false }))}
        footer={null}
        className="luxury-modal"
        centered
      >
        <Form form={form} layout="vertical" onFinish={handleAddBankAccount} className="mt-6">
          <Form.Item name="bankName" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tên ngân hàng</span>} rules={[{ required: true, message: "Vui lòng nhập tên ngân hàng" }]}>
            <Input placeholder="Ví dụ: Vietcombank" className="rounded-2xl border-pink-100 h-12" />
          </Form.Item>
          <Form.Item name="accountNumber" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Số tài khoản</span>} rules={[{ required: true, message: "Vui lòng nhập số tài khoản" }]}>
            <Input placeholder="Nhập số tài khoản" className="rounded-2xl border-pink-100 h-12" />
          </Form.Item>
          <Form.Item name="accountHolder" label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tên chủ tài khoản</span>} rules={[{ required: true, message: "Vui lòng nhập tên chủ tài khoản" }]}>
            <Input placeholder="VIẾT CHỮ IN HOA KHÔNG DẤU" className="rounded-2xl border-pink-100 h-12" />
          </Form.Item>
          <div className="mt-10 flex gap-4">
            <Button block size="large" onClick={() => setState((prev) => ({ ...prev, showBankAccountModal: false }))}>HỦY BỎ</Button>
            <Button type="primary" block size="large" htmlType="submit">LƯU THÔNG TIN</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
