/**
 * User Management Page (Manager)
 * User oversight and management
 */

import { useState, useEffect } from "react";
import { Card, Table, Spin, Modal, message, Space, Input, Typography, Row, Col } from "antd";
import { LockOutlined, UnlockOutlined, DeleteOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Paragraph } = Typography;

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface PageState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
  search: string;
}

export default function UserManagementPage() {
  const [state, setState] = useState<PageState>({
    users: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
    search: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Mock data
        const mockUsers: User[] = [
          { id: "u1", email: "buyer@example.com", role: "BUYER", status: "ACTIVE", createdAt: new Date().toISOString() },
          { id: "u2", email: "seller@example.com", role: "SELLER", status: "ACTIVE", createdAt: new Date().toISOString() },
          { id: "u3", email: "inactive@example.com", role: "BUYER", status: "INACTIVE", createdAt: new Date().toISOString() },
        ];

        setState((prev) => ({
          ...prev,
          users: mockUsers,
          total: mockUsers.length,
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to load users",
        }));
      }
    };

    fetchUsers();
  }, [state.page, state.size, state.search]);

  const handleSuspendUser = (userId: string) => {
    Modal.confirm({
      title: "Khóa tài khoản",
      content: "Bạn có chắc chắn muốn khóa tài khoản người dùng này không?",
      okText: "Khóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          message.success("Đã khóa tài khoản");
          setState((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, status: "SUSPENDED" } : u
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Khóa tài khoản thất bại");
        }
      },
    });
  };

  const handleActivateUser = (userId: string) => {
    Modal.confirm({
      title: "Mở khóa tài khoản",
      content: "Bạn muốn mở khóa cho tài khoản này?",
      okText: "Mở khóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          message.success("Đã mở khóa tài khoản");
          setState((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, status: "ACTIVE" } : u
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Mở khóa thất bại");
        }
      },
    });
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: "Xóa người dùng",
      content: "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa người dùng này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          message.success("Đã xóa người dùng");
          setState((prev) => ({
            ...prev,
            users: prev.users.filter((u) => u.id !== userId),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Xóa người dùng thất bại");
        }
      },
    });
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</span>,
      dataIndex: "email",
      key: "email",
      render: (email: string) => <span className="font-bold text-slate-700">{email}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vai trò</span>,
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <span className="inline-flex items-center rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 border border-slate-100">
          {role}
        </span>
      ),
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusMap: Record<string, string> = {
          ACTIVE: "Active",
          SUSPENDED: "Suspended",
          INACTIVE: "Inactive",
        };
        return <Badge status={statusMap[status] || "Active"}>{status}</Badge>;
      },
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      render: (_: unknown, record: User) => (
        <Space size="middle">
          {record.status === "ACTIVE" ? (
            <Button
              type="text"
              icon={<LockOutlined />}
              onClick={() => handleSuspendUser(record.id)}
              className="text-amber-500 hover:!bg-amber-50 rounded-xl font-bold"
            >
              Khóa
            </Button>
          ) : (
            <Button
              type="text"
              icon={<UnlockOutlined />}
              onClick={() => handleActivateUser(record.id)}
              className="text-emerald-500 hover:!bg-emerald-50 rounded-xl font-bold"
            >
              Mở khóa
            </Button>
          )}
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
            className="hover:!bg-red-50 rounded-xl font-bold"
          >
            Xóa
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
    { label: "Tổng người dùng", value: state.total, color: "bg-slate-50 text-slate-500" },
    { label: "Đang hoạt động", value: state.users.filter(u => u.status === 'ACTIVE').length, color: "bg-emerald-50 text-emerald-500" },
    { label: "Bị tạm ngưng", value: state.users.filter(u => u.status === 'SUSPENDED').length, color: "bg-amber-50 text-amber-500" },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Quản lý người dùng</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Kiểm soát quyền truy cập, theo dõi trạng thái và quản lý tài khoản người dùng trên toàn hệ thống.
          </Paragraph>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white/50 px-8 py-4 backdrop-blur-md border border-pink-100/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary text-xl">
            <UserOutlined />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng quy mô</div>
            <div className="font-display text-2xl font-bold text-slate-800">{state.total} Thành viên</div>
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
                  <div className="font-display text-2xl font-bold text-slate-800">Users</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-6 shadow-sm">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <SearchOutlined className="text-xl text-primary/60" />
            <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Danh sách người dùng</Title>
          </div>
          <Input
            placeholder="Tìm kiếm theo email..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={state.search}
            onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))}
            className="h-12 w-full md:w-80 rounded-2xl border-slate-100 bg-slate-50/50 font-medium"
          />
        </div>

        <Table
          columns={columns}
          dataSource={state.users.map((user) => ({ ...user, key: user.id }))}
          pagination={false}
          className="luxury-table"
        />

        {state.users.length === 0 && (
          <div className="py-20 text-center">
            <EmptyState
              title="Không tìm thấy người dùng"
              description="Hãy thử thay đổi từ khóa tìm kiếm của bạn."
            />
          </div>
        )}
      </Card>
    </div>
  );
}

