import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/app/layout/AppLayout";
import { appRoutes } from "@/app/router/routeManifest";
import { NotFoundPage } from "@/modules/errors/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      ...appRoutes.map((route) => ({ path: route.path, element: route.element })),
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
