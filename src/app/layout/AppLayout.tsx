import {
  AuditOutlined,
  BellFilled,
  DashboardOutlined,
  DollarOutlined,
  FileDoneOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  ReconciliationOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Drawer, Dropdown, Input, Layout, Menu, Space } from "antd";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/shared/context/AuthContext";
import { useNotifications } from "@/shared/hooks/useNotifications";

const { Header, Content } = Layout;

type NavigationItem = NonNullable<MenuProps["items"]>[number];

const guestMenuItems: NavigationItem[] = [
  { key: "/", icon: <DashboardOutlined />, label: "Trang chủ" },
  { key: "/buyer/products", icon: <ShopOutlined />, label: "Sản phẩm" },
];

const buyerMenuItems: NavigationItem[] = [
  ...guestMenuItems,
  { key: "/buyer/cart", icon: <ShoppingCartOutlined />, label: "Giỏ hàng" },
  { key: "/buyer/orders", icon: <FileDoneOutlined />, label: "Đơn hàng" },
  { key: "/buyer/returns", icon: <ReconciliationOutlined />, label: "Đổi/trả" },
  { key: "/notification", icon: <BellFilled />, label: "Thông báo" },
];

const sellerMenuItems: NavigationItem[] = [
  { key: "/seller/consignments", icon: <ReconciliationOutlined />, label: "Yêu cầu ký gửi" },
  { key: "/seller/contracts", icon: <FileDoneOutlined />, label: "Hợp đồng" },
  { key: "/seller/products", icon: <ShopOutlined />, label: "Sản phẩm" },
  { key: "/seller/sales", icon: <TagsOutlined />, label: "Báo cáo" },
  { key: "/seller/financial", icon: <DollarOutlined />, label: "Tài chính" },
  { key: "/seller/profile", icon: <UserOutlined />, label: "Hồ sơ" },
];

const managerMenuItems: NavigationItem[] = [
  { key: "/manager/orders/moderation", icon: <ShoppingCartOutlined />, label: "Điều phối đơn" },
  { key: "/manager/disputes/resolution", icon: <SafetyCertificateOutlined />, label: "Tranh chấp" },
  { key: "/manager/approvals", icon: <FileDoneOutlined />, label: "Phê duyệt" },
  { key: "/manager/returns/moderation", icon: <ReconciliationOutlined />, label: "Duyệt trả" },
  { key: "/manager/financial/review", icon: <DollarOutlined />, label: "Tài chính" },
  { key: "/manager/reporting", icon: <DashboardOutlined />, label: "Báo cáo" },
  { key: "/manager/users/management", icon: <TeamOutlined />, label: "Người dùng" },
  { key: "/manager/system/settings", icon: <SettingOutlined />, label: "Cài đặt" },
  { key: "/manager/communication", icon: <BellFilled />, label: "Giao tiếp" },
  { key: "/manager/performance/monitoring", icon: <DashboardOutlined />, label: "Hiệu năng" },
  { key: "/manager/bulk-actions", icon: <FileDoneOutlined />, label: "Bulk actions" },
  { key: "/manager/audit/logs", icon: <AuditOutlined />, label: "Audit" },
];

const adminMenuItems: NavigationItem[] = [
  { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "Admin Dashboard" },
  { key: "/admin/iam/governance", icon: <TeamOutlined />, label: "IAM Governance" },
  { key: "/admin/system/configuration", icon: <SettingOutlined />, label: "Cấu hình" },
  { key: "/admin/system/reporting", icon: <DashboardOutlined />, label: "Báo cáo" },
  { key: "/admin/audit/logs", icon: <AuditOutlined />, label: "Audit logs" },
  { key: "/admin/security", icon: <SafetyCertificateOutlined />, label: "Bảo mật" },
  { key: "/admin/backup/management", icon: <FileDoneOutlined />, label: "Backup" },
];

function getMenuItems(hasRole: ReturnType<typeof useAuth>["hasRole"], isAuthenticated: boolean) {
  if (!isAuthenticated) return guestMenuItems;
  if (hasRole("ADMIN")) return adminMenuItems;
  if (hasRole("MANAGER")) return managerMenuItems;
  if (hasRole("SELLER")) return sellerMenuItems;
  return buyerMenuItems;
}

function getSelectedKeys(menuItems: NavigationItem[], pathname: string) {
  const keys = menuItems
    .map((item) => (typeof item?.key === "string" ? item.key : null))
    .filter((key): key is string => !!key)
    .filter((key) => (key === "/" ? pathname === "/" : pathname.startsWith(key)));

  return keys.length ? [keys.sort((a, b) => b.length - a.length)[0]] : [];
}

