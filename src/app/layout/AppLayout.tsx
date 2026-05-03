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
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Drawer, Dropdown, Layout, Menu, Space } from "antd";
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

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unread, refresh } = useNotifications();
  const { isAuthenticated, hasRole, logout, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuItems = useMemo(() => getMenuItems(hasRole, isAuthenticated), [hasRole, isAuthenticated]);
  const selectedKeys = getSelectedKeys(menuItems, location.pathname);

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
      className="luxury-menu flex min-w-max self-center border-none bg-transparent text-[10px] font-bold uppercase tracking-widest text-slate-500 h-12 leading-[48px]"
    />
  );

  return (
    <Layout className="min-h-screen bg-white font-sans">
      <Header className="sticky top-0 z-50 h-auto border-none bg-transparent px-0 shadow-none backdrop-blur-0">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 pt-1 pb-0 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex min-w-fit self-center border-0 bg-transparent p-0 leading-none"
            >
              <span className="site-deco site-logo inline-flex items-center text-2xl md:text-3xl lg:text-[2.35rem] transition-soft group-hover:text-primary-hover">Re:Wear</span>
            </button>

            <div className="mx-2 hidden min-w-0 flex-1 overflow-x-auto overflow-y-hidden lg:block xl:mx-4">{menu}</div>


            <Space size={12} className="shrink-0 -mt-0.5">
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
                <Space className="!hidden md:!flex !items-center" size={12}>
                  <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    onClick={() => navigate("/auth/login")}
                    className="rounded-xl h-10 px-5 font-bold bg-primary hover:!bg-primary-hover border-none shadow-sm"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    onClick={() => navigate("/auth/register")}
                    className="rounded-xl font-bold border-pink-100 hover:border-primary hover:text-primary"
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

      <Content className="relative min-h-[calc(100vh-104px)] overflow-hidden bg-white">
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
