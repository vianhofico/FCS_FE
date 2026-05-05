import { App as AntdApp, ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";

import { router } from "@/app/router/router";
import { AuthProvider } from "@/shared/context/AuthContext";

const luxuryTheme = {
  token: {
    colorPrimary: "#d94a7a",
    colorLink: "#d94a7a",
    colorSuccess: "#16a34a",
    colorWarning: "#f59e0b",
    colorError: "#dc2626",
    colorTextBase: "#111827",
    colorBgBase: "#fffbfd",
    borderRadius: 14,
    fontFamily: "Be Vietnam Pro, Playfair Display, Great Vibes, Inter, ui-sans-serif, system-ui",
    boxShadow: "0 20px 48px rgba(217, 74, 122, 0.12)",
  },
  components: {
    Button: {
      borderRadius: 14,
      controlHeightLG: 48,
      fontWeight: 700,
      primaryShadow: "0 18px 32px rgba(217, 74, 122, 0.22)",
    },
    Card: {
      borderRadiusLG: 24,
      paddingLG: 28,
      padding: 24,
      boxShadowTertiary: "0 24px 60px rgba(217, 74, 122, 0.1)",
    },
    Form: {
      itemMarginBottom: 24,
      labelHeight: 28,
    },
    Input: {
      borderRadiusLG: 14,
      controlHeightLG: 48,
      paddingBlockLG: 11,
      paddingInlineLG: 16,
    },
    Menu: {
      itemBorderRadius: 14,
      itemMarginInline: 4,
      itemPaddingInline: 14,
      itemSelectedBg: "#fff1f6",
      itemSelectedColor: "#d94a7a",
      itemHoverBg: "#fff1f6",
      itemHoverColor: "#bf3b69",
    },
    Table: {
      cellPaddingBlock: 18,
      cellPaddingInline: 20,
    },
  },
};

export function App() {
  return (
    <ConfigProvider theme={luxuryTheme}>
      <AntdApp>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AntdApp>
    </ConfigProvider>
  );
}
