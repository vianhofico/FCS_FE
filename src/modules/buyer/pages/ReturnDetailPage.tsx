/**
 * Return Detail Page (Buyer)
 * View full return details and manage return process
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Spin,
  Steps,
  Row,
  Col,
  Modal,
  message,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { returnApi } from "@/modules/order/api/returnApi";
import type { ReturnRequestDetail } from "@/shared/contracts/returnContract";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Text } = Typography;

interface ReturnDetailPageState {
  returnData: ReturnRequestDetail | null;
  isLoading: boolean;
  error: string | null;
}

const RETURN_STATUS_STEPS: Record<string, number> = {
  PENDING: 0,
  APPROVED: 1,
  ITEM_RECEIVED: 2,
  REFUNDED: 3,
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
      title: <span className="font-display text-xl font-black uppercase text-rose-500">Hủy yêu cầu trả hàng</span>,
      icon: <ExclamationCircleOutlined className="text-rose-500" />,
      content: "Bạn có chắc chắn muốn hủy yêu cầu trả hàng này không? Thao tác này không thể hoàn tác.",
      okText: "Xác nhận hủy",
      okType: "danger",
      cancelText: "Quay lại",
      centered: true,
      onOk: async () => {
        try {
          const response = await returnApi.updateReturnStatus(returnId!, {
            status: "REJECTED",
            reason: "Người mua hủy yêu cầu trả hàng",
          });
          if (response.success) {
            message.success("Đã hủy yêu cầu trả hàng");
            const detail = await returnApi.getReturnDetail(returnId!);
            if (detail.success) {
              setState((prev) => ({ ...prev, returnData: detail.data || null }));
            }
          }
        } catch (err) {
          message.error(err instanceof Error ? err.message : "Lỗi khi hủy yêu cầu");
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
      <div className="mx-auto max-w-4xl space-y-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/returns")}
          type="text"
          className="rounded-xl border-border/60 bg-white/50 text-slate-500 transition-soft hover:border-primary hover:text-primary px-4 py-2 h-auto"
        >
          Quay lại danh sách
        </Button>
        <EmptyState
          title="Không tìm thấy yêu cầu"
          description="Thông tin yêu cầu hoàn trả không tồn tại hoặc đã bị thay đổi."
        />
      </div>
    );
  }

  const statusIndex = RETURN_STATUS_STEPS[state.returnData.status] || 0;
  const statusMap: Record<string, string> = {
    PENDING: "Pending",
    APPROVED: "Verified",
    REJECTED: "Rejected",
    ITEM_RECEIVED: "Processing",
    REFUNDED: "Verified",
  };
  const statusLabels: Record<string, string> = {
    PENDING: "Đang chờ",
    APPROVED: "Đã duyệt",
    REJECTED: "Bị từ chối",
    ITEM_RECEIVED: "Đã nhận hàng",
    REFUNDED: "Đã hoàn tiền",
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-14 pb-28">
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/buyer/returns")}
          type="text"
          className="rounded-xl border-border/60 bg-white/50 text-slate-500 transition-soft hover:border-primary hover:text-primary px-4 py-2 h-auto"
        >
          Quay lại danh sách
        </Button>
        <Badge status={statusMap[state.returnData.status] || "Pending"}>{statusLabels[state.returnData.status] || state.returnData.status}</Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Chi tiết hoàn trả</Text>
          <div className="h-px flex-1 bg-pink-100/50" />
        </div>
        <Title className="!m-0 !font-display !text-4xl !font-bold uppercase tracking-tight text-text-dark">Yêu cầu #{state.returnData.id.slice(0, 8).toUpperCase()}</Title>
      </div>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm">
        <Steps
          current={statusIndex}
          className="luxury-steps"
          items={[
            { title: "Chờ duyệt", description: "Đang kiểm tra" },
            { title: "Chấp nhận", description: "Gửi hàng về" },
            { title: "Đang về", description: "Đang vận chuyển" },
            { title: "Đã nhận", description: "Kiểm tra hàng" },
            { title: "Hoàn tiền", description: "Đã hoàn tất" },
          ]}
        />
      </Card>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16} className="space-y-8">
          <Card
            title={<span className="font-display text-lg font-bold uppercase tracking-widest text-text-dark flex items-center gap-3"><FileTextOutlined className="text-primary/60" /> Thông tin yêu cầu</span>}
            className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã đơn hàng gốc</div>
                <div className="mt-1 font-mono text-base font-bold text-slate-700">#{state.returnData.orderId.slice(0, 8).toUpperCase()}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lý do hoàn trả</div>
                <div className="mt-1 text-base font-bold text-primary italic">"{state.returnData.reason}"</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày gửi yêu cầu</div>
                <div className="mt-1 text-base font-medium text-slate-600">{new Date(state.returnData.createdAt || "").toLocaleString()}</div>
              </div>

              {state.returnData.approvalReason && (
                <div className="md:col-span-2 rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Ghi chú từ Re:Wear</div>
                  <div className="mt-1 text-sm font-medium text-emerald-800">{state.returnData.approvalReason}</div>
                </div>
              )}

              {state.returnData.rejectionReason && (
                <div className="md:col-span-2 rounded-2xl bg-rose-50/50 p-4 border border-rose-100">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Lý do từ chối</div>
                  <div className="mt-1 text-sm font-medium text-rose-800">{state.returnData.rejectionReason}</div>
                </div>
              )}
            </div>
          </Card>

          {state.returnData.evidenceUrls && state.returnData.evidenceUrls.length > 0 && (
            <Card
              title={<span className="font-display text-lg font-bold uppercase tracking-widest text-text-dark">Bằng chứng hình ảnh</span>}
              className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {state.returnData.evidenceUrls.map((url, idx) => (
                  <div key={idx} className="aspect-square overflow-hidden rounded-2xl border border-pink-50 shadow-sm transition-soft hover:shadow-md cursor-pointer">
                    <img src={url} alt={`Evidence ${idx + 1}`} className="h-full w-full object-cover" onClick={() => window.open(url, "_blank")} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <div className="sticky top-32 space-y-8">
            <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-luxury text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary text-3xl mb-4">
                <SafetyCertificateOutlined />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số tiền hoàn dự kiến</div>
              <div className="mt-2 font-display text-3xl font-black text-primary tracking-tight">{(state.returnData.refundAmount || 0).toLocaleString()}₫</div>
              <div className="mt-2 text-[10px] font-bold text-slate-400 italic">Hệ thống sẽ hoàn trả sau khi kiểm duyệt hàng về</div>
            </Card>

            <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-sm">
               <div className="space-y-6">
                 <div className="flex items-center gap-4">
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                     <ClockCircleOutlined />
                   </div>
                   <div>
                     <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cập nhật cuối</div>
                     <div className="text-xs font-bold text-slate-700">{new Date(state.returnData.updatedAt || "").toLocaleString()}</div>
                   </div>
                 </div>

                 <div className="pt-4 space-y-3">
                   {state.returnData.status === "PENDING" && (
                     <Button danger block size="large" onClick={handleCancelReturn} className="h-12 rounded-xl font-bold border-red-100 text-red-500">
                       HỦY YÊU CẦU
                     </Button>
                   )}
                   <Button block type="text" className="font-bold text-slate-400 hover:text-primary">
                     Cần hỗ trợ? Liên hệ Re:Wear
                   </Button>
                 </div>
               </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
