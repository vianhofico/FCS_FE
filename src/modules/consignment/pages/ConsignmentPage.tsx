/**
 * ConsignmentPage (Manager/Admin)
 * Full consignment management: list, status transitions, create product from item
 */

import { useState, useEffect, useCallback } from "react";
import {
  App, Card, Descriptions, Drawer, Form, Image, Input, InputNumber,
  Modal, Pagination, Select, Space, Spin, Table, Tabs, Typography,
} from "antd";
import {
  CheckOutlined, CloseOutlined, ContainerOutlined, EyeOutlined,
  FileProtectOutlined, InboxOutlined, PlusOutlined, ShopOutlined,
} from "@ant-design/icons";
import { consignmentApi } from "@/modules/seller/api/consignmentApi";
import type {
  ConsignmentRequestSummary,
  ConsignmentItem,
  ConsignmentContract,
  MediaAsset,
} from "@/shared/contracts/consignmentContract";
import { Badge, Button, EmptyState } from "@/shared/ui";
import { CreateProductFromConsignmentModal } from "@/modules/consignment/components/CreateProductFromConsignmentModal";

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "Đã gửi", UNDER_REVIEW: "Đang xem xét",
  APPROVED: "Đã duyệt", REJECTED: "Từ chối", RECEIVED: "Đã tiếp nhận",
};
const STATUS_BADGE: Record<string, string> = {
  SUBMITTED: "Submitted", UNDER_REVIEW: "Processing",
  APPROVED: "Verified", REJECTED: "Rejected", RECEIVED: "Inactive",
};
const ITEM_STATUS_LABEL: Record<string, string> = {
  PROPOSED: "Chờ kiểm tra", UNDER_INSPECTION: "Đang kiểm tra",
  ACCEPTED: "Đã chấp nhận", REJECTED: "Từ chối", CONVERTED_TO_PRODUCT: "Đã tạo sản phẩm",
};

