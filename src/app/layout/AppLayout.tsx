import { Layout, Menu, theme } from "antd";
import type { MenuProps } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { appRoutes } from "@/app/router/routeManifest";

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps["items"] = appRoutes.map((route) => ({
  key: route.path,
  icon: route.icon,
  label: route.label,
}));

export function AppLayout() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKeys = menuItems
    ?.map((i) => (typeof i?.key === "string" ? i.key : null))
    .filter((k): k is string => !!k)
    .filter((k) => (k === "/" ? location.pathname === "/" : location.pathname.startsWith(k)));

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={240}
        style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorderSecondary}` }}
      >
        <div style={{ padding: 16, fontWeight: 700 }}>FCS</div>
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={selectedKeys?.length ? selectedKeys : ["/"]}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            fontWeight: 600,
          }}
        >
          Fashion Consignment System
        </Header>

        <Content style={{ padding: 16 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
