/**
 * Admin Dashboard Page
 * Main admin overview and quick stats
 */

import {
  CheckCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

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
  user: string;
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
        // Mock data
        setStats({
          totalUsers: 1523,
          activeOrders: 234,
          totalRevenue: 325000000,
          systemHealth: 99.9,
          pendingApprovals: 12,
          criticalAlerts: 0,
        });

        setActivities([
          { id: "a1", action: "Đăng ký người dùng mới", timestamp: new Date().toISOString(), user: "Phạm Minh" },
          { id: "a2", action: "Đơn hàng hoàn tất", timestamp: new Date(Date.now() - 3600000).toISOString(), user: "Lê Hằng" },
          { id: "a3", action: "Sao lưu hệ thống", timestamp: new Date(Date.now() - 7200000).toISOString(), user: "System" },
        ]);
        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hoạt động</span>,
      dataIndex: "action",
      key: "action",
      render: (text: string) => <span className="font-bold text-slate-700">{text}</span>,
    },
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Người thực hiện</span>,
      dataIndex: "user",
      key: "user",
      render: (text: string) => (
        <Space>
          <Avatar size="small" className="bg-primary/10 text-primary font-bold">{text[0]}</Avatar>
          <span className="text-sm font-medium text-slate-500">{text}</span>
        </Space>
      ),
    },
    {
      title: <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian</span>,
      dataIndex: "timestamp",
      key: "timestamp",
      align: "right" as const,
      render: (date: string) => (
        <span className="text-xs font-bold text-slate-400">{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      ),
    },
  ];

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Spin size="large" /></div>;

  return (
    <div className="responsive-page">
      <div className="responsive-toolbar items-start md:items-end">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            <GlobalOutlined className="text-primary" /> Admin Central
          </div>
          <Title className="page-title uppercase">Điều hành hệ thống</Title>
        </div>
        <Space size="middle" className="w-full flex-wrap sm:w-auto">
          <Button size="large" className="h-12 w-full rounded-2xl border-slate-200 px-8 text-[10px] font-bold uppercase tracking-widest sm:w-auto">Xuất báo cáo</Button>
          <Button type="primary" size="large" className="h-12 w-full rounded-2xl px-8 text-[10px] font-bold uppercase tracking-widest shadow-luxury sm:w-auto">Cài đặt hệ thống</Button>
        </Space>
      </div>

      {/* Main Stats */}
      <Row gutter={[24, 24]}>
        {[
          { label: "Người dùng", value: stats.totalUsers, icon: <TeamOutlined />, color: "text-blue-500", bg: "bg-blue-50", trend: "+12%" },
          { label: "Doanh thu", value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`, icon: <WalletOutlined />, color: "text-emerald-500", bg: "bg-emerald-50", trend: "+8.5%" },
          { label: "Đơn hàng", value: stats.activeOrders, icon: <CheckCircleOutlined />, color: "text-primary", bg: "bg-primary/5", trend: "+24%" },
          { label: "Sức khỏe hệ thống", value: `${stats.systemHealth}%`, icon: <GlobalOutlined />, color: "text-indigo-500", bg: "bg-indigo-50", trend: "Ổn định" },
        ].map((s, i) => (
          <Col key={i} xs={24} sm={12} lg={6}>
            <Card className="responsive-card overflow-hidden transition-soft hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${s.bg} ${s.color}`}>
                  {s.icon}
                </div>
                <Tag color="success" className="m-0 border-none px-2 font-black text-[10px]">{s.trend}</Tag>
              </div>
              <div className="mt-6 space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</div>
                <div className="font-display text-4xl font-black text-slate-900 tracking-tight">{s.value}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* System Monitoring */}
        <Col xs={24} lg={10}>
          <Card 
            className="responsive-card h-full border-border/60 bg-white/70 p-1 shadow-sm backdrop-blur-md sm:p-4"
            title={<span className="font-display text-xl font-black uppercase tracking-widest">Giám sát hệ thống</span>}
          >
            <div className="flex flex-col items-center py-10">
              <Progress 
                type="dashboard" 
                percent={stats.systemHealth} 
                strokeColor={{ '0%': '#d94a7a', '100%': '#f08ab1' }}
                size={220}
                format={p => <div className="flex flex-col"><span className="font-display text-5xl font-black text-slate-900">{p}%</span><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Excellent</span></div>}
              />
              <div className="mt-12 grid w-full grid-cols-2 gap-4">
                <div className="rounded-[2rem] bg-bg-secondary/50 p-6 text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Chờ duyệt</div>
                  <div className="font-display text-3xl font-black text-primary">{stats.pendingApprovals}</div>
                </div>
                <div className="rounded-[2rem] bg-rose-50/50 p-6 text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cảnh báo</div>
                  <div className="font-display text-3xl font-black text-rose-500">{stats.criticalAlerts}</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={14}>
          <Card 
            className="responsive-card h-full border-border/60 bg-white p-1 shadow-sm sm:p-4"
            title={<span className="font-display text-xl font-black uppercase tracking-widest">Hoạt động gần đây</span>}
            extra={<Button type="link" className="font-bold text-primary">Xem tất cả</Button>}
          >
            <Table
              columns={columns}
              dataSource={activities}
              pagination={false}
              className="luxury-table"
              rowKey="id"
              scroll={{ x: 640 }}
            />
            {activities.length === 0 && <div className="py-20"><Empty description="Không có hoạt động mới" /></div>}
            
            <div className="mt-8 rounded-3xl bg-slate-900 p-5 text-white sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Title level={4} className="!m-0 !font-display !text-white uppercase tracking-tight">Tối ưu hiệu suất</Title>
                  <Text className="text-slate-400 text-xs font-medium">Hệ thống của bạn đang chạy ở trạng thái tốt nhất.</Text>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary text-2xl">
                  <CheckCircleOutlined />
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
