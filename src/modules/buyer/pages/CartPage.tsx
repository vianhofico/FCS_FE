/**
 * Shopping Cart Page (Buyer)
 * Manage cart items, view total, and checkout
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Spin,
  Table,
  Divider,
  Row,
  Col,
  InputNumber,
  message,
  Popconfirm,
} from "antd";
import { DeleteOutlined, ArrowLeftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { orderApi } from "@/modules/order/api/orderApi";
import type { CartItem } from "@/shared/contracts/orderContract";
import { useAuth } from "@/shared/context/AuthContext";

interface CartPageState {
  cartItems: CartItem[];
  isLoading: boolean;
  isCheckingOut: boolean;
  error: string | null;
  total: number;
}

/**
 * Shopping Cart Page component
 */
export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<CartPageState>({
    cartItems: [],
    isLoading: true,
    isCheckingOut: false,
    error: null,
    total: 0,
  });

  // Load cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Please log in to view your cart",
        }));
        return;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await orderApi.getCart(user.id);

        if (response.success && response.data) {
          const total = response.data.items.reduce(
            (sum, item) => sum + item.salePrice * item.quantity,
            0
          );

          setState((prev) => ({
            ...prev,
            cartItems: response.data.items,
            total,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load cart";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchCart();
  }, [user]);

  const handleRemoveItem = async (itemId: string) => {
    if (!user) return;

    try {
      await orderApi.removeFromCart(user.id, itemId);

      setState((prev) => ({
        ...prev,
        cartItems: prev.cartItems.filter((item) => item.id !== itemId),
        total: prev.cartItems
          .filter((item) => item.id !== itemId)
          .reduce((sum, item) => sum + item.salePrice * item.quantity, 0),
      }));

      message.success("Item removed from cart");
    } catch (err) {
      message.error("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      message.error("Please log in to checkout");
      return;
    }

    try {
      setState((prev) => ({ ...prev, isCheckingOut: true }));

      // Navigate to checkout page instead of creating order directly
      // This allows user to review, add addresses, and select shipping method
      navigate("/buyer/checkout");
    } catch (err) {
      message.error("Checkout failed");
      setState((prev) => ({ ...prev, isCheckingOut: false }));
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "product",
      render: (text: string, record: CartItem) => (
        <div
          className="cursor-pointer hover:text-blue-600"
          onClick={() => navigate(`/buyer/products/${record.productId}`)}
        >
          <p className="font-medium">{text}</p>
          <p className="text-sm text-gray-500">{record.sku}</p>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (salePrice: number) => `$${salePrice.toLocaleString()}`,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: CartItem) => (
        <InputNumber
          min={1}
          max={10}
          value={quantity}
          onChange={(newQuantity) => {
            // Update quantity in state
            setState((prev) => ({
              ...prev,
              cartItems: prev.cartItems.map((item) =>
                item.id === record.id ? { ...item, quantity: newQuantity || 1 } : item
              ),
              total: prev.cartItems.reduce(
                (sum, item) =>
                  sum +
                  item.salePrice *
                    (item.id === record.id ? newQuantity || 1 : item.quantity),
                0
              ),
            }));
          }}
        />
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_: unknown, record: CartItem) => (
        <span className="font-medium">${(record.salePrice * record.quantity).toLocaleString()}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: CartItem) => (
        <Popconfirm
          title="Remove from cart?"
          description="Are you sure you want to remove this item?"
          onConfirm={() => handleRemoveItem(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small">
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/buyer/products")}
            className="mb-4"
          >
            Continue Shopping
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Empty Cart */}
        {state.cartItems.length === 0 ? (
          <Card className="shadow-sm">
            <div className="text-center py-12">
              <ShoppingCartOutlined style={{ fontSize: "48px", color: "#bfbfbf" }} />
              <p className="text-gray-500 text-lg mt-4">Your cart is empty</p>
              <Button type="primary" onClick={() => navigate("/buyer/products")} className="mt-4">
                Continue Shopping
              </Button>
            </div>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {/* Cart Items */}
            <Col xs={24} lg={16}>
              <Card className="shadow-sm">
                <Table
                  columns={columns}
                  dataSource={state.cartItems.map((item) => ({ ...item, key: item.id }))}
                  pagination={false}
                  rowKey="id"
                />
              </Card>
            </Col>

            {/* Order Summary */}
            <Col xs={24} lg={8}>
              <Card className="shadow-sm sticky top-6">
                <Space direction="vertical" size="large" className="w-full">
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span>${state.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <Divider className="my-3" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Estimated Total</span>
                      <span className="text-blue-600">${state.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleCheckout}
                    loading={state.isCheckingOut}
                  >
                    Proceed to Checkout
                  </Button>

                  <Button
                    block
                    onClick={() => navigate("/buyer/products")}
                  >
                    Continue Shopping
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}