export function ConsignmentPage() {
  const { message } = App.useApp();
  const [requests, setRequests] = useState<ConsignmentRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const PAGE_SIZE = 20;

  // Detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<ConsignmentRequestSummary | null>(null);
  const [selectedItem, setSelectedItem] = useState<ConsignmentItem | null>(null);
  const [selectedContract, setSelectedContract] = useState<ConsignmentContract | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Contract form modal
  const [contractModal, setContractModal] = useState(false);
  const [contractForm] = Form.useForm();
  const [contractSaving, setContractSaving] = useState(false);

  // Product creation modal
  const [productModal, setProductModal] = useState(false);

  // Reject modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await consignmentApi.getConsignmentRequests({
        status: statusFilter as any,
        page,
        size: PAGE_SIZE,
        sort: "createdAt,desc",
      });
      if (res.success && res.data) {
        setRequests(res.data.content);
        setTotal(res.data.totalElements);
      }
    } catch { message.error("Không thể tải danh sách ký gửi"); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openDetail = async (req: ConsignmentRequestSummary) => {
    setSelected(req);
    setSelectedItem(null);
    setSelectedContract(null);
    setSelectedMedia([]);
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const [itemRes, contractRes, mediaRes] = await Promise.allSettled([
        consignmentApi.getItemByRequest(req.id),
        consignmentApi.getContractByRequest(req.id),
        consignmentApi.getMediaByRequest(req.id),
      ]);
      if (itemRes.status === "fulfilled" && itemRes.value.success) setSelectedItem(itemRes.value.data);
      if (contractRes.status === "fulfilled" && contractRes.value.success) setSelectedContract(contractRes.value.data);
      if (mediaRes.status === "fulfilled" && mediaRes.value.success) setSelectedMedia(mediaRes.value.data ?? []);
    } finally { setDetailLoading(false); }
  };

  const updateStatus = async (id: string, status: string, reason?: string) => {
    const res = await consignmentApi.updateConsignmentStatus(id, { status: status as any, reason });
    if (res.success) {
      message.success(`Trạng thái → ${STATUS_LABEL[status]}`);
      setRequests((p) => p.map((r) => r.id === id ? { ...r, status: status as any } : r));
      if (selected?.id === id) setSelected((s) => s ? { ...s, status: status as any } : s);
    }
  };

  const updateItemStatus = async (itemId: string, status: string, rejectionReason?: string) => {
    await consignmentApi.updateItemStatus(itemId, { status: status as any, rejectionReason });
    message.success(`Item → ${ITEM_STATUS_LABEL[status] ?? status}`);
    setSelectedItem((i) => i ? { ...i, status: status as any } : i);
  };

  const handleCreateContract = async (values: any) => {
    if (!selected) return;
    setContractSaving(true);
    try {
      const res = await consignmentApi.createContract({
        requestId: selected.id,
        commissionRate: values.commissionRate / 100,
        agreedPrice: values.agreedPrice,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (res.success) {
        message.success("Tạo hợp đồng thành công!");
        setSelectedContract(res.data);
        setContractModal(false);
        contractForm.resetFields();
      }
    } catch (e) { message.error(e instanceof Error ? e.message : "Tạo hợp đồng thất bại"); }
    finally { setContractSaving(false); }
  };

  const columns = [
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã</span>,
      dataIndex: "code",
      key: "code",
      render: (c: string) => <span className="font-mono text-xs font-bold text-slate-500">{c}</span>,
    },

    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ghi chú</span>,
      dataIndex: "note",
      key: "note",
      ellipsis: true,
      render: (n: string) => <span className="text-sm text-slate-600">{n || "—"}</span>,
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày gửi</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d: string) => d ? new Date(d).toLocaleDateString("vi-VN") : "—",
    },
    {
      title: <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Badge status={STATUS_BADGE[s] ?? "Pending"}>{STATUS_LABEL[s] ?? s}</Badge>,
    },
    {
      title: "",
      key: "actions",
      align: "right" as const,
      fixed: "right" as const,
      width: 260,
      render: (_: unknown, r: ConsignmentRequestSummary) => (
        <Space size="small" wrap>
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)}
            className="rounded-xl bg-pink-50 font-bold text-primary border-none">
            Chi tiết
          </Button>
          {r.status === "SUBMITTED" && (
            <Button type="text" size="small" icon={<ContainerOutlined />}
              onClick={() => updateStatus(r.id, "UNDER_REVIEW")}
              className="rounded-xl bg-blue-50 font-bold text-blue-500 border-none">
              Xem xét
            </Button>
          )}
          {r.status === "UNDER_REVIEW" && (
            <>
              <Button type="text" size="small" icon={<CheckOutlined />}
                onClick={() => updateStatus(r.id, "APPROVED")}
                className="rounded-xl bg-emerald-50 font-bold text-emerald-600 border-none">
                Duyệt
              </Button>
              <Button type="text" size="small" icon={<CloseOutlined />} danger
                onClick={() => setRejectModal({ open: true, id: r.id })}
                className="rounded-xl bg-red-50 font-bold border-none">
                Từ chối
              </Button>
            </>
          )}
          {r.status === "APPROVED" && (
            <Button type="text" size="small" icon={<InboxOutlined />}
              onClick={() => updateStatus(r.id, "RECEIVED")}
              className="rounded-xl bg-amber-50 font-bold text-amber-600 border-none">
              Nhận hàng
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-14 pb-28">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <div className="space-y-3">
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-5xl uppercase">
            Quản lý ký gửi
          </Title>
          <Paragraph className="max-w-lg text-base font-medium text-slate-400 italic">
            Xem xét, duyệt/từ chối và tạo sản phẩm từ đơn ký gửi.
          </Paragraph>
        </div>
        <div className="flex gap-3 items-center rounded-3xl bg-white/50 px-6 py-3 border border-pink-100/50">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tổng:</Text>
          <Text className="font-display text-2xl font-bold text-slate-800">{total}</Text>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white shadow-sm">
        <div className="mb-4 flex flex-wrap gap-3">
          <Select allowClear placeholder="Lọc theo trạng thái" value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(0); }}
            className="w-52"
            options={[
              { value: "SUBMITTED", label: "Đã gửi" },
              { value: "UNDER_REVIEW", label: "Đang xem xét" },
              { value: "APPROVED", label: "Đã duyệt" },
              { value: "REJECTED", label: "Từ chối" },
              { value: "RECEIVED", label: "Đã tiếp nhận" },
            ]}
          />
        </div>
        <Spin spinning={loading}>
          <Table columns={columns} dataSource={requests.map((r) => ({ ...r, key: r.id }))}
            pagination={false} className="luxury-table" scroll={{ x: 900 }} />
          {!loading && requests.length === 0 && (
            <div className="py-16 text-center">
              <EmptyState title="Không có yêu cầu" description="Chưa có yêu cầu ký gửi phù hợp." />
            </div>
          )}
        </Spin>
        <div className="mt-6 flex justify-center">
          <Pagination current={page + 1} pageSize={PAGE_SIZE} total={total}
            onChange={(p) => setPage(p - 1)} showSizeChanger={false} />
        </div>
      </Card>

      {/* ── Detail Drawer ── */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <span className="font-display font-bold uppercase text-sm">{selected?.code ?? "Chi tiết"}</span>
            {selected && <Badge status={STATUS_BADGE[selected.status] ?? "Pending"}>{STATUS_LABEL[selected.status]}</Badge>}
          </div>
        }
        open={drawerOpen} onClose={() => setDrawerOpen(false)} width={680}
        extra={
          selected && (
            <Space wrap>
              {selected.status === "SUBMITTED" && (
                <Button type="primary" icon={<ContainerOutlined />}
                  onClick={() => updateStatus(selected.id, "UNDER_REVIEW")}>
                  Bắt đầu xem xét
                </Button>
              )}
              {selected.status === "UNDER_REVIEW" && (
                <>
                  <Button type="primary" icon={<CheckOutlined />}
                    onClick={() => updateStatus(selected.id, "APPROVED")}
                    className="bg-emerald-500 border-emerald-500">
                    Phê duyệt
                  </Button>
                  <Button danger icon={<CloseOutlined />}
                    onClick={() => setRejectModal({ open: true, id: selected.id })}>
                    Từ chối
                  </Button>
                </>
              )}
              {selected.status === "APPROVED" && !selectedContract && (
                <Button type="primary" icon={<FileProtectOutlined />}
                  onClick={() => setContractModal(true)}>
                  Tạo hợp đồng
                </Button>
              )}
              {selected.status === "APPROVED" && (
                <Button icon={<InboxOutlined />}
                  onClick={() => updateStatus(selected.id, "RECEIVED")}>
                  Đã nhận hàng
                </Button>
              )}
              {selectedItem && ["ACCEPTED", "APPROVED"].includes(selectedItem.status) &&
               selected.status === "RECEIVED" &&
               selectedItem.status !== "CONVERTED_TO_PRODUCT" && (
                <Button type="primary" icon={<ShopOutlined />}
                  onClick={() => setProductModal(true)}
                  className="bg-violet-500 border-violet-500">
                  Tạo sản phẩm
                </Button>
              )}
            </Space>
          )
        }
      >
        {detailLoading ? (
          <div className="flex h-64 items-center justify-center"><Spin /></div>
        ) : selected ? (
          <Tabs defaultActiveKey="info">
            <TabPane tab="Thông tin" key="info">
              <Descriptions column={1} bordered size="small" className="mt-2">
                <Descriptions.Item label="Mã yêu cầu">
                  <span className="font-mono font-bold">{selected.code}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày gửi">
                  {selected.createdAt ? new Date(selected.createdAt).toLocaleString("vi-VN") : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">{selected.note || "—"}</Descriptions.Item>
              </Descriptions>

              {selectedItem && (
                <Card className="mt-4 rounded-2xl border-pink-100/50 bg-pink-50/30" size="small">
                  <Title level={5} className="!mb-3 !font-display uppercase tracking-widest text-xs text-primary">
                    Thông tin sản phẩm
                  </Title>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tên">
                      <span className="font-bold">{selectedItem.suggestedName}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá gốc">
                      {selectedItem.originalPrice
                        ? `${Number(selectedItem.originalPrice).toLocaleString("vi-VN")}₫`
                        : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá đề xuất">
                      {selectedItem.suggestedPrice
                        ? `${Number(selectedItem.suggestedPrice).toLocaleString("vi-VN")}₫`
                        : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tình trạng">
                      {selectedItem.conditionNote || "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái item">
                      <Badge status={selectedItem.status === "ACCEPTED" ? "Verified" : "Pending"}>
                        {ITEM_STATUS_LABEL[selectedItem.status] ?? selectedItem.status}
                      </Badge>
                    </Descriptions.Item>
                  </Descriptions>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedItem.status === "PROPOSED" && (
                      <Button size="small" type="primary"
                        onClick={() => updateItemStatus(selectedItem.id, "UNDER_INSPECTION")}>
                        Bắt đầu kiểm tra
                      </Button>
                    )}
                    {selectedItem.status === "UNDER_INSPECTION" && (
                      <>
                        <Button size="small" className="bg-emerald-500 border-emerald-500 text-white"
                          onClick={() => updateItemStatus(selectedItem.id, "ACCEPTED")}>
                          Chấp nhận item
                        </Button>
                        <Button size="small" danger
                          onClick={() =>
                            Modal.confirm({
                              title: "Từ chối item",
                              content: (
                                <Input.TextArea id="item-reject-reason"
                                  placeholder="Lý do từ chối item..." rows={3} />
                              ),
                              onOk: () => {
                                const el = document.getElementById("item-reject-reason") as HTMLTextAreaElement;
                                updateItemStatus(selectedItem.id, "REJECTED", el?.value);
                              },
                            })
                          }>
                          Từ chối item
                        </Button>
                      </>
                    )}
                    {selectedItem.status === "ACCEPTED" && selected?.status === "RECEIVED" && (
                      <Button size="small" type="primary" icon={<PlusOutlined />}
                        onClick={() => setProductModal(true)}
                        className="bg-violet-500 border-violet-500">
                        Tạo sản phẩm từ item này
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </TabPane>

            <TabPane tab={`Hình ảnh (${selectedMedia.length})`} key="media">
              {selectedMedia.length === 0 ? (
                <EmptyState title="Chưa có ảnh" description="Seller chưa tải ảnh lên." />
              ) : (
                <Image.PreviewGroup>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedMedia.map((m, i) => (
                      <Image key={m.id ?? i} src={m.url}
                        className="rounded-xl object-cover aspect-square"
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" />
                    ))}
                  </div>
                </Image.PreviewGroup>
              )}
            </TabPane>

            <TabPane tab={selectedContract ? "Hợp đồng ✓" : "Hợp đồng"} key="contract">
              {selectedContract ? (
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Trạng thái">
                    <Badge status={selectedContract.status === "SIGNED" ? "Verified" : "Pending"}>
                      {selectedContract.status === "SIGNED" ? "Đã ký" : "Chờ ký"}
                    </Badge>
                  </Descriptions.Item>
                  <Descriptions.Item label="Hoa hồng">
                    {selectedContract.commissionRate != null
                      ? `${(Number(selectedContract.commissionRate) * 100).toFixed(0)}%`
                      : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá đồng ý">
                    {selectedContract.agreedPrice
                      ? `${Number(selectedContract.agreedPrice).toLocaleString("vi-VN")}₫`
                      : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày ký">
                    {selectedContract.signedAt
                      ? new Date(selectedContract.signedAt).toLocaleString("vi-VN")
                      : "Chưa ký"}
                  </Descriptions.Item>
                </Descriptions>
              ) : selected?.status === "APPROVED" ? (
                <div className="py-10 text-center space-y-4">
                  <Text className="text-slate-400">Chưa có hợp đồng.</Text>
                  <br />
                  <Button type="primary" icon={<FileProtectOutlined />}
                    onClick={() => setContractModal(true)}>
                    Tạo hợp đồng
                  </Button>
                </div>
              ) : (
                <EmptyState title="Chưa có hợp đồng" description="Duyệt yêu cầu trước khi tạo hợp đồng." />
              )}
            </TabPane>
          </Tabs>
        ) : null}
      </Drawer>

      {/* ── Contract Modal ── */}
      <Modal open={contractModal}
        onCancel={() => { setContractModal(false); contractForm.resetFields(); }}
        title={<span className="font-display font-bold uppercase tracking-widest text-sm">Tạo hợp đồng ký gửi</span>}
        footer={null} width={480}>
        <Form form={contractForm} layout="vertical" onFinish={handleCreateContract}
          initialValues={{ commissionRate: 15 }} className="mt-4">
          <Form.Item name="commissionRate" label="Tỷ lệ hoa hồng (%)"
            rules={[{ required: true }]}>
            <InputNumber min={1} max={50} suffix="%" className="w-full h-12 rounded-xl" />
          </Form.Item>
          <Form.Item name="agreedPrice" label="Giá đồng ý bán (VND)"
            rules={[{ required: true, message: "Nhập giá đồng ý" }]}>
            <InputNumber min={0} className="w-full h-12 rounded-xl"
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v!.replace(/,*/g, "") as any}
              placeholder={selectedItem?.suggestedPrice
                ? `Đề xuất: ${Number(selectedItem.suggestedPrice).toLocaleString("vi-VN")}₫`
                : "VD: 5,000,000"} />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => { setContractModal(false); contractForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={contractSaving}>Tạo hợp đồng</Button>
          </div>
        </Form>
      </Modal>

      {/* ── Create Product Modal ── */}
      {selectedItem && selected && (
        <CreateProductFromConsignmentModal
          open={productModal}
          onClose={() => setProductModal(false)}
          requestId={selected.id}
          selectedItem={selectedItem}
          onSuccess={() => setSelectedItem((i) => i ? { ...i, status: "CONVERTED_TO_PRODUCT" as any } : i)}
          messageApi={message}
        />
      )}

      {/* ── Reject Modal ── */}
      <Modal open={!!rejectModal?.open}
        onCancel={() => { setRejectModal(null); setRejectReason(""); }}
        title="Từ chối yêu cầu ký gửi" footer={null} width={440}>
        <div className="mt-4 space-y-4">
          <Input.TextArea rows={4} placeholder="Lý do từ chối (tùy chọn)..."
            value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
            className="rounded-xl" />
          <div className="flex justify-end gap-3">
            <Button onClick={() => { setRejectModal(null); setRejectReason(""); }}>Hủy</Button>
            <Button danger type="primary"
              onClick={async () => {
                if (!rejectModal) return;
                await updateStatus(rejectModal.id, "REJECTED", rejectReason || undefined);
                setRejectModal(null);
                setRejectReason("");
              }}>
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
