/**
 * Consignment Request Detail Page (Seller)
 * View request detail, item info, images, and contract status
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card, Col, Descriptions, Image, Row, Spin, Typography,
} from "antd";
import {
  ArrowLeftOutlined, FileProtectOutlined, InfoCircleOutlined,
  PictureOutlined, TagsOutlined,
} from "@ant-design/icons";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import type {
  ConsignmentRequestDetail,
  ConsignmentItem,
  ConsignmentContract,
  MediaAsset,
} from "@/shared/contracts/consignmentContract";
import { Badge, Button, EmptyState } from "@/shared/ui";

const { Title, Text, Paragraph } = Typography;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bản nháp", SUBMITTED: "Đã gửi", UNDER_REVIEW: "Đang xem xét",
  APPROVED: "Đã duyệt", REJECTED: "Bị từ chối", RECEIVED: "Đã tiếp nhận",
};
const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: "Submitted", UNDER_REVIEW: "Processing",
  APPROVED: "Verified", REJECTED: "Rejected", RECEIVED: "Inactive",
};
const ITEM_STATUS_LABEL: Record<string, string> = {
  PROPOSED: "Chờ kiểm tra", UNDER_INSPECTION: "Đang kiểm tra",
  ACCEPTED: "Đã chấp nhận", REJECTED: "Từ chối item",
};

export default function ConsignmentRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<ConsignmentRequestDetail | null>(null);
  const [item, setItem] = useState<ConsignmentItem | null>(null);
  const [contract, setContract] = useState<ConsignmentContract | null>(null);
  const [media, setMedia] = useState<MediaAsset[]>([]);

  useEffect(() => {
    if (!requestId) return;
    (async () => {
      try {
        const detailRes = await consignmentApi.getConsignmentDetail(requestId);
        if (detailRes.success) setRequest(detailRes.data);

        const [itemRes, contractRes, mediaRes] = await Promise.allSettled([
          consignmentApi.getItemByRequest(requestId),
          consignmentApi.getContractByRequest(requestId),
          consignmentApi.getMediaByRequest(requestId),
        ]);
        if (itemRes.status === "fulfilled" && itemRes.value.success) setItem(itemRes.value.data);
        if (contractRes.status === "fulfilled" && contractRes.value.success) setContract(contractRes.value.data);
        if (mediaRes.status === "fulfilled" && mediaRes.value.success) setMedia(mediaRes.value.data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [requestId]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Spin size="large" /></div>;
  }

  if (!request) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-16 text-center">
        <EmptyState title="Không tìm thấy yêu cầu" description="Yêu cầu không tồn tại hoặc đã bị xóa." />
        <Button onClick={() => navigate("/seller/consignments")}>Quay lại</Button>
      </div>
    );
  }

  const commissionPct = contract?.commissionRate != null
    ? (Number(contract.commissionRate) * 100).toFixed(0)
    : null;

  return (
    <div className="mx-auto max-w-[1200px] space-y-16 pb-28">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/seller/consignments")}
          type="text"
          className="rounded-xl text-slate-500 hover:text-primary px-4 h-10"
        >
          Quay lại
        </Button>
        <Badge status={STATUS_BADGE[request.status] ?? "Pending"}>
          {STATUS_LABEL[request.status] ?? request.status}
        </Badge>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Text className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/70">Chi tiết ký gửi</Text>
        <Title className="!m-0 !font-display !text-4xl !font-bold uppercase tracking-tight">
          {request.code}
        </Title>
        <Text className="text-sm text-slate-400">
          Tạo lúc: {request.createdAt ? new Date(request.createdAt).toLocaleString("vi-VN") : "—"}
        </Text>
      </div>

      <Row gutter={[32, 32]}>
        {/* Left: item + media + note */}
        <Col xs={24} lg={16} className="space-y-10">
          {/* Item info */}
          {item ? (
            <Card className="rounded-[2rem] border-pink-100/40 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <TagsOutlined className="text-xl text-primary/60" />
                <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">
                  Thông tin sản phẩm
                </Title>
              </div>
              <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Tên sản phẩm">
                  <span className="font-bold">{item.suggestedName}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Giá gốc">
                  {item.originalPrice
                    ? `${Number(item.originalPrice).toLocaleString("vi-VN")}₫`
                    : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Giá đề xuất bán">
                  {item.suggestedPrice
                    ? <span className="font-bold text-primary">{Number(item.suggestedPrice).toLocaleString("vi-VN")}₫</span>
                    : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng item">
                  <Badge
                    status={item.status === "ACCEPTED" ? "Verified" : item.status === "REJECTED" ? "Rejected" : "Pending"}
                  >
                    {ITEM_STATUS_LABEL[item.status] ?? item.status}
                  </Badge>
                </Descriptions.Item>
                {item.conditionNote && (
                  <Descriptions.Item label="Mô tả tình trạng" span={2}>
                    {item.conditionNote}
                  </Descriptions.Item>
                )}
                {item.rejectionReason && (
                  <Descriptions.Item label="Lý do từ chối" span={2}>
                    <span className="text-red-500">{item.rejectionReason}</span>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          ) : (
            <Card className="rounded-[2rem] border-pink-100/40 bg-white/50 shadow-sm">
              <EmptyState title="Chưa có thông tin sản phẩm" description="Manager đang xem xét yêu cầu của bạn." />
            </Card>
          )}

          {/* Media */}
          <Card className="rounded-[2rem] border-pink-100/40 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <PictureOutlined className="text-xl text-primary/60" />
              <Title level={4} className="!m-0 !font-display uppercase tracking-widest text-base">
                Hình ảnh đã tải ({media.length})
              </Title>
            </div>
            {media.length === 0 ? (
              <EmptyState title="Chưa có ảnh" description="Bạn chưa tải ảnh lên cho yêu cầu này." />
            ) : (
              <Image.PreviewGroup>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {media.map((m, i) => (
                    <Image
                      key={m.id ?? i}
                      src={m.url}
                      className="rounded-xl object-cover aspect-square"
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            )}
          </Card>

          {/* Note */}
          {request.note && (
            <Card className="rounded-[2rem] border-none bg-pink-50/30 p-6">
              <div className="flex items-start gap-4">
                <InfoCircleOutlined className="mt-1 text-primary/60" />
                <div className="space-y-1">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Ghi chú</Text>
                  <Paragraph className="!m-0 text-base font-medium italic text-slate-600/80">
                    "{request.note}"
                  </Paragraph>
                </div>
              </div>
            </Card>
          )}
        </Col>

        {/* Right: contract & timeline */}
        <Col xs={24} lg={8}>
          <div className="sticky top-32 space-y-8">
            {/* Contract status */}
            <Card className="rounded-[2rem] border-pink-100/40 bg-white shadow-luxury">
              <div className="flex items-center gap-3 mb-4">
                <FileProtectOutlined className="text-xl text-primary/60" />
                <Title level={5} className="!m-0 !font-display uppercase tracking-widest text-sm">
                  Hợp đồng
                </Title>
              </div>

              {contract ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <Text className="text-slate-400">Trạng thái:</Text>
                    <Badge status={contract.status === "SIGNED" ? "Verified" : "Pending"}>
                      {contract.status === "SIGNED" ? "Đã ký" : "Chờ ký"}
                    </Badge>
                  </div>
                  {commissionPct && (
                    <div className="flex justify-between text-sm">
                      <Text className="text-slate-400">Hoa hồng:</Text>
                      <Text className="font-bold text-slate-700">{commissionPct}%</Text>
                    </div>
                  )}
                  {contract.agreedPrice != null && (
                    <div className="flex justify-between text-sm">
                      <Text className="text-slate-400">Giá đã đồng ý:</Text>
                      <Text className="font-bold text-primary">
                        {Number(contract.agreedPrice).toLocaleString("vi-VN")}₫
                      </Text>
                    </div>
                  )}
                  {contract.signedAt && (
                    <div className="flex justify-between text-sm">
                      <Text className="text-slate-400">Ngày ký:</Text>
                      <Text className="text-slate-600 text-xs">
                        {new Date(contract.signedAt).toLocaleString("vi-VN")}
                      </Text>
                    </div>
                  )}

                  {contract.status !== "SIGNED" && requestId && (
                    <Link to={`/seller/consignments/${requestId}/contract/sign`} className="block mt-3">
                      <Button type="primary" block icon={<FileProtectOutlined />} className="rounded-xl">
                        Ký hợp đồng ngay
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <Text className="text-sm text-slate-400">
                    {request.status === "APPROVED"
                      ? "Manager đang chuẩn bị hợp đồng."
                      : "Hợp đồng sẽ được tạo sau khi yêu cầu được duyệt."}
                  </Text>
                </div>
              )}
            </Card>

            {/* Status flow */}
            <Card className="rounded-[2rem] border-pink-100/40 bg-white/60 shadow-sm">
              <Title level={5} className="!m-0 !mb-4 !font-display uppercase tracking-widest text-sm">
                Tiến trình
              </Title>
              <div className="space-y-3">
                {["SUBMITTED", "UNDER_REVIEW", "APPROVED", "RECEIVED"].map((s, i) => {
                  const statuses = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "RECEIVED", "REJECTED"];
                  const currentIdx = statuses.indexOf(request.status);
                  const stepIdx = statuses.indexOf(s);
                  const isDone = currentIdx >= stepIdx;
                  const isCurrent = request.status === s;
                  void i; // suppress unused warning
                  return (
                    <div key={s} className={`flex items-center gap-3 text-sm ${isDone ? "text-slate-700" : "text-slate-300"}`}>
                      <div className={`h-2 w-2 rounded-full shrink-0 ${isCurrent ? "bg-primary" : isDone ? "bg-emerald-400" : "bg-slate-200"}`} />
                      <span className={`font-medium ${isCurrent ? "font-bold text-primary" : ""}`}>
                        {STATUS_LABEL[s]}
                      </span>
                    </div>
                  );
                })}
                {request.status === "REJECTED" && (
                  <div className="flex items-center gap-3 text-sm text-red-500">
                    <div className="h-2 w-2 rounded-full shrink-0 bg-red-400" />
                    <span className="font-bold">Bị từ chối</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
