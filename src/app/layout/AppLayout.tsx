import {
  AuditOutlined,
  BellFilled,
  DashboardOutlined,
  ReloadOutlined,
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
  HeartOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Drawer, Dropdown, Empty, Layout, Menu, Space, Spin } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
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
  { key: "/buyer/wishlist", icon: <HeartOutlined />, label: "Yêu thích" },
  { key: "/buyer/orders", icon: <FileDoneOutlined />, label: "Đơn hàng" },
  { key: "/buyer/returns", icon: <ReconciliationOutlined />, label: "Đổi/trả" },
  { key: "/notifications", icon: <BellFilled />, label: "Thông báo" },
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

function getDisplayName(user: ReturnType<typeof useAuth>["user"]) {
  return user?.fullName || user?.username?.replaceAll("_", " ") || "Tài khoản";
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: notifications, loading: notificationsLoading, unread, refresh } = useNotifications();
  const { isAuthenticated, hasRole, logout, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuItems = useMemo(() => getMenuItems(hasRole, isAuthenticated), [hasRole, isAuthenticated]);
  const selectedKeys = getSelectedKeys(menuItems, location.pathname);
  const displayName = getDisplayName(user);
  const notificationPreview = notifications.slice(0, 5);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname]);

  const handleLogout = () => {
    setDrawerOpen(false);
    logout();
    navigate("/");
  };

  return (
    <Layout className="min-h-screen bg-white font-sans">
      <Header className="sticky top-0 z-50 h-auto border-none bg-white/90 px-0 shadow-sm shadow-pink-100/30 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-3 px-3 py-2 sm:min-h-[72px] sm:px-5 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex min-w-fit self-center border-0 bg-transparent p-0 leading-none"
            >
              <span className="site-deco site-logo inline-flex items-center whitespace-nowrap transition-soft group-hover:text-primary-hover">Re:Wear</span>
            </button>

            <div className="min-w-0 flex-1" />

            <Space size={10} align="center" className="shrink-0 sm:[&_.ant-space-item]:flex">
              {isAuthenticated ? (
                <>
                  <Dropdown
                    trigger={["hover"]}
                    placement="bottomRight"
                    dropdownRender={() => (
                      <div className="w-80 overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-xl shadow-pink-100/40">
                        <div className="flex items-center justify-between border-b border-pink-50 px-4 py-3">
                          <span className="text-sm font-bold text-slate-700">Thông báo</span>
                          <Button
                            type="text"
                            size="small"
                            icon={<ReloadOutlined />}
                            loading={notificationsLoading}
                            onClick={(event) => {
                              event.stopPropagation();
                              refresh();
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:!bg-pink-50 hover:!text-primary-hover"
                          />
                        </div>

                        <div className="max-h-80 overflow-y-auto py-1">
                          {notificationsLoading && notificationPreview.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                              <Spin size="small" />
                            </div>
                          ) : notificationPreview.length > 0 ? (
                            notificationPreview.map((notification) => (
                              <button
                                key={notification.id}
                                type="button"
                                onClick={() => navigate(notification.actionUrl || "/notifications")}
                                className="block w-full border-0 bg-transparent px-4 py-3 text-left transition-soft hover:bg-pink-50/70"
                              >
                                <div className="truncate text-sm font-bold text-slate-700">{notification.title}</div>
                                <div className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {notification.message || notification.content || "Không có nội dung"}
                                </div>
                              </button>
                            ))
                          ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo" className="my-6" />
                          )}
                        </div>
                      </div>
                    )}
                  >
                    <Badge count={unread} size="small" offset={[-2, 5]} color="#f472b6" className="font-bold">
                      <Button
                        type="text"
                        icon={<BellFilled style={{ fontSize: '18px' }} />}
                        className="flex h-10 w-10 items-center justify-center rounded-xl px-0 text-gray-400 transition-all hover:bg-pink-50 hover:text-primary"
                      />
                    </Badge>
                  </Dropdown>

                  <Dropdown
                    placement="bottomRight"
                    menu={{
                      items: [
                        { key: "profile", label: displayName },
                        { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", onClick: handleLogout },
                      ],
                    }}
                  >
                    <button className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-pink-100 bg-white/85 px-2.5 py-1.5 text-sm font-bold text-slate-700 shadow-sm transition-soft hover:border-primary/30 hover:text-primary sm:gap-3 sm:px-3">
                      <Avatar size={30} icon={<UserOutlined />} className="shrink-0 bg-primary" />
                      <span className="hidden max-w-28 truncate md:inline lg:max-w-32">{displayName}</span>
                    </button>
                  </Dropdown>
                </>
              ) : (
                <Space className="!hidden md:!flex !items-center" size={12}>
                  <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    href="/auth/login"
                    className="rounded-xl h-10 px-5 font-bold bg-primary hover:!bg-primary-hover border-none shadow-sm"
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    href="/auth/register"
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
                className="flex h-10 w-10 items-center justify-center px-0 text-primary"
              />
            </Space>
          </div>
        </div>
      </Header>

      <Content className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-white">
        <main className="relative mx-auto w-full max-w-[1440px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </Content>

      <Drawer
        title={<span className="font-display text-2xl font-bold text-primary">Re:Wear Menu</span>}
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: '24px 0' } }}
        size={360}
        className="rewear-drawer"
      >
        <div className="flex h-full flex-col">
          <div className="mb-5 px-5 sm:px-6">
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
              <Button block type="primary" href="/auth/login" size="large" className="h-14 rounded-2xl font-bold bg-primary border-none">
                Đăng nhập ngay
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </Layout>
  );
}
