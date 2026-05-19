import type { RouteObject } from "react-router-dom";
import ConsignmentRequestListPage from "@/modules/seller/pages/ConsignmentRequestListPage";
import ConsignmentRequestDetailPage from "@/modules/seller/pages/ConsignmentRequestDetailPage";
import ConsignmentMultiStepPage from "@/modules/seller/pages/ConsignmentMultiStepPage";
import ConsignmentContractPage from "@/modules/seller/pages/ConsignmentContractPage";
import ConsignmentContractSignPage from "@/modules/seller/pages/ConsignmentContractSignPage";
import MyProductsPage from "@/modules/seller/pages/MyProductsPage";
import ProductDetailPage from "@/modules/buyer/pages/ProductDetailPage";
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
        path: "new",
        element: <ConsignmentMultiStepPage />,
      },
      {
        path: ":requestId",
        element: <ConsignmentRequestDetailPage />,
      },
      {
        path: ":requestId/contract/sign",
        element: <ConsignmentContractSignPage />,
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
    path: "seller/products/:productId",
    element: <ProductDetailPage />,
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
