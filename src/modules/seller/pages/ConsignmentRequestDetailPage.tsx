/**
 * Consignment Request Detail Page (Seller)
 * View consignment request details and accept/reject
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  message,
  Modal,
  Row,
  Col,
  Form,
  Space,
  Typography,
} from "antd";
import { ArrowLeftOutlined, InfoCircleOutlined, TagsOutlined } from "@ant-design/icons";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import type { ConsignmentRequestDetail } from "@/shared/contracts/consignmentContract";
import TimelineWidget from "@/shared/components/TimelineWidget";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Text, Paragraph } = Typography;

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
      title: "Chấp nhận yêu cầu ký gửi",
      content: "Bạn có đồng ý với các điều khoản và muốn chấp nhận yêu cầu ký gửi này không?",
      okText: "Chấp nhận",
      okType: "primary",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setState((prev) => ({ ...prev, isProcessing: true }));
          const response = await consignmentApi.acceptConsignment(requestId!);

          if (response.success) {
            message.success("Đã chấp nhận yêu cầu ký gửi");
            setState((prev) => ({ ...prev, request: response.data || null }));
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Chấp nhận yêu cầu thất bại");
        } finally {
          setState((prev) => ({ ...prev, isProcessing: false }));
        }
      },
    });
  };

  const handleReject = () => {
    Modal.confirm({
      title: "Từ chối yêu cầu ký gửi",
      content: "Nhập lý do từ chối:",
      okText: "Từ chối",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setState((prev) => ({ ...prev, isProcessing: true }));
          const reason = form.getFieldValue("rejectionReason") || "Không có lý do cụ thể";
          const response = await consignmentApi.rejectConsignment(requestId!, {
            reason,
          });

          if (response.success) {
            message.success("Đã từ chối yêu cầu ký gửi");
            setState((prev) => ({ ...prev, request: response.data || null }));
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Từ chối yêu cầu thất bại");
        } finally {
          setState((prev) => ({ ...prev, isProcessing: false }));
        }
      },
    });
  };

  if (!state.request) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/seller/consignments")}
          type="text"
          className="rounded-xl border-border/60 bg-white/50 text-slate-500 transition-soft hover:border-primary hover:text-primary px-4 py-2 h-auto"
        >
          Quay lại
        </Button>
        {state.error ? (
          <Card className="rounded-[2rem] border-red-100 bg-red-50/50 p-6 text-center shadow-sm">
            <Paragraph className="!m-0 font-medium text-red-800 italic">{state.error}</Paragraph>
          </Card>
        ) : (
          <EmptyState
            title="Không tìm thấy yêu cầu"
            description="Thông tin yêu cầu ký gửi có thể đã bị thay đổi hoặc không tồn tại."
          />
        )}
      </div>
    );
  }

  const request = state.request;
  const createdAt = request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "—";
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    ACCEPTED: "Verified",
    REJECTED: "Rejected",
    CANCELLED: "Inactive",
    SUBMITTED: "Submitted",
    APPROVED: "Verified",
    REVIEWING: "OnlineReview",
  };

  const timelineItems = [
    {
      id: "created",
      title: "Yêu cầu đã được khởi tạo",
      description: `Mã ký gửi: ${request.code}`,
      createdAt: request.createdAt,
    },
    {
      id: "status",
      title: `Trạng thái hiện tại: ${statusMap[request.status] || request.status}`,
      description: request.note || "Đang trong quá trình xem xét",
      createdAt: request.updatedAt,
    },
    ...(request.contract?.signedAt
      ? [
          {
            id: "contract-signed",
            title: "Hợp đồng đã ký kết",
            description: `Mức hoa hồng: ${request.contract.commissionRate ?? 0}%`,
            createdAt: request.contract.signedAt,
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          type="text"
          className="rounded-xl border-border/60 bg-white/50 text-slate-500 transition-soft hover:border-primary hover:text-primary px-4 py-2 h-auto"
        >
          Quay lại
        </Button>
        <Badge status={statusMap[request.status] || request.status}>{request.status}</Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Chi tiết ký gửi</Text>
          <div className="h-px flex-1 bg-pink-100/50" />
        </div>
        <Title className="!m-0 !font-display !text-4xl !font-bold uppercase tracking-tight text-text-dark">Mã yêu cầu: {request.code}</Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16} className="space-y-8">
          <Card className="rounded-[2.5rem] border-pink-100/40 bg-white/80 p-8 shadow-sm backdrop-blur-md">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="space-y-1">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày khởi tạo</Text>
                <div className="text-lg font-bold text-slate-700">{createdAt}</div>
              </div>
              <div className="space-y-1">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số lượng món đồ</Text>
                <div className="text-lg font-bold text-slate-700">{request.itemCount || 0} sản phẩm</div>
              </div>
              <div className="space-y-1">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã hợp đồng</Text>
                <div className="text-lg font-bold text-primary italic">{request.contract?.id ? `#${request.contract.id.slice(-8).toUpperCase()}` : "Chưa có"}</div>
              </div>
            </div>
          </Card>

          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <TagsOutlined className="text-xl text-primary/60" />
              <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">Danh sách sản phẩm</Title>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {request.items && request.items.length > 0 ? (
                request.items.map((item) => (
                  <Card key={item.id} className="rounded-3xl border-pink-50 bg-white transition-soft hover:shadow-luxury">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <Title level={5} className="!m-0 !font-sans !font-bold text-slate-800">{item.suggestedName}</Title>
                        <Badge status="Active">New</Badge>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <Text className="text-xl font-bold text-primary">{item.suggestedPrice.toLocaleString()}₫</Text>
                        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Giá đề xuất</Text>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState title="Trống" description="Không có sản phẩm nào trong yêu cầu này." />
                </div>
              )}
            </div>
          </section>

          {request.note && (
            <Card className="rounded-[2rem] border-none bg-pink-50/30 p-8">
              <div className="flex items-start gap-4">
                <InfoCircleOutlined className="mt-1 text-primary/60" />
                <div className="space-y-2">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Ghi chú từ Seller</Text>
                  <Paragraph className="!m-0 text-lg font-medium italic text-slate-600/80">"{request.note}"</Paragraph>
                </div>
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8} className="space-y-8">
          <div className="sticky top-32 space-y-8">
            <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-luxury">
              <TimelineWidget items={timelineItems} title="Hành trình ký gửi" />
            </Card>

            {request.status === "SUBMITTED" && (
              <Card className="rounded-[2.5rem] border-pink-100 bg-pink-50/50 p-8 text-center">
                <Title level={5} className="!mb-6 !font-display uppercase tracking-widest text-xs">Thao tác yêu cầu</Title>
                <Space orientation="vertical" className="w-full" size="middle">
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={handleAccept}
                    loading={state.isProcessing}
                    className="h-14 rounded-2xl shadow-luxury"
                  >
                    CHẤP NHẬN
                  </Button>
                  <Button
                    block
                    size="large"
                    danger
                    onClick={handleReject}
                    loading={state.isProcessing}
                    className="h-14 rounded-2xl border-red-200 text-red-500 hover:!bg-red-50"
                  >
                    TỪ CHỐI
                  </Button>
                </Space>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
