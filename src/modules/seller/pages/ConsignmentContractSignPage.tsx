/**
 * Consignment Contract Signing Page (Seller)
 * Load contract and sign it digitally
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Row, Col, Typography, Divider, Spin, Checkbox, Input, App } from "antd";
import {
  SafetyCertificateOutlined,
  FileProtectOutlined,
  ArrowLeftOutlined,
  SignatureOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { consignmentApi } from "../api/consignmentApi";
import type { ConsignmentContract } from "@/shared/contracts/consignmentContract";
import { Button, Badge } from "@/shared/ui";
import { useAuth } from "@/shared/context/AuthContext";

const { Title, Text, Paragraph } = Typography;

export default function ConsignmentContractSignPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = App.useApp();

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ConsignmentContract | null>(null);
  const [requestCode, setRequestCode] = useState("");

  const [isSigning, setIsSigning] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState(user?.fullName || user?.username || "");

  useEffect(() => {
    if (!requestId) return;
    (async () => {
      try {
        const [detailRes, contractRes] = await Promise.allSettled([
          consignmentApi.getConsignmentDetail(requestId),
          consignmentApi.getContractByRequest(requestId),
        ]);
        if (detailRes.status === "fulfilled" && detailRes.value.success) {
          setRequestCode(detailRes.value.data?.code ?? "");
        }
        if (contractRes.status === "fulfilled" && contractRes.value.success) {
          setContract(contractRes.value.data);
        }
      } catch {
        message.error("Không thể tải thông tin hợp đồng");
      } finally {
        setLoading(false);
      }
    })();
  }, [requestId]);

  const handleSign = async () => {
    if (!contract || !isAgreed) return;
    if (!signatureName.trim()) {
      message.warning("Vui lòng nhập tên người ký");
      return;
    }
    setIsSigning(true);
    try {
      const res = await consignmentApi.signContract(contract.id, {
        acceptedTerms: true,
        signatureName: signatureName.trim(),
      });
      if (res.success) {
        message.success("Hợp đồng đã được ký thành công!");
        setContract(res.data);
      }
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Ký hợp đồng thất bại");
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center space-y-4">
        <Title level={3}>Không tìm thấy hợp đồng</Title>
        <Paragraph className="text-slate-400">
          Hợp đồng chưa được tạo. Vui lòng liên hệ manager hoặc kiểm tra lại sau.
        </Paragraph>
        <Button onClick={() => navigate("/seller/consignments")}>Quay lại danh sách</Button>
      </div>
    );
  }

  // Already signed
  if (contract.status === "SIGNED") {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center space-y-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 text-5xl">
          <CheckCircleOutlined />
        </div>
        <Title level={3} className="!font-display uppercase">Hợp đồng đã ký</Title>
        <Paragraph className="text-slate-400">
          Hợp đồng này đã được ký bởi <strong>{contract.signedByName}</strong> lúc{" "}
          {contract.signedAt ? new Date(contract.signedAt).toLocaleString("vi-VN") : "—"}.
        </Paragraph>
        <Button
          type="primary"
          onClick={() => navigate(`/seller/consignments/${requestId}`)}
        >
          Xem chi tiết ký gửi
        </Button>
      </div>
    );
  }

  const commissionPct = contract.commissionRate != null
    ? (Number(contract.commissionRate) * 100).toFixed(0)
    : "15";

  return (
    <div className="mx-auto max-w-[1200px] space-y-14 pb-28">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <Badge status="Pending">HỢP ĐỒNG DỰ THẢO</Badge>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              #{contract.id.slice(-8).toUpperCase()}
            </Text>
          </div>
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-5xl uppercase">
            Ký hợp đồng ký gửi
          </Title>
          <Paragraph className="max-w-lg text-base font-medium text-slate-400 italic">
            Vui lòng đọc kỹ các điều khoản trước khi ký kết điện tử.
          </Paragraph>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="rounded-xl border-pink-100 text-slate-400 font-bold hover:border-primary h-12 px-6"
        >
          QUAY LẠI
        </Button>
      </div>

      <Row gutter={[48, 32]}>
        {/* Contract content */}
        <Col xs={24} lg={16}>
          <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 lg:p-12 shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-bl-[80px] flex items-center justify-center pl-4 pb-4">
              <FileProtectOutlined className="text-3xl text-primary/20" />
            </div>

            <div className="space-y-10">
              <div className="text-center">
                <Title level={4} className="!font-display uppercase tracking-widest !text-slate-800">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </Title>
                <Text className="font-bold text-slate-600">Độc lập - Tự do - Hạnh phúc</Text>
                <Divider className="border-slate-100 my-6">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">
                    Hợp đồng dịch vụ ký gửi thời trang
                  </Text>
                </Divider>
              </div>

              {/* Party info */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <Title level={5} className="!m-0 !font-display uppercase tracking-wider text-sm">
                    ĐIỀU 1: CÁC BÊN GIAO KẾT
                  </Title>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-relaxed">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
                      Bên ký gửi (Bên A)
                    </Text>
                    <div className="font-bold text-slate-800">{user?.fullName || user?.username}</div>
                    <div className="text-slate-500 text-xs">Email: {user?.email}</div>
                  </div>
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-primary/40 block mb-2">
                      Bên nhận ký gửi (Bên B)
                    </Text>
                    <div className="font-bold text-primary">RE:WEAR LUXURY CONSIGNMENT</div>
                    <div className="text-slate-500 text-xs">Địa chỉ: TP. Hồ Chí Minh</div>
                  </div>
                </div>
              </section>

              {/* Contract terms */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <Title level={5} className="!m-0 !font-display uppercase tracking-wider text-sm">
                    ĐIỀU 2: CHI TIẾT KÝ GỬI & PHÍ DỊCH VỤ
                  </Title>
                </div>
                <div className="p-6 rounded-[1.5rem] border border-pink-100 bg-white space-y-4">
                  <div className="flex justify-between items-center">
                    <Text className="text-slate-500 font-medium text-sm">Mã yêu cầu:</Text>
                    <Text className="font-bold text-slate-800 font-mono">{requestCode}</Text>
                  </div>
                  {contract.agreedPrice != null && (
                    <div className="flex justify-between items-center">
                      <Text className="text-slate-500 font-medium text-sm">Giá bán đã đồng ý:</Text>
                      <Text className="font-display text-xl font-black text-slate-800">
                        {Number(contract.agreedPrice).toLocaleString("vi-VN")}₫
                      </Text>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <SafetyCertificateOutlined className="text-emerald-500" />
                      <Text className="text-emerald-700 font-bold text-sm">Phí hoa hồng:</Text>
                    </div>
                    <Text className="text-2xl font-black text-emerald-600">{commissionPct}%</Text>
                  </div>
                </div>
              </section>

              {/* General terms */}
              <section className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <Title level={5} className="!m-0 !font-display uppercase tracking-wider text-sm">
                    ĐIỀU 3: ĐIỀU KHOẢN CHUNG
                  </Title>
                </div>
                <div className="text-xs text-slate-400 space-y-2 leading-loose italic">
                  <p>1. Bên B bảo quản hàng hóa trong điều kiện tốt nhất suốt thời gian ký gửi.</p>
                  <p>2. Bên B cam kết kiểm định chính hãng. Hàng giả sẽ bị hủy hợp đồng ngay.</p>
                  <p>3. Thanh toán trong 48h sau khi người mua nhận hàng và không có khiếu nại.</p>
                  <p>4. Hợp đồng có hiệu lực đến ngày:{" "}
                    {contract.validUntil
                      ? new Date(contract.validUntil).toLocaleDateString("vi-VN")
                      : "1 năm kể từ ngày ký"}.
                  </p>
                </div>
              </section>

              <div className="pt-6 border-t border-slate-100 text-center">
                <Text className="text-[10px] font-bold text-slate-300 italic">
                  Văn bản này có giá trị pháp lý tương đương bản giấy sau khi ký điện tử tại hệ thống Re:Wear.
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Signing panel */}
        <Col xs={24} lg={8}>
          <div className="sticky top-32 space-y-6">
            <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-luxury">
              <div className="text-center space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 text-primary text-3xl">
                  <SignatureOutlined />
                </div>
                <div>
                  <Title level={4} className="!m-0 !font-display uppercase tracking-tight">
                    Xác nhận ký tên
                  </Title>
                  <Paragraph className="mt-2 text-sm text-slate-400">
                    Chữ ký được ghi nhận qua tài khoản đã đăng nhập.
                  </Paragraph>
                </div>

                <div className="space-y-2 text-left">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Họ và tên người ký *
                  </Text>
                  <Input
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Nhập họ tên đầy đủ"
                    className="h-12 rounded-2xl border-pink-100 font-bold"
                  />
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 text-left border border-slate-100">
                  <Checkbox
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                  >
                    <span className="text-xs font-medium text-slate-600 leading-relaxed">
                      Tôi đã đọc, hiểu rõ và đồng ý với tất cả các điều khoản trong hợp đồng này.
                    </span>
                  </Checkbox>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<SignatureOutlined />}
                  onClick={handleSign}
                  loading={isSigning}
                  disabled={!isAgreed || !signatureName.trim()}
                  className="h-16 rounded-2xl font-black shadow-luxury text-lg tracking-widest uppercase"
                >
                  KÝ HỢP ĐỒNG NGAY
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <InfoCircleOutlined /> Bảo mật E-Sign
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
