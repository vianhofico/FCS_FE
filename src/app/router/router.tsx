import { Result } from "antd";
import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/app/layout/AppLayout";
import { AuthGuard, RoleGuard } from "@/app/router/guards";
import { appRoutes } from "@/app/router/routeManifest";
import { adminRoutes } from "@/modules/admin/routes/adminRoutes";
import { buyerRoutes, guestBuyerRoutes } from "@/modules/buyer/routes/buyerRoutes";
import { managerRoutes } from "@/modules/manager/routes/managerRoutes";
import { sellerRoutes } from "@/modules/seller/routes/sellerRoutes";
import { notificationRoutes } from "@/modules/notification/routes/notificationRoutes";
import { NotFoundPage } from "@/modules/errors/NotFoundPage";
import { authRoutes } from "@/modules/iam/routes/authRoutes";
import type { UserRole } from "@/shared/contracts/commonContract";

function getRouteElement(route: (typeof appRoutes)[number]) {
  let element = route.element;

  if (route.requiredRoles?.length) {
    const requiredRoles = route.requiredRoles as UserRole[];
    element = <RoleGuard requiredRoles={requiredRoles}>{element}</RoleGuard>;
  }

  if (route.requireAuth) {
    element = <AuthGuard>{element}</AuthGuard>;
  }

  return element;
}

function guardRoutes(routes: import("react-router-dom").RouteObject[], requiredRoles: UserRole[]) {
  return routes.map((route) => ({
    ...route,
    element: route.element ? <RoleGuard requiredRoles={requiredRoles}>{route.element}</RoleGuard> : route.element,
    children: route.children ? guardRoutes(route.children, requiredRoles) : route.children,
  }));
}

function guardRoute(route: import("react-router-dom").RouteObject, requiredRoles: UserRole[]) {
  return {
    ...route,
    element: route.element ? <RoleGuard requiredRoles={requiredRoles}>{route.element}</RoleGuard> : route.element,
    children: route.children ? guardRoutes(route.children, requiredRoles) : route.children,
  };
}

export const router = createBrowserRouter([
  {
    path: "/auth",
    children: authRoutes,
  },
  {
    element: <AppLayout />,
    children: [
      ...appRoutes.map((route) => ({ path: route.path, element: getRouteElement(route) })),
      ...guestBuyerRoutes,
      ...buyerRoutes.map((route) => guardRoute(route, ["BUYER"])),
      ...sellerRoutes.map((route) => guardRoute(route, ["SELLER"])),
      ...managerRoutes.map((route) => guardRoute(route, ["MANAGER"])),
      ...adminRoutes.map((route) => guardRoute(route, ["ADMIN"])),
      ...notificationRoutes.map((route) => guardRoute(route, ["BUYER", "SELLER", "MANAGER", "ADMIN"])),
      {
        path: "forbidden",
        element: (
          <Result
            status="403"
            title="Truy cập bị từ chối"
            subTitle="Bạn không có quyền truy cập vào trang này."
          />
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

