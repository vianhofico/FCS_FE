/**
 * Consignment Contract Page (Seller)
 * View and manage consignment contracts
 */

import { useState, useEffect } from "react";
import { Card, Button, Table, Space, Spin, Empty, Tag, Modal, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import type { ConsignmentContract } from "@/shared/contracts/consignmentContract";
import { useAuth } from "@/shared/context/AuthContext";

interface PageState {
  contracts: ConsignmentContract[];
  isLoading: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
}

export default function ConsignmentContractPage() {
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({
    contracts: [],
    isLoading: true,
    error: null,
    page: 0,
    size: 10,
    total: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchContracts = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await consignmentApi.getConsignmentContracts({
          consignorId: user.id,
          page: state.page,
          size: state.size,
        });

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            contracts: response.data?.content || [],
            total: response.data?.totalElements || 0,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load contracts";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchContracts();
  }, [user, state.page, state.size]);

  const handleDownloadContract = async (contractId: string) => {
    try {
      message.loading({ content: "Downloading contract...", key: "download" });
      const response = await consignmentApi.downloadContract(contractId);

      if (response.success) {
        // In real scenario, trigger file download
        message.success({ content: "Contract downloaded", key: "download" });
      }
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to download contract");
    }
  };

  const handleTerminateContract = (contractId: string) => {
    Modal.confirm({
      title: "Terminate Contract",
      content: "Are you sure you want to terminate this contract? This action cannot be undone.",
      okText: "Yes, Terminate",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await consignmentApi.terminateContract(contractId);

          if (response.success) {
            message.success("Contract terminated");
            setState((prev) => ({
              ...prev,
              contracts: prev.contracts.map((c) =>
                c.id === contractId ? { ...c, status: "TERMINATED" } : c
              ),
            }));
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to terminate contract");
        }
      },
    });
  };

  if (state.isLoading && state.contracts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const columns = [
    {
      title: "Contract ID",
      dataIndex: "id",
      key: "id",
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ACTIVE: "green",
          SUSPENDED: "orange",
          TERMINATED: "red",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Commission Rate",
      dataIndex: "commissionRate",
      key: "commission",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: ConsignmentContract) => (
        <Space>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadContract(record.id)}
          >
            Download
          </Button>
          {record.status === "SIGNED" && (
            <Button
              danger
              type="link"
              onClick={() => handleTerminateContract(record.id)}
            >
              Terminate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Consignment Contracts</h1>

        {/* Error */}
        {state.error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}

        {/* Table */}
        <Card className="shadow-sm">
          <Table
            columns={columns}
            dataSource={state.contracts.map((contract) => ({ ...contract, key: contract.id }))}
            pagination={false}
            loading={state.isLoading}
          />

          {/* Pagination */}
          {state.total > state.size && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                <Button
                  disabled={state.page === 0}
                  onClick={() => setState((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="py-2">
                  Page {state.page + 1} of {Math.ceil(state.total / state.size)}
                </span>
                <Button
                  disabled={state.page >= Math.ceil(state.total / state.size) - 1}
                  onClick={() => setState((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Empty */}
          {state.contracts.length === 0 && !state.isLoading && (
            <Empty
              description="No active contracts"
              style={{ marginTop: 24 }}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
