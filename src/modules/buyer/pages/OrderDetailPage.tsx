/**
 * Order Detail Page (Buyer)
 * View full order details, tracking, and payment status
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Empty,
  Space,
  Divider,
  Steps,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  UndoOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { orderApi } from "@/modules/order/api/orderApi";
import { returnApi } from "@/modules/order/api/returnApi";
import type { OrderDetail, OrderItem } from "@/shared/contracts/orderContract";
import { useAuth } from "@/shared/context/AuthContext";
import TimelineWidget from "@/shared/components/TimelineWidget";
import { buildTrackingUrl } from "@/shared/integrations/shippingService";

interface OrderDetailPageState {
  order: OrderDetail | null;
  isLoading: boolean;
  error: string | null;
  returnModalVisible: boolean;
  returnForm: {
    itemIds: string[];
    reason: string;
    description: string;
  };
  isSubmittingReturn: boolean;
  isConfirmingReceipt: boolean;
}

const RETURN_REASONS = [
  "Defective",
  "Wrong size",
  "Not as described",
  "Changed mind",
  "Damaged",
  "Other",
];

const ORDER_STATUS_STEPS: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

/**
 * Order Detail Page component
 */
export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  useAuth();

  const [state, setState] = useState<OrderDetailPageState>({
    order: null,
    isLoading: true,
    error: null,
    returnModalVisible: false,
    returnForm: { itemIds: [], reason: "", description: "" },
    isSubmittingReturn: false,
    isConfirmingReceipt: false,
  });

  // Load order details
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await orderApi.getOrderDetail(orderId);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            order: response.data,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load order";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const handleReturnClick = () => {
    setState((prev) => ({ ...prev, returnModalVisible: true }));
  };

  const handleReturnCancel = () => {
    setState((prev) => ({
      ...prev,
      returnModalVisible: false,
      returnForm: { itemIds: [], reason: "", description: "" },
    }));
  };

  const handleReturnSubmit = async () => {
    if (!state.returnForm.itemIds.length || !state.returnForm.reason) {
      message.error("Please select items and reason");
      return;
    }

    try {
      setState((prev) => ({ ...prev, isSubmittingReturn: true }));

      const response = await returnApi.createReturn({
        orderId: orderId!,
        reason: state.returnForm.reason,
        evidenceUrls: [],
      });

      if (response.success) {
        message.success("Return request submitted successfully");
        handleReturnCancel();
        // Reload order
        const orderResponse = await orderApi.getOrderDetail(orderId!);
        if (orderResponse.success) {
          setState((prev) => ({ ...prev, order: orderResponse.data || null }));
        }
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to submit return");
    } finally {
      setState((prev) => ({ ...prev, isSubmittingReturn: false }));
    }
  };

  const handleCancelOrder = () => {
    Modal.confirm({
      title: "Cancel Order",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to cancel this order? This action cannot be undone.",
      okText: "Yes, Cancel",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await orderApi.updateOrderStatus(orderId!, {
            status: "CANCELLED",
          });
          if (response.success) {
            message.success("Order cancelled successfully");
            const orderResponse = await orderApi.getOrderDetail(orderId!);
            if (orderResponse.success) {
              setState((prev) => ({ ...prev, order: orderResponse.data || null }));
            }
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to cancel order");
        }
      },
    });
  };

  const handleConfirmReceipt = () => {
    Modal.confirm({
      title: "Confirm Receipt",
      icon: <CheckCircleOutlined />,
      content: "Are you sure you have received this order? This will complete the order.",
      okText: "Yes, Confirm",
      okType: "primary",
      cancelText: "No",
      onOk: async () => {
        try {
          setState((prev) => ({ ...prev, isConfirmingReceipt: true }));
          const response = await orderApi.updateOrderStatus(orderId!, {
            status: "COMPLETED",
          });
          if (response.success) {
            message.success("Order confirmed successfully");
            const orderResponse = await orderApi.getOrderDetail(orderId!);
            if (orderResponse.success) {
              setState((prev) => ({ ...prev, order: orderResponse.data || null }));
            }
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to confirm receipt");
        } finally {
          setState((prev) => ({ ...prev, isConfirmingReceipt: false }));
        }
      },
    });
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!state.order) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {state.error && (
          <Card className="bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}
        {!state.error && <Empty description="Order not found" />}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/orders")}
          className="mt-6"
        >
          Back to Orders
        </Button>
      </div>
    );
  }

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
      dataIndex: "unitPrice",
      key: "price",
      render: (price: number) => `$${price.toLocaleString()}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (subtotal: number) => `$${subtotal.toLocaleString()}`,
    },
  ];

  const statusIndex = ORDER_STATUS_STEPS[state.order.status] || 0;
  const timelineItems = [
    {
      id: "created",
      title: "Order created",
      description: `Order ${state.order.orderCode}`,
      createdAt: state.order.createdAt,
    },
    {
      id: "status",
      title: `Current status: ${state.order.status}`,
      description: `Payment method: ${state.order.paymentMethod}`,
      createdAt: state.order.updatedAt,
    },
    ...(state.order.trackingNumber
      ? [
          {
            id: "tracking",
            title: "Tracking assigned",
            description: state.order.shippingProvider,
            createdAt: state.order.updatedAt,
          },
        ]
      : []),
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/buyer/orders")}
            className="mb-4"
          >
            Back to Orders
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">Order #{state.order.id.slice(0, 8)}</h1>
        </div>

        {/* Status Timeline */}
        <Card className="mb-6 shadow-sm">
          <Steps
            current={statusIndex}
            items={[
              { title: "Pending", description: "Order placed" },
              { title: "Confirmed", description: "Payment confirmed" },
              { title: "Shipped", description: "On the way" },
              { title: "Delivered", description: "Delivered" },
            ]}
          />
        </Card>

        <div className="mb-6">
          <TimelineWidget items={timelineItems} title="Order Timeline" />
        </div>

        {/* Order Summary */}
        <Card className="mb-6 shadow-sm">
          <Row gutter={24}>
            <Col xs={24} sm={12} md={6}>
              <Statistic title="Order Date" value={new Date(state.order.createdAt || "").toLocaleDateString()} />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <span className="text-gray-600">Status: </span>
              <Tag color="blue">{state.order.status}</Tag>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <span className="text-gray-600">Payment: </span>
              <Tag color="green">{state.order.paymentMethod}</Tag>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic title="Total" value={`$${state.order.totalAmount.toLocaleString()}`} />
            </Col>
          </Row>
        </Card>

        {/* Items */}
        <Card title="Order Items" className="mb-6 shadow-sm">
          <Table
            columns={itemColumns}
            dataSource={(state.order.items || []).map((item: OrderItem, index: number) => ({
              ...item,
              key: index,
            }))}
            pagination={false}
          />
        </Card>

        {/* Shipping Address */}
        <Card title="Shipping Address" className="mb-6 shadow-sm">
          {state.order.shippingAddress ? (
            <div className="space-y-2">
              <p className="font-semibold">{state.order.shippingAddress.fullName}</p>
              <p>{state.order.shippingAddress.street}</p>
              <p>
                {state.order.shippingAddress.ward}, {state.order.shippingAddress.district}, {state.order.shippingAddress.city}
              </p>
              <p className="text-gray-600">{state.order.shippingAddress.phone}</p>
            </div>
          ) : (
            <Empty description="No shipping address" />
          )}
        </Card>

        {state.order.trackingNumber && (
          <Card title="Shipping Tracking" className="mb-6 shadow-sm">
            <Space direction="vertical" size={8}>
              <div>
                <span className="text-gray-600">Provider: </span>
                <Tag color="blue">{state.order.shippingProvider || "Carrier"}</Tag>
              </div>
              <div>
                <span className="text-gray-600">Tracking Number: </span>
                <span className="font-mono">{state.order.trackingNumber}</span>
              </div>
              {buildTrackingUrl(state.order.shippingProvider, state.order.trackingNumber) && (
                <Button
                  onClick={() =>
                    window.open(
                      buildTrackingUrl(state.order.shippingProvider, state.order.trackingNumber) || "",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  Track Shipment
                </Button>
              )}
            </Space>
          </Card>
        )}

        {/* Price Summary */}
        <Card className="mb-6 shadow-sm">
          <Row justify="end" gutter={16} className="mb-4">
            <Col span={12}>
              <div className="flex justify-between mb-3">
                <span>Subtotal:</span>
                <span>${state.order.subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span>Shipping:</span>
                <span>${state.order.shippingFee.toLocaleString()}</span>
              </div>
              {state.order.discountAmount > 0 && (
                <div className="flex justify-between mb-3 text-green-600">
                  <span>Discount:</span>
                  <span>-${state.order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <Divider />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${state.order.totalAmount.toLocaleString()}</span>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Action Buttons */}
        <Card className="shadow-sm">
          <Space wrap>
            <Button icon={<DownloadOutlined />}>Download Invoice</Button>

            {state.order.status === "PENDING" && (
              <Button danger onClick={handleCancelOrder}>
                Cancel Order
              </Button>
            )}

            {state.order.status === "DELIVERED" && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={state.isConfirmingReceipt}
                onClick={handleConfirmReceipt}
              >
                Confirm Receipt
              </Button>
            )}

            {(state.order.status === "DELIVERED" || state.order.status === "SHIPPED") && (
              <Button
                type="primary"
                danger
                icon={<UndoOutlined />}
                onClick={handleReturnClick}
              >
                Request Return
              </Button>
            )}
          </Space>
        </Card>
      </div>

      {/* Return Modal */}
      <Modal
        title="Request Return"
        open={state.returnModalVisible}
        onCancel={handleReturnCancel}
        footer={[
          <Button key="cancel" onClick={handleReturnCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={state.isSubmittingReturn}
            onClick={handleReturnSubmit}
          >
            Submit Return Request
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Select Items to Return" required>
            <Select
              mode="multiple"
              placeholder="Select items"
              value={state.returnForm.itemIds}
              onChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  returnForm: { ...prev.returnForm, itemIds: value },
                }))
              }
              options={(state.order.items || []).map((item: OrderItem) => ({
                label: item.productName,
                value: item.id,
              }))}
            />
          </Form.Item>

          <Form.Item label="Return Reason" required>
            <Select
              placeholder="Select reason"
              value={state.returnForm.reason}
              onChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  returnForm: { ...prev.returnForm, reason: value },
                }))
              }
              options={RETURN_REASONS.map((reason) => ({
                label: reason,
                value: reason,
              }))}
            />
          </Form.Item>

          <Form.Item label="Description">
            <Input.TextArea
              placeholder="Describe the issue..."
              value={state.returnForm.description}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  returnForm: { ...prev.returnForm, description: e.target.value },
                }))
              }
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
