import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/app/layout/AppLayout";
import { AuthGuard, RoleGuard } from "@/app/router/guards";
import { appRoutes } from "@/app/router/routeManifest";
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

export const router = createBrowserRouter([
  {
    path: "/auth",
    children: authRoutes,
  },
  {
    element: <AppLayout />,
    children: [
      ...appRoutes.map((route) => ({ path: route.path, element: getRouteElement(route) })),
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

