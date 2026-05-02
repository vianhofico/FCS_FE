import { useEffect, useMemo, useState } from "react";
import { Button, Card, Divider, Empty, Space, Table, Tag, Tabs, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import { orderApi } from "@/modules/order/api/orderApi";
import { returnApi } from "@/modules/order/api/returnApi";
import type { OrderSummary } from "@/shared/contracts/orderContract";
import type { ReturnRequestSummary } from "@/shared/contracts/returnContract";

type BulkTabKey = "orders" | "returns";

type BulkOrderRow = OrderSummary & { key: string };
type BulkReturnRow = ReturnRequestSummary & { key: string };

const ORDER_TARGET_STATUS = "CONFIRMED";
const RETURN_TARGET_STATUS = "APPROVED";

export default function BulkActionPanel() {
  const [activeTab, setActiveTab] = useState<BulkTabKey>("orders");
  const [orders, setOrders] = useState<BulkOrderRow[]>([]);
  const [returns, setReturns] = useState<BulkReturnRow[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<React.Key[]>([]);
  const [selectedReturnIds, setSelectedReturnIds] = useState<React.Key[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [ordersResponse, returnsResponse] = await Promise.all([
          orderApi.getOrders({ size: 20 }),
          returnApi.getReturns({ size: 20 }),
        ]);

        setOrders((ordersResponse.data?.content || []).map((item) => ({ ...item, key: item.id })));
        setReturns((returnsResponse.data?.content || []).map((item) => ({ ...item, key: item.id })));
      } catch {
        setOrders([]);
        setReturns([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const orderColumns: ColumnsType<BulkOrderRow> = useMemo(
    () => [
      { title: "Order", dataIndex: "orderCode", key: "orderCode" },
      { title: "Buyer", dataIndex: "buyerId", key: "buyerId" },
      { title: "Status", dataIndex: "status", key: "status", render: (status: string) => <Tag>{status}</Tag> },
      { title: "Total", dataIndex: "totalAmount", key: "totalAmount", render: (value: number) => `$${value.toLocaleString()}` },
    ],
    []
  );

  const returnColumns: ColumnsType<BulkReturnRow> = useMemo(
    () => [
      { title: "Return", dataIndex: "id", key: "id" },
      { title: "Order", dataIndex: "orderId", key: "orderId" },
      { title: "Status", dataIndex: "status", key: "status", render: (status: string) => <Tag>{status}</Tag> },
      { title: "Reason", dataIndex: "reason", key: "reason" },
    ],
    []
  );

  const handleBulkOrders = async (status: string) => {
    if (!selectedOrderIds.length) {
      message.warning("Select at least one order");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedOrderIds.map((id) => orderApi.updateOrderStatus(String(id), { status: status as never }))
      );
      message.success(`Updated ${selectedOrderIds.length} order(s)`);
      setSelectedOrderIds([]);
    } catch {
      message.error("Bulk order update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkReturns = async (status: string) => {
    if (!selectedReturnIds.length) {
      message.warning("Select at least one return");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedReturnIds.map((id) => returnApi.updateReturnStatus(String(id), { status: status as never }))
      );
      message.success(`Updated ${selectedReturnIds.length} return(s)`);
      setSelectedReturnIds([]);
    } catch {
      message.error("Bulk return update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card title="Bulk Actions" loading={isLoading}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <p>Execute safe bulk moderation actions across orders and returns.</p>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as BulkTabKey)}
          items={[
            {
              key: "orders",
              label: "Orders",
              children: (
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <Space>
                    <Button type="primary" loading={isSubmitting} onClick={() => handleBulkOrders(ORDER_TARGET_STATUS)}>
                      Confirm selected
                    </Button>
                    <Button danger loading={isSubmitting} onClick={() => handleBulkOrders("CANCELLED")}>
                      Cancel selected
                    </Button>
                  </Space>
                  <Table
                    rowSelection={{ selectedRowKeys: selectedOrderIds, onChange: setSelectedOrderIds }}
                    columns={orderColumns}
                    dataSource={orders}
                    pagination={false}
                    locale={{ emptyText: <Empty description="No orders available" /> }}
                  />
                </Space>
              ),
            },
            {
              key: "returns",
              label: "Returns",
              children: (
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <Space>
                    <Button type="primary" loading={isSubmitting} onClick={() => handleBulkReturns(RETURN_TARGET_STATUS)}>
                      Approve selected
                    </Button>
                    <Button danger loading={isSubmitting} onClick={() => handleBulkReturns("REJECTED")}>
                      Reject selected
                    </Button>
                  </Space>
                  <Table
                    rowSelection={{ selectedRowKeys: selectedReturnIds, onChange: setSelectedReturnIds }}
                    columns={returnColumns}
                    dataSource={returns}
                    pagination={false}
                    locale={{ emptyText: <Empty description="No returns available" /> }}
                  />
                </Space>
              ),
            },
          ]}
        />
        <Divider />
        <p style={{ margin: 0, color: "#666" }}>Bulk updates call the existing order and return status APIs directly.</p>
      </Space>
    </Card>
  );
}