function getRoleLabel(hasRole: ReturnType<typeof useAuth>["hasRole"], isAuthenticated: boolean) {
  if (!isAuthenticated) return "Guest Atelier";
  if (hasRole("ADMIN")) return "Admin Studio";
  if (hasRole("MANAGER")) return "Manager Desk";
  if (hasRole("SELLER")) return "Seller Atelier";
  return "Buyer Club";
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unread, refresh } = useNotifications();
  const { isAuthenticated, hasRole, logout, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuItems = useMemo(() => getMenuItems(hasRole, isAuthenticated), [hasRole, isAuthenticated]);
  const selectedKeys = getSelectedKeys(menuItems, location.pathname);
  const roleLabel = getRoleLabel(hasRole, isAuthenticated);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menu = (
    <Menu
      mode="horizontal"
      items={menuItems}
      selectedKeys={selectedKeys.length ? selectedKeys : ["/"]}
      onClick={({ key }) => navigate(key)}
      className="luxury-menu hidden min-w-0 flex-1 border-none bg-transparent text-[10px] font-bold uppercase tracking-widest text-slate-500 lg:flex h-11 leading-[44px]"
    />
  );

  return (
    <Layout className="min-h-screen bg-bg-main font-sans">
      <Header className="sticky top-0 z-50 h-auto border-b border-white bg-bg-main/90 px-0 shadow-none backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex min-w-fit flex-col border-0 bg-transparent p-0 text-left leading-none"
            >
              <span className="site-deco site-logo text-2xl md:text-3xl lg:text-[2.35rem] transition-soft group-hover:text-primary-hover">Re:Wear</span>
              <span className="mt-1.5 text-[10px] font-medium text-primary/70 tracking-wide italic opacity-85">
                Thời trang ký gửi
              </span>
            </button>

            <div className="mx-2 hidden min-w-0 flex-1 lg:block xl:mx-4">{menu}</div>

            <div className="hidden max-w-[320px] flex-1 lg:block">
              <Input
                size="large"
                prefix={<SearchOutlined className="text-primary/60" />}
                placeholder="Tìm kiếm local brand, sản phẩm..."
                className="rounded-xl border-pink-100 bg-pink-50/50 px-4 h-11 hover:border-pink-200 focus:border-pink-300 transition-soft"
                onPressEnter={(event) => {
                  const value = event.currentTarget.value.trim();
                  navigate(value ? `/buyer/products?q=${encodeURIComponent(value)}` : "/buyer/products");
                }}
              />
            </div>

            <Space size={12} className="shrink-0">
              <span className="hidden rounded-full border border-pink-100 bg-pink-50/50 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-primary md:inline-flex">
                {roleLabel}
              </span>

              {isAuthenticated ? (
                <>
                  <Dropdown
                    menu={{
                      items: [
                        { key: "notifications", label: "Thông báo", onClick: () => navigate("/notification") },
                        { key: "refresh", label: "Làm mới", onClick: () => refresh() },
                      ],
                    }}
                    placement="bottomRight"
                  >
                    <Badge count={unread} size="small" offset={[-2, 5]} color="#f472b6" className="font-bold">
                      <Button
                        type="text"
                        icon={<BellFilled style={{ fontSize: '18px' }} />}
                        className="text-gray-400 hover:text-primary hover:bg-pink-50 w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                      />
                    </Badge>
                  </Dropdown>

                  <Dropdown
                    placement="bottomRight"
                    menu={{
                      items: [
                        { key: "profile", label: user?.username || "Tài khoản" },
                        { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", onClick: handleLogout },
                      ],
                    }}
                  >
                    <button className="flex items-center gap-2 rounded-xl border border-pink-100 bg-white/80 px-2.5 py-1.5 text-sm font-bold text-slate-700 shadow-sm transition-soft hover:border-primary/30 hover:text-primary luxury-shadow">
                      <Avatar size={30} icon={<UserOutlined />} className="bg-primary" />
                      <span className="hidden max-w-32 truncate md:inline">{user?.username}</span>
                    </button>
                  </Dropdown>
                </>
              ) : (
                <Space className="hidden sm:flex" size={12}>
                  <Button type="text" onClick={() => navigate("/buyer/products")} className="font-bold text-gray-500 hover:text-primary">Sản phẩm</Button>
                  <Button
                    icon={<LoginOutlined />}
                    onClick={() => navigate("/auth/login")}
                    className="rounded-xl font-bold border-pink-100 hover:border-primary hover:text-primary"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => navigate("/auth/register")}
                    className="bg-primary hover:bg-primary-hover border-none rounded-xl font-bold shadow-lg shadow-pink-100/50"
                  >
                    Đăng ký
                  </Button>
                </Space>
              )}

              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden text-primary"
              />
            </Space>
          </div>
        </div>
      </Header>

      <Content className="relative min-h-[calc(100vh-104px)] overflow-hidden bg-bg-main">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_20%,rgba(217,74,122,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(240,138,177,0.16),transparent_30%)]" />
        <main className="relative mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </Content>

      <Drawer
        title={<span className="font-display text-2xl font-bold text-primary">Re:Wear Menu</span>}
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: '24px 0' } }}
        className="rewear-drawer"
      >
        <div className="flex h-full flex-col">
          <div className="px-6 mb-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/70">{roleLabel}</div>
            <div className="mt-2 text-sm text-slate-500 italic">Cửa hàng thời trang ký gửi cao cấp.</div>
          </div>
          <Menu
            mode="inline"
            items={menuItems}
            selectedKeys={selectedKeys.length ? selectedKeys : ["/"]}
            onClick={({ key }) => {
              navigate(key);
              setDrawerOpen(false);
            }}
            className="flex-1 border-none px-3 font-bold text-lg"
          />
          <div className="border-t border-gray-100 p-6 grid grid-cols-1 gap-4">
            {isAuthenticated ? (
              <Button block danger icon={<LogoutOutlined />} onClick={handleLogout} size="large" className="h-14 rounded-2xl font-bold">
                Đăng xuất
              </Button>
            ) : (
              <Button block type="primary" onClick={() => { navigate("/auth/login"); setDrawerOpen(false); }} size="large" className="h-14 rounded-2xl font-bold bg-primary border-none">
                Đăng nhập ngay
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </Layout>
  );
}
