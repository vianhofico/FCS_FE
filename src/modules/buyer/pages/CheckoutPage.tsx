/**
 * Checkout Page (Buyer)
 * Review cart, select shipping address, and create order
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Form,
  Input,
  Radio,
  Divider,
  Table,
  message,
  Modal,
  Row,
  Col,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { iamApi } from "@/modules/iam/api/iamApi";
import { orderApi } from "@/modules/order/api/orderApi";
import type { CartItem, OrderCreateRequest } from "@/shared/contracts/orderContract";
import type { IamAddress, IamAddressRequest } from "@/shared/contracts/iamContract";
import type { PaymentMethod } from "@/shared/contracts/commonContract";
import { PaymentMethod as PaymentMethodEnum } from "@/shared/contracts/commonContract";
import { useAuth } from "@/shared/context/AuthContext";

interface CheckoutPageState {
  cartItems: CartItem[];
  addresses: IamAddress[];
  selectedAddressId: string | null;
  paymentMethod: PaymentMethod;
  isLoading: boolean;
  isCreatingOrder: boolean;
  error: string | null;
  showAddressModal: boolean;
  newAddress: IamAddressRequest;
}

/**
 * Checkout Page component
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm<IamAddressRequest>();

  const [state, setState] = useState<CheckoutPageState>({
    cartItems: [],
    addresses: [],
    selectedAddressId: null,
    paymentMethod: PaymentMethodEnum.COD,
    isLoading: true,
    isCreatingOrder: false,
    error: null,
    showAddressModal: false,
    newAddress: {
      fullName: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      phone: "",
      type: "HOME",
    },
  });

  // Load cart and addresses
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Load cart
        const cartResponse = await orderApi.getCart(user.id);
        // Load addresses
        const addressResponse = await iamApi.getUserAddresses(user.id);

        if (cartResponse.success && cartResponse.data) {
          setState((prev) => ({
            ...prev,
            cartItems: cartResponse.data.items,
          }));
        }

        if (addressResponse.success && addressResponse.data) {
          setState((prev) => ({
            ...prev,
            addresses: addressResponse.data,
            selectedAddressId: addressResponse.data.length > 0 ? addressResponse.data[0].id : null,
          }));
        }

        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load checkout data";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    loadData();
  }, [user]);

  const handleAddressCreate = async (values: IamAddressRequest) => {
    if (!user) return;

    try {
      const response = await iamApi.createAddress(user.id, values);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          addresses: [...prev.addresses, response.data],
          selectedAddressId: response.data.id,
          showAddressModal: false,
        }));
        form.resetFields();
        message.success("Address added successfully");
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to add address");
    }
  };

  const handleCreateOrder = async () => {
    if (!state.selectedAddressId) {
      message.error("Please select a shipping address");
      return;
    }

    if (!user) {
      message.error("Please log in");
      return;
    }

    try {
      setState((prev) => ({ ...prev, isCreatingOrder: true }));

      const subTotal = state.cartItems.reduce(
        (sum, item) => sum + item.salePrice * item.quantity,
        0
      );

      const orderData: OrderCreateRequest = {
        buyerId: user.id,
        subTotal,
        shippingFee: 10,
        discountAmount: 0,
        totalAmount: subTotal + 10,
        paymentMethod: state.paymentMethod,
        shippingAddressId: state.selectedAddressId,
      };

      const response = await orderApi.createOrder(orderData);

      if (response.success && response.data) {
        message.success("Order created successfully!");
        navigate(`/buyer/orders/${response.data.id}`);
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setState((prev) => ({ ...prev, isCreatingOrder: false }));
    }
  };

  const itemColumns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "product",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit Price",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (salePrice: number) => `$${salePrice.toLocaleString()}`,
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_: unknown, record: CartItem) => (
        <span>${(record.salePrice * record.quantity).toLocaleString()}</span>
      ),
    },
  ];

  const subTotal = state.cartItems.reduce(
    (sum, item) => sum + item.salePrice * item.quantity,
    0
  );
  const shippingFee = 10;
  const total = subTotal + shippingFee;

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/buyer/cart")}
            className="mb-4"
          >
            Back to Cart
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        <Row gutter={[24, 24]}>
          {/* Order Items */}
          <Col xs={24} lg={14}>
            <Card title="Order Items" className="shadow-sm">
              <Table
                columns={itemColumns}
                dataSource={state.cartItems.map((item, index) => ({
                  ...item,
                  key: index,
                }))}
                pagination={false}
              />
            </Card>

            {/* Shipping Address */}
            <Card title="Shipping Address" className="mt-6 shadow-sm">
              <Radio.Group
                value={state.selectedAddressId}
                onChange={(e) => setState((prev) => ({ ...prev, selectedAddressId: e.target.value }))}
                className="w-full space-y-3"
              >
                {state.addresses.map((address) => (
                  <Radio key={address.id} value={address.id} className="w-full block p-3 border rounded">
                    <div className="font-semibold">{address.street}</div>
                    <div className="text-sm text-gray-600">
                      {address.district}, {address.city}
                    </div>
                    <div className="text-sm text-gray-600">{address.phone}</div>
                  </Radio>
                ))}
              </Radio.Group>

              <Button
                onClick={() => setState((prev) => ({ ...prev, showAddressModal: true }))}
                className="mt-4 w-full"
              >
                + Add New Address
              </Button>
            </Card>

            {/* Payment Method */}
            <Card title="Payment Method" className="mt-6 shadow-sm">
              <Radio.Group
                value={state.paymentMethod}
                onChange={(e) => setState((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                className="space-y-3"
              >
                <div>
                  <Radio value={PaymentMethodEnum.COD}>
                    <span className="font-semibold">Cash on Delivery</span>
                    <p className="text-sm text-gray-600 ml-6">Pay when you receive the package</p>
                  </Radio>
                </div>
                <div>
                  <Radio value={PaymentMethodEnum.VNPAY}>
                    <span className="font-semibold">VNPAY</span>
                    <p className="text-sm text-gray-600 ml-6">Pay online via VNPAY</p>
                  </Radio>
                </div>
                <div>
                  <Radio value={PaymentMethodEnum.MOMO}>
                    <span className="font-semibold">MOMO</span>
                    <p className="text-sm text-gray-600 ml-6">Pay via MOMO app</p>
                  </Radio>
                </div>
                <div>
                  <Radio value={PaymentMethodEnum.BANK_TRANSFER}>
                    <span className="font-semibold">Bank Transfer</span>
                    <p className="text-sm text-gray-600 ml-6">Transfer to our bank account</p>
                  </Radio>
                </div>
              </Radio.Group>
            </Card>
          </Col>

          {/* Price Summary */}
          <Col xs={24} lg={10}>
            <Card title="Order Summary" className="shadow-sm sticky top-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-semibold">${shippingFee.toLocaleString()}</span>
                </div>
                <Divider />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">${total.toLocaleString()}</span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={state.isCreatingOrder}
                  onClick={handleCreateOrder}
                  className="mt-6"
                >
                  Place Order
                </Button>

                <Button
                  size="large"
                  block
                  onClick={() => navigate("/buyer/cart")}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Add Address Modal */}
      <Modal
        title="Add New Address"
        open={state.showAddressModal}
        onCancel={() => setState((prev) => ({ ...prev, showAddressModal: false }))}
        footer={[
          <Button key="cancel" onClick={() => setState((prev) => ({ ...prev, showAddressModal: false }))}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Add Address
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddressCreate}
        >
          <Form.Item name="street" label="Street" rules={[{ required: true }]}>
            <Input placeholder="123 Main Street" />
          </Form.Item>
          <Form.Item name="district" label="District" rules={[{ required: true }]}>
            <Input placeholder="District name" />
          </Form.Item>
          <Form.Item name="city" label="City" rules={[{ required: true }]}>
            <Input placeholder="City name" />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input placeholder="Phone number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
