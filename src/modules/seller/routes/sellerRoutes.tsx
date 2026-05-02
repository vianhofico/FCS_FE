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
    path: "seller/consignments",
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
    path: "seller/contracts",
    element: <ConsignmentContractPage />,
  },
  {
    path: "seller/products",
    element: <MyProductsPage />,
  },
  {
    path: "seller/sales",
    element: <SalesReportPage />,
  },
  {
    path: "seller/financial",
    element: <FinancialPage />,
  },
  {
    path: "seller/profile",
    element: <SellerProfilePage />,
  },
];
