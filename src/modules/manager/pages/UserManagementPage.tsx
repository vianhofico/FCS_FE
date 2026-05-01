/**
 * User Management Page (Manager)
 * User oversight and management
 */

import { useState, useEffect } from "react";
import { Card, Button, Table, Spin, Empty, Tag, Modal, message, Space, Input } from "antd";
import { LockOutlined, UnlockOutlined, DeleteOutlined } from "@ant-design/icons";

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
      title: "Suspend User",
      content: "Are you sure you want to suspend this user?",
      okText: "Suspend",
      okType: "danger",
      onOk: async () => {
        try {
          message.success("User suspended");
          setState((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, status: "SUSPENDED" } : u
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to suspend user");
        }
      },
    });
  };

  const handleActivateUser = (userId: string) => {
    Modal.confirm({
      title: "Activate User",
      content: "Activate this user?",
      okText: "Activate",
      onOk: async () => {
        try {
          message.success("User activated");
          setState((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.id === userId ? { ...u, status: "ACTIVE" } : u
            ),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to activate user");
        }
      },
    });
  };

  const handleDeleteUser = (userId: string) => {
    Modal.confirm({
      title: "Delete User",
      content: "This action cannot be undone. Delete this user?",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          message.success("User deleted");
          setState((prev) => ({
            ...prev,
            users: prev.users.filter((u) => u.id !== userId),
          }));
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to delete user");
        }
      },
    });
  };

  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag>{role}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : status === "SUSPENDED" ? "orange" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: User) => (
        <Space size="small">
          {record.status === "ACTIVE" ? (
            <Button
              type="link"
              icon={<LockOutlined />}
              onClick={() => handleSuspendUser(record.id)}
              size="small"
            >
              Suspend
            </Button>
          ) : (
            <Button
              type="link"
              icon={<UnlockOutlined />}
              onClick={() => handleActivateUser(record.id)}
              size="small"
            >
              Activate
            </Button>
          )}
          <Button
            danger
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
            size="small"
          >
            Delete
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>

        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        <Card title="Users" className="shadow-sm" extra={
          <Input
            placeholder="Search by email"
            value={state.search}
            onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))}
            style={{ width: 200 }}
          />
        }>
          <Table
            columns={columns}
            dataSource={state.users.map((user) => ({ ...user, key: user.id }))}
            pagination={false}
            loading={state.isLoading}
          />
          {state.users.length === 0 && <Empty description="No users found" />}
        </Card>
      </div>
    </div>
  );
}
