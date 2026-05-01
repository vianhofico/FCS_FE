/**
 * Buyer Module Routes
 */

import type { RouteObject } from "react-router-dom";
import ProductListPage from "@/modules/buyer/pages/ProductListPage";
import ProductDetailPage from "@/modules/buyer/pages/ProductDetailPage";
import CartPage from "@/modules/buyer/pages/CartPage";
import CheckoutPage from "@/modules/buyer/pages/CheckoutPage";
import OrderHistoryPage from "@/modules/buyer/pages/OrderHistoryPage";
import OrderDetailPage from "@/modules/buyer/pages/OrderDetailPage";
import MyReturnsPage from "@/modules/buyer/pages/MyReturnsPage";
import ReturnDetailPage from "@/modules/buyer/pages/ReturnDetailPage";
import ProductReviewPage from "@/modules/buyer/pages/ProductReviewPage";

/**
 * Buyer routes
 */
export const buyerRoutes: RouteObject[] = [
  {
    path: "products",
    element: <ProductListPage />,
  },
  {
    path: "products/:productId",
    element: <ProductDetailPage />,
  },
  {
    path: "products/:productId/review",
    element: <ProductReviewPage />,
  },
  {
    path: "cart",
    element: <CartPage />,
  },
  {
    path: "checkout",
    element: <CheckoutPage />,
  },
  {
    path: "orders",
    element: <OrderHistoryPage />,
  },
  {
    path: "orders/:orderId",
    element: <OrderDetailPage />,
  },
  {
    path: "returns",
    element: <MyReturnsPage />,
  },
  {
    path: "returns/:returnId",
    element: <ReturnDetailPage />,
  },
];
