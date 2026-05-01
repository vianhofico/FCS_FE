import type { RouteObject } from "react-router-dom";
import ConsignmentRequestListPage from "@/modules/seller/pages/ConsignmentRequestListPage";
import ConsignmentRequestDetailPage from "@/modules/seller/pages/ConsignmentRequestDetailPage";
import ConsignmentContractPage from "@/modules/seller/pages/ConsignmentContractPage";
import MyProductsPage from "@/modules/seller/pages/MyProductsPage";
import SalesReportPage from "@/modules/seller/pages/SalesReportPage";
import FinancialPage from "@/modules/seller/pages/FinancialPage";
import SellerProfilePage from "@/modules/seller/pages/SellerProfilePage";

export const sellerRoutes: RouteObject[] = [
  {
    path: "consignments",
    children: [
      {
        index: true,
        element: <ConsignmentRequestListPage />,
      },
      {
        path: ":requestId",
        element: <ConsignmentRequestDetailPage />,
      },
    ],
  },
  {
    path: "contracts",
    element: <ConsignmentContractPage />,
  },
  {
    path: "products",
    element: <MyProductsPage />,
  },
  {
    path: "sales",
    element: <SalesReportPage />,
  },
  {
    path: "financial",
    element: <FinancialPage />,
  },
  {
    path: "profile",
    element: <SellerProfilePage />,
  },
];
