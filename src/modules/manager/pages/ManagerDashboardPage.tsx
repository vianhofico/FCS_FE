/**
 * Manager Dashboard Page
 * At-a-glance KPI summary for operational staff
 */

import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Statistic, Typography } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import { orderApi } from "@/modules/order/api/orderApi";
import { ConsignmentRequestStatus } from "@/shared/contracts/commonContract";
import { Button } from "@/shared/ui";

const { Title, Text } = Typography;

interface DashboardStats {
  pendingConsignments: number;
  activeOrders: number;
  isLoading: boolean;
}

export default function ManagerDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    pendingConsignments: 0,
    activeOrders: 0,
    isLoading: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [consignRes, orderRes] = await Promise.allSettled([
          consignmentApi.getConsignmentRequests({ status: ConsignmentRequestStatus.SUBMITTED, page: 0, size: 1 }),
          orderApi.getOrders({ page: 0, size: 1 }),
        ]);

        const pendingConsignments =
          consignRes.status === "fulfilled" ? consignRes.value.data?.totalElements ?? 0 : 0;
        const activeOrders =
          orderRes.status === "fulfilled" ? orderRes.value.data?.totalElements ?? 0 : 0;

        setStats({ pendingConsignments, activeOrders, isLoading: false });
      } catch {
        setStats((prev) => ({ ...prev, isLoading: false }));
      }
    };
    load();
  }, []);

  const quickLinks = [
    {
      title: "Phê duyệt ký gửi",
      description: "Xem xét và duyệt yêu cầu ký gửi mới",
      icon: <CheckCircleOutlined className="text-3xl text-primary" />,
      badge: stats.pendingConsignments > 0 ? `${stats.pendingConsignments} chờ duyệt` : undefined,
      path: "/manager/approvals",
      color: "from-pink-50 to-rose-50",
    },
    {
      title: "Điều phối đơn hàng",
      description: "Quản lý và xử lý đơn hàng bất thường",
      icon: <ShoppingCartOutlined className="text-3xl text-blue-500" />,
      path: "/manager/orders/moderation",
      color: "from-blue-50 to-indigo-50",
    },
    {
      title: "Duyệt hoàn trả",
      description: "Xem xét yêu cầu đổi trả từ khách hàng",
      icon: <FileDoneOutlined className="text-3xl text-amber-500" />,
      path: "/manager/returns/moderation",
      color: "from-amber-50 to-yellow-50",
    },
    {
      title: "Quản lý người dùng",
      description: "Xem và điều chỉnh tài khoản người dùng",
      icon: <TeamOutlined className="text-3xl text-emerald-500" />,
      path: "/manager/users/management",
      color: "from-emerald-50 to-green-50",
    },
    {
      title: "Tài chính",
      description: "Xem xét yêu cầu rút tiền và ví",
      icon: <WalletOutlined className="text-3xl text-violet-500" />,
      path: "/financial",
      color: "from-violet-50 to-purple-50",
    },
    {
      title: "Tranh chấp",
      description: "Giải quyết tranh chấp giữa các bên",
      icon: <ClockCircleOutlined className="text-3xl text-orange-500" />,
      path: "/manager/disputes/resolution",
      color: "from-orange-50 to-red-50",
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      <div className="space-y-2">
        <Text className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/70">
          Tổng quan vận hành
        </Text>
        <Title className="!m-0 !font-display !text-3xl !font-bold uppercase tracking-tight">
          Dashboard
        </Title>
      </div>

      {stats.isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Card className="rounded-2xl border-pink-100/50 bg-gradient-to-br from-pink-50 to-rose-50 shadow-sm">
              <Statistic
                title={<span className="text-xs font-bold uppercase tracking-widest text-primary/70">Ký gửi chờ duyệt</span>}
                value={stats.pendingConsignments}
                styles={{ content: { color: '#d94a7a', fontSize: 36, fontWeight: 700 } }}
                suffix={<span className="text-base text-slate-400">yêu cầu</span>}
              />
              <Button
                type="text"
                size="small"
                onClick={() => navigate("/manager/approvals")}
                className="mt-3 text-primary hover:text-primary-hover"
              >
                Xem ngay →
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="rounded-2xl border-blue-100/50 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
              <Statistic
                title={<span className="text-xs font-bold uppercase tracking-widest text-blue-500/70">Tổng đơn hàng</span>}
                value={stats.activeOrders}
                valueStyle={{ color: '#3b82f6', fontSize: 36, fontWeight: 700 }}
                suffix={<span className="text-base text-slate-400">đơn</span>}
              />
              <Button
                type="text"
                size="small"
                onClick={() => navigate("/manager/orders/moderation")}
                className="mt-3 text-blue-500 hover:text-blue-600"
              >
                Xem ngay →
              </Button>
            </Card>
          </Col>
        </Row>
      )}

      <div className="space-y-5">
        <Title level={4} className="!font-display uppercase tracking-widest text-sm !font-bold text-slate-500">
          Thao tác nhanh
        </Title>
        <Row gutter={[16, 16]}>
          {quickLinks.map((link) => (
            <Col key={link.path} xs={24} sm={12} lg={8}>
              <Card
                className={`cursor-pointer rounded-2xl border-0 bg-gradient-to-br ${link.color} shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
                onClick={() => navigate(link.path)}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">{link.icon}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{link.title}</span>
                      {link.badge && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{link.description}</p>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
