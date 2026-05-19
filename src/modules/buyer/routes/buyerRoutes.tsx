/**
 * Buyer Module Routes
 */

import type { RouteObject } from "react-router-dom";
import ProductListPage from "@/modules/buyer/pages/ProductListPage";
import ProductDetailPage from "@/modules/buyer/pages/ProductDetailPage";
import CartPage from "@/modules/buyer/pages/CartPage";
import CheckoutPage from "@/modules/buyer/pages/CheckoutPage";
import PaymentQrPage from "@/modules/buyer/pages/PaymentQrPage";
import OrderHistoryPage from "@/modules/buyer/pages/OrderHistoryPage";
import OrderDetailPage from "@/modules/buyer/pages/OrderDetailPage";
import MyReturnsPage from "@/modules/buyer/pages/MyReturnsPage";
import ReturnDetailPage from "@/modules/buyer/pages/ReturnDetailPage";
import ProductReviewPage from "@/modules/buyer/pages/ProductReviewPage";
import WishlistPage from "@/modules/buyer/pages/WishlistPage";

/**
 * Buyer routes
 */
export const guestBuyerRoutes: RouteObject[] = [
  {
    path: "buyer/products",
    element: <ProductListPage />,
  },
  {
    path: "buyer/products/:productId",
    element: <ProductDetailPage />,
  },
];

export const buyerRoutes: RouteObject[] = [
  {
    path: "buyer/products/:productId/review",
    element: <ProductReviewPage />,
  },
  {
    path: "buyer/wishlist",
    element: <WishlistPage />,
  },
  {
    path: "buyer/cart",
    element: <CartPage />,
  },
  {
    path: "buyer/checkout",
    element: <CheckoutPage />,
  },
  {
    path: "buyer/payments/:orderId",
    element: <PaymentQrPage />,
  },
  {
    path: "buyer/orders",
    element: <OrderHistoryPage />,
  },
  {
    path: "buyer/orders/:orderId",
    element: <OrderDetailPage />,
  },
  {
    path: "buyer/returns",
    element: <MyReturnsPage />,
  },
  {
    path: "buyer/returns/:returnId",
    element: <ReturnDetailPage />,
  },
];
