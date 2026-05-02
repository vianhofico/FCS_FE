/**
 * Consignment Request Detail Page (Seller)
 * View consignment request details and accept/reject
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Empty,
  Space,
  message,
  Modal,
  Row,
  Col,
  Statistic,
  Form,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import type { ConsignmentRequestDetail } from "@/shared/contracts/consignmentContract";
import TimelineWidget from "@/shared/components/TimelineWidget";

interface PageState {
  request: ConsignmentRequestDetail | null;
  isLoading: boolean;
  error: string | null;
  isProcessing: boolean;
}

export default function ConsignmentRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [state, setState] = useState<PageState>({
    request: null,
    isLoading: true,
    error: null,
    isProcessing: false,
  });

  useEffect(() => {
    if (!requestId) return;

    const fetchRequest = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const response = await consignmentApi.getConsignmentDetail(requestId);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            request: response.data,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load request";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchRequest();
  }, [requestId]);

  const handleAccept = () => {
    Modal.confirm({
      title: "Accept Consignment Request",
      content: "Do you agree to the terms and want to accept this consignment request?",
      okText: "Accept",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setState((prev) => ({ ...prev, isProcessing: true }));
          const response = await consignmentApi.acceptConsignment(requestId!);

          if (response.success) {
            message.success("Consignment request accepted");
            setState((prev) => ({ ...prev, request: response.data || null }));
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to accept request");
        } finally {
          setState((prev) => ({ ...prev, isProcessing: false }));
        }
      },
    });
  };

  const handleReject = () => {
    Modal.confirm({
      title: "Reject Consignment Request",
      content: "Enter reason for rejection:",
      okText: "Reject",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setState((prev) => ({ ...prev, isProcessing: true }));
          const reason = form.getFieldValue("rejectionReason") || "No reason provided";
          const response = await consignmentApi.rejectConsignment(requestId!, {
            reason,
          });

          if (response.success) {
            message.success("Consignment request rejected");
            setState((prev) => ({ ...prev, request: response.data || null }));
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to reject request");
        } finally {
          setState((prev) => ({ ...prev, isProcessing: false }));
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

  if (!state.request) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/seller/consignments")}
            className="mb-4"
          >
            Back
          </Button>
          {state.error && (
            <Card className="bg-red-50 border-red-200">
              <p className="text-red-800">{state.error}</p>
            </Card>
          )}
          {!state.error && <Empty description="Request not found" />}
        </div>
      </div>
    );
  }

  const request = state.request;
  const timelineItems = [
    {
      id: "created",
      title: "Request created",
      description: `Consignment ${request.code}`,
      createdAt: request.createdAt,
    },
    {
      id: "status",
      title: `Current status: ${request.status}`,
      description: request.note || "No note provided",
      createdAt: request.updatedAt,
    },
    ...(request.contract?.signedAt
      ? [
          {
            id: "contract-signed",
            title: "Contract signed",
            description: `Commission ${request.contract.commissionRate ?? 0}%`,
            createdAt: request.contract.signedAt,
          },
        ]
      : []),
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          Back
        </Button>

        {/* Request Info */}
        <Card className="mb-6 shadow-sm">
          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Statistic title="Code" value={request.code} />
            </Col>
            <Col xs={24} md={8}>
              <Statistic title="Status" value={request.status} />
            </Col>
            <Col xs={24} md={8}>
              <Statistic title="Items" value={request.itemCount || 0} />
            </Col>
          </Row>
        </Card>

        <div className="mb-6">
          <TimelineWidget items={timelineItems} title="Consignment Timeline" />
        </div>

        {/* Details */}
        {request.note && (
          <Card title="Note" className="mb-6 shadow-sm">
            <p>{request.note}</p>
          </Card>
        )}

        {/* Items */}
        {request.items && request.items.length > 0 && (
          <Card title="Items" className="mb-6 shadow-sm">
            {request.items.map((item) => (
              <div key={item.id} className="mb-4 pb-4 border-b last:border-0">
                <p className="font-semibold">{item.suggestedName}</p>
                <p className="text-sm">Price: ${item.suggestedPrice}</p>
              </div>
            ))}
          </Card>
        )}

        {/* Actions */}
        <Card className="shadow-sm">
          <Space>
            {request.status === "SUBMITTED" && (
              <>
                <Button type="primary" onClick={handleAccept} loading={state.isProcessing}>
                  Accept
                </Button>
                <Button danger onClick={handleReject} loading={state.isProcessing}>
                  Reject
                </Button>
              </>
            )}
          </Space>
        </Card>
      </div>
    </div>
  );
}
