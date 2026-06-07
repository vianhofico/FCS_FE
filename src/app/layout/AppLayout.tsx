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

const { Header, Content, Footer } = Layout;

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
  { key: "/manager/dashboard",              icon: <DashboardOutlined />,      label: "Tổng quan" },
  { key: "/consignment",                    icon: <ReconciliationOutlined />, label: "Ký gửi" },
  { key: "/product",                        icon: <ShopOutlined />,           label: "Sản phẩm" },
  { key: "/manager/approvals",              icon: <FileDoneOutlined />,       label: "Phê duyệt" },
  { key: "/manager/orders/moderation",      icon: <ShoppingCartOutlined />,   label: "Điều phối đơn" },
  { key: "/manager/returns/moderation",     icon: <ReconciliationOutlined />, label: "Duyệt trả" },
  { key: "/manager/disputes/resolution",    icon: <SafetyCertificateOutlined />, label: "Tranh chấp" },
  { key: "/financial",                      icon: <DollarOutlined />,         label: "Tài chính" },
  { key: "/catalog",                        icon: <TagsOutlined />,           label: "Danh mục" },
  { key: "/manager/users/management",        icon: <TeamOutlined />,           label: "Người dùng" },
  { key: "/audit",                          icon: <AuditOutlined />,          label: "Audit" },
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
  if (hasRole("SELLER") && !hasRole("BUYER")) return sellerMenuItems;
  if (hasRole("BUYER")) {
    return [
      ...buyerMenuItems,
      { key: "/seller/consignments", icon: <ReconciliationOutlined />, label: "Yêu cầu ký gửi" },
      { key: "/seller/contracts", icon: <FileDoneOutlined />, label: "Hợp đồng" },
      { key: "/seller/products", icon: <ShopOutlined />, label: "Sản phẩm ký gửi" },
      { key: "/seller/sales", icon: <TagsOutlined />, label: "Báo cáo bán hàng" },
      { key: "/seller/financial", icon: <DollarOutlined />, label: "Ví tài chính" },
      { key: "/seller/profile", icon: <UserOutlined />, label: "Hồ sơ ký gửi" },
    ];
  }
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
                    popupRender={() => (
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
                    trigger={["click"]}
                    menu={{
                      items: [
                        { key: "profile", icon: <UserOutlined />, label: "Hồ sơ", onClick: () => navigate("/seller/profile") },
                        { key: "addresses", icon: <UserOutlined />, label: "Địa chỉ giao hàng", onClick: () => navigate("/buyer/addresses") },
                        { type: "divider" },
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

      {!hasRole("ADMIN") && !hasRole("MANAGER") && (
        <Footer className="!bg-slate-900 !px-0 !py-0">
          <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-12">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div className="space-y-4 lg:col-span-1">
                <span className="site-deco site-logo text-white !text-2xl">Re:Wear</span>
                <p className="text-sm leading-relaxed text-slate-400">
                  Nền tảng thời trang ký gửi thế hệ mới — nơi phong cách gặp gỡ sự bền vững.
                </p>
                <div className="flex gap-3 pt-2">
                  {["Facebook", "Instagram", "TikTok"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-xs font-bold text-slate-400 transition-all hover:border-primary hover:text-primary"
                    >
                      {s[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mua sắm */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Mua sắm</h4>
                <ul className="space-y-3">
                  {[
                    { label: "Tất cả sản phẩm", path: "/buyer/products" },
                    { label: "Hàng mới về", path: "/buyer/products" },
                    { label: "Giỏ hàng", path: "/buyer/cart" },
                    { label: "Danh sách yêu thích", path: "/buyer/wishlist" },
                  ].map((item) => (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => window.location.href = item.path}
                        className="border-0 bg-transparent p-0 text-sm text-slate-400 transition-soft hover:text-white cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ký gửi */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Ký gửi</h4>
                <ul className="space-y-3">
                  {[
                    { label: "Gửi đồ của bạn", path: "/seller/consignments/new" },
                    { label: "Theo dõi yêu cầu", path: "/seller/consignments" },
                    { label: "Hợp đồng ký gửi", path: "/seller/contracts" },
                    { label: "Tài chính & Ví", path: "/seller/financial" },
                  ].map((item) => (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => window.location.href = item.path}
                        className="border-0 bg-transparent p-0 text-sm text-slate-400 transition-soft hover:text-white cursor-pointer"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Liên hệ */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Liên hệ</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li>📧 support@rewear.studio</li>
                  <li>📞 1900 xxxx</li>
                  <li>🕐 T2 – T7: 9:00 – 18:00</li>
                  <li className="pt-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Đang hoạt động
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
              <p className="text-xs text-slate-500">
                © 2025 Re:Wear. All rights reserved.
              </p>
              <div className="flex gap-6">
                {["Chính sách bảo mật", "Điều khoản sử dụng", "Chính sách hoàn trả"].map((t) => (
                  <button key={t} type="button" className="border-0 bg-transparent p-0 text-xs text-slate-500 hover:text-slate-300 cursor-pointer">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Footer>
      )}

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
          <div className="mb-5 px-5 sm:px-6" />
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
