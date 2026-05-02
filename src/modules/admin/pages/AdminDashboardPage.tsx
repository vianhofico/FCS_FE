/**
 * Admin Dashboard Page
 * Main admin overview and quick stats
 */

import { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Statistic, Progress, Empty, Table } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";

interface DashboardStats {
  totalUsers: number;
  activeOrders: number;
  totalRevenue: number;
  systemHealth: number;
  pendingApprovals: number;
  criticalAlerts: number;
}

interface Activity {
  id: string;
  action: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeOrders: 0,
    totalRevenue: 0,
    systemHealth: 0,
    pendingApprovals: 0,
    criticalAlerts: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        setStats({
          totalUsers: 1523,
          activeOrders: 234,
          totalRevenue: 325000,
          systemHealth: 99.9,
          pendingApprovals: 5,
          criticalAlerts: 0,
        });

        setActivities([
          { id: "a1", action: "New user registration", timestamp: new Date().toISOString() },
          { id: "a2", action: "Order completed", timestamp: new Date(Date.now() - 3600000).toISOString() },
          { id: "a3", action: "System backup completed", timestamp: new Date(Date.now() - 7200000).toISOString() },
        ]);

        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { title: "Action", dataIndex: "action", key: "action" },
    { title: "Timestamp", dataIndex: "timestamp", key: "timestamp", render: (date: string) => new Date(date).toLocaleString() },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic
                title="Total Users"
                value={stats.totalUsers}
                prefix={<ArrowUpOutlined style={{ color: "#52c41a" }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Active Orders" value={stats.activeOrders} />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="Total Revenue" value={stats.totalRevenue} prefix="$" />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card className="shadow-sm">
              <Statistic title="System Health" value={stats.systemHealth} suffix="%" />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} className="mb-6">
          <Col xs={24} sm={12}>
            <Card title="System Status" className="shadow-sm">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <p className="text-sm text-gray-600 mb-2">Overall Health</p>
                  <Progress type="circle" percent={99.9} />
                </Col>
                <Col xs={24} sm={12}>
                  <Row gutter={[0, 16]}>
                    <Col xs={24}>
                      <p className="text-xs text-gray-600">Pending Approvals</p>
                      <p className="font-semibold text-lg">{stats.pendingApprovals}</p>
                    </Col>
                    <Col xs={24}>
                      <p className="text-xs text-gray-600">Critical Alerts</p>
                      <p className="font-semibold text-lg text-red-600">{stats.criticalAlerts}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} sm={12}>
            <Card title="Quick Links" className="shadow-sm">
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <button className="w-full p-2 text-left hover:bg-gray-100 rounded">
                    View System Logs
                  </button>
                </Col>
                <Col xs={24}>
                  <button className="w-full p-2 text-left hover:bg-gray-100 rounded">
                    Manage Users
                  </button>
                </Col>
                <Col xs={24}>
                  <button className="w-full p-2 text-left hover:bg-gray-100 rounded">
                    System Settings
                  </button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Card title="Recent Activities" className="shadow-sm">
          <Table
            columns={columns}
            dataSource={activities.map((a) => ({ ...a, key: a.id }))}
            pagination={false}
          />
          {activities.length === 0 && <Empty description="No activities" />}
        </Card>
      </div>
    </div>
  );
}
