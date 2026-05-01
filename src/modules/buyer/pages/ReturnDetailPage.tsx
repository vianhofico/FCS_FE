/**
 * Return Detail Page (Buyer)
 * View full return details and manage return process
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spin,
  Empty,
  Space,
  Steps,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { returnApi } from "@/modules/order/api/returnApi";
import type { ReturnRequestDetail } from "@/shared/contracts/returnContract";
import type { UploadFile } from "antd/es/upload";

interface ReturnDetailPageState {
  returnData: ReturnRequestDetail | null;
  isLoading: boolean;
  error: string | null;
  uploadingProof: boolean;
  proofFiles: UploadFile[];
}

const RETURN_STATUS_STEPS: Record<string, number> = {
  PENDING: 0,
  APPROVED: 1,
  IN_TRANSIT: 2,
  RECEIVED: 3,
  REFUNDED: 4,
};

/**
 * Return Detail Page component
 */
export default function ReturnDetailPage() {
  const { returnId } = useParams<{ returnId: string }>();
  const navigate = useNavigate();


  const [state, setState] = useState<ReturnDetailPageState>({
    returnData: null,
    isLoading: true,
    error: null,
    uploadingProof: false,
    proofFiles: [],
  });

  // Load return details
  useEffect(() => {
    const fetchReturnDetail = async () => {
      if (!returnId) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await returnApi.getReturnDetail(returnId);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            returnData: response.data,
            isLoading: false,
          }));
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load return";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      }
    };

    fetchReturnDetail();
  }, [returnId]);

  const handleCancelReturn = () => {
    Modal.confirm({
      title: "Cancel Return",
      content: "Are you sure you want to cancel this return request?",
      okText: "Yes, Cancel Return",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await returnApi.updateReturnStatus(returnId!, {
            status: "CANCELLED",
          });
          if (response.success) {
            message.success("Return cancelled");
            const detail = await returnApi.getReturnDetail(returnId!);
            if (detail.success) {
              setState((prev) => ({ ...prev, returnData: detail.data || null }));
            }
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Failed to cancel return");
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

  if (!state.returnData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {state.error && (
          <Card className="bg-red-50 border-red-200">
            <p className="text-red-800">{state.error}</p>
          </Card>
        )}
        {!state.error && <Empty description="Return not found" />}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/returns")}
          className="mt-6"
        >
          Back to Returns
        </Button>
      </div>
    );
  }

  const statusIndex = RETURN_STATUS_STEPS[state.returnData.status] || 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/buyer/returns")}
            className="mb-4"
          >
            Back to Returns
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">
            Return #{state.returnData.id.slice(0, 8)}
          </h1>
        </div>

        {/* Status Timeline */}
        <Card className="mb-6 shadow-sm">
          <Steps
            current={statusIndex}
            items={[
              { title: "Pending", description: "Awaiting review" },
              { title: "Approved", description: "Ready to ship back" },
              { title: "In Transit", description: "On the way" },
              { title: "Received", description: "Processing refund" },
              { title: "Refunded", description: "Refund completed" },
            ]}
          />
        </Card>

        {/* Return Summary */}
        <Card className="mb-6 shadow-sm">
          <Row gutter={24}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Request Date"
                value={new Date(state.returnData.createdAt || "").toLocaleDateString()}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <span className="text-gray-600">Status: </span>
              <Tag color="orange">{state.returnData.status}</Tag>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Refund Amount"
                value={`$${(state.returnData.refundAmount || 0).toLocaleString()}`}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Reason"
                value={state.returnData.reason}
              />
            </Col>
          </Row>
        </Card>

        {/* Items Being Returned */}
        <Card title="Return Details" className="mb-6 shadow-sm">
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <h4 className="font-semibold mb-2">Order ID</h4>
              <p className="text-gray-700">{state.returnData.orderId}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Reason</h4>
              <p className="text-gray-700">{state.returnData.reason}</p>
            </div>
            {state.returnData.approvalReason && (
              <div>
                <h4 className="font-semibold mb-2">Approval Reason</h4>
                <p className="text-gray-700">{state.returnData.approvalReason}</p>
              </div>
            )}
            {state.returnData.rejectionReason && (
              <div>
                <h4 className="font-semibold mb-2">Rejection Reason</h4>
                <p className="text-gray-700 text-red-600">{state.returnData.rejectionReason}</p>
              </div>
            )}
          </Space>
        </Card>

        {/* Return Reason & Description */}
        {state.returnData.evidenceUrls && state.returnData.evidenceUrls.length > 0 && (
          <Card title="Evidence" className="mb-6 shadow-sm">
            <Space direction="vertical" size="small" className="w-full">
              {state.returnData.evidenceUrls.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Evidence #{idx + 1}
                </a>
              ))}
            </Space>
          </Card>
        )}

        {/* Evidence Links */}
        {state.returnData.evidenceUrls && state.returnData.evidenceUrls.length > 0 && (
          <Card title="Evidence" className="mb-6 shadow-sm">
            <Space direction="vertical" size="small" className="w-full">
              {state.returnData.evidenceUrls.map((url, idx) => (
                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  Evidence #{idx + 1}
                </a>
              ))}
            </Space>
          </Card>
        )}

        {/* Action Buttons */}
        {state.returnData.status === "PENDING" && (
          <Card className="shadow-sm">
            <Space>
              <Button danger onClick={handleCancelReturn}>
                Cancel Return Request
              </Button>
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
}
