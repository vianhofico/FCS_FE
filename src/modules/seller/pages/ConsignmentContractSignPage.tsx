/**
 * Consignment Contract Signing Page (Seller)
 * Review and sign the consignment agreement with E-sign integration
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Divider, message, Spin, Checkbox } from 'antd';
import {
  SafetyCertificateOutlined,
  FileProtectOutlined,
  ArrowLeftOutlined,
  SignatureOutlined,
  DownloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { consignmentApi } from '../api/consignmentApi';
import type { ConsignmentRequestDetail } from '@/shared/contracts/consignmentContract';
import { Button, Badge } from '@/shared/ui';
import { useAuth } from '@/shared/context/AuthContext';

const { Title, Text, Paragraph } = Typography;

export default function ConsignmentContractSignPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSigning, setIsSigning] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<ConsignmentRequestDetail | null>(null);

  useEffect(() => {
    if (!requestId) return;
    const fetchDetail = async () => {
      try {
        const res = await consignmentApi.getConsignmentDetail(requestId);
        if (res.success) {
          setRequest(res.data || null);
        }
      } catch (err) {
        message.error("Không thể tải thông tin hợp đồng");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [requestId]);

  const handleSign = async () => {
    if (!isAgreed) {
      message.warning("Vui lòng đồng ý với các điều khoản trước khi ký");
      return;
    }

    setIsSigning(true);
    try {
      // Simulation of E-signing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success("Hợp đồng đã được ký kết thành công!");
      navigate(`/seller/consignments/${requestId}`);
    } catch (err) {
      message.error("Lỗi trong quá trình ký hợp đồng");
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Spin size="large" /></div>;

  if (!request || !request.contract) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <Title level={3}>Không tìm thấy thông tin hợp đồng</Title>
        <Button onClick={() => navigate('/seller/consignments')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const contract = request.contract;

  return (
    <div className="mx-auto max-w-[1200px] space-y-12 pb-20">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge status="Pending">HỢP ĐỒNG DỰ THẢO</Badge>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã: #{contract.id.slice(-8).toUpperCase()}</Text>
          </div>
          <Title className="!m-0 !font-display !text-4xl !font-bold !leading-tight !tracking-tight md:!text-6xl uppercase">Ký hợp đồng ký gửi</Title>
          <Paragraph className="max-w-lg text-lg font-medium text-slate-400 opacity-80 italic">
            Vui lòng xem kỹ các điều khoản thỏa thuận và mức phí hoa hồng trước khi thực hiện ký kết điện tử.
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

      <Row gutter={[48, 48]}>
        <Col xs={24} lg={16}>
          <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-12 shadow-luxury overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] flex items-center justify-center pl-6 pb-6">
              <FileProtectOutlined className="text-4xl text-primary/20" />
            </div>

            <div className="space-y-12">
              <div className="text-center">
                <Title level={3} className="!font-display uppercase tracking-widest text-slate-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Title>
                <Text className="font-bold text-slate-600">Độc lập - Tự do - Hạnh phúc</Text>
                <Divider className="border-slate-100 my-8">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Hợp đồng dịch vụ ký gửi thời trang</Text>
                </Divider>
              </div>

              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <Title level={5} className="!m-0 !font-display uppercase tracking-wider text-sm">ĐIỀU 1: CÁC BÊN GIAO KẾT</Title>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Bên ký gửi (Bên A)</Text>
                    <div className="font-bold text-slate-800">{user?.username}</div>
                    <div className="text-slate-500">Email: {user?.email}</div>
                    <div className="text-slate-500">SĐT: {user?.phone}</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-primary/40 block mb-2">Bên nhận ký gửi (Bên B)</Text>
                    <div className="font-bold text-primary">RE:WEAR LUXURY CONSIGNMENT</div>
                    <div className="text-slate-500">MST: 010123456789</div>
                    <div className="text-slate-500">Địa chỉ: Quận 1, TP. Hồ Chí Minh</div>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <Title level={5} className="!m-0 !font-display uppercase tracking-wider text-sm">ĐIỀU 2: CHI TIẾT KÝ GỬI & PHÍ DỊCH VỤ</Title>
                </div>
                <div className="p-8 rounded-[2rem] border border-pink-100 bg-white">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Text className="text-slate-500 font-medium">Mã yêu cầu:</Text>
                      <Text className="font-bold text-slate-800">{request.code}</Text>
                    </div>
                    <div className="flex justify-between items-center">
                      <Text className="text-slate-500 font-medium">Giá trị hàng hóa ước tính:</Text>
                      <Text className="font-display text-xl font-black text-slate-800">{(contract.agreedPrice || 0).toLocaleString()}₫</Text>
                    </div>
                    <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="flex items-center gap-2">
                         <SafetyCertificateOutlined className="text-emerald-500" />
                         <Text className="text-emerald-700 font-bold">Mức phí hoa hồng (Commission):</Text>
                      </div>
                      <Text className="text-2xl font-black text-emerald-600">{contract.commissionRate ?? 15}%</Text>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <Title level={5} className="!m-0 !font-display uppercase tracking-wider text-sm">ĐIỀU 3: ĐIỀU KHOẢN CHUNG</Title>
                </div>
                <div className="text-xs text-slate-400 space-y-3 leading-loose italic">
                  <p>1. Bên B có trách nhiệm bảo quản hàng hóa trong điều kiện tốt nhất (độ ẩm, nhiệt độ) suốt thời gian ký gửi.</p>
                  <p>2. Bên B cam kết thực hiện kiểm định chính hãng. Trong trường hợp hàng giả, hợp đồng sẽ bị hủy bỏ ngay lập tức.</p>
                  <p>3. Thanh toán cho Bên A sẽ được thực hiện trong vòng 48h kể từ khi người mua nhận hàng và không có khiếu nại.</p>
                </div>
              </section>

              <div className="pt-8 border-t border-slate-100 text-center">
                 <Text className="text-[10px] font-bold text-slate-300 italic">Văn bản này có giá trị pháp lý tương đương bản giấy sau khi được ký điện tử tại hệ thống Re:Wear</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <div className="sticky top-32 space-y-8">
            <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-luxury">
              <div className="text-center space-y-6">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/5 text-primary text-3xl">
                  <SignatureOutlined />
                </div>
                <div>
                  <Title level={4} className="!m-0 !font-display uppercase tracking-tight">Xác nhận ký tên</Title>
                  <Paragraph className="mt-2 text-sm text-slate-400">
                    Sử dụng chữ ký số được định danh qua tài khoản của bạn.
                  </Paragraph>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 text-left border border-slate-100">
                  <Checkbox
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="luxury-checkbox align-top"
                  >
                    <span className="text-xs font-medium text-slate-600 leading-relaxed">
                      Tôi đã đọc, hiểu rõ và đồng ý với tất cả các điều khoản nêu trong hợp đồng dịch vụ ký gửi này.
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
                  disabled={!isAgreed}
                  className="h-16 rounded-2xl font-black shadow-luxury text-lg tracking-widest uppercase"
                >
                  KÝ HỢP ĐỒNG NGAY
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <InfoCircleOutlined /> Bảo mật bởi E-Sign Global
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-blue-100 bg-blue-50/30 p-8 text-center backdrop-blur-md">
               <div className="space-y-4">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Tiện ích bổ sung</div>
                 <Button block size="large" icon={<DownloadOutlined />} className="rounded-xl font-bold border-blue-200 text-blue-600">
                   TẢI BẢN DỰ THẢO (PDF)
                 </Button>
                 <Text className="text-[10px] text-blue-400/60 italic block">Bạn có thể tải về để lưu trữ cá nhân trước khi ký</Text>
               </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
