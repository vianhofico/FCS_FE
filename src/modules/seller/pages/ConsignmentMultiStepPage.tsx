/**
 * Consignment Multi-Step Page (Seller)
 * Create new consignment request with luxury multi-step flow
 */

import { useState } from 'react';
import { App, Form, Input, InputNumber, Typography, Steps, Card, Upload } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CameraOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { http } from '@/shared/api/http';
import { endpoints } from '@/shared/api/endpoints';
import { Button, Badge } from '@/shared/ui';
import { useAuth } from '@/shared/context/AuthContext';

const { Title, Text, Paragraph } = Typography;

export default function ConsignmentMultiStepPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    {
      title: 'Thông tin cơ bản',
      icon: <ShoppingOutlined />,
      description: 'Tên & Mô tả'
    },
    {
      title: 'Hình ảnh thực tế',
      icon: <CameraOutlined />,
      description: 'Chụp chi tiết'
    },
    {
      title: 'Định giá & Phí',
      icon: <DollarOutlined />,
      description: 'Giá kỳ vọng'
    },
    {
      title: 'Xác nhận gửi',
      icon: <SafetyCertificateOutlined />,
      description: 'Hoàn tất'
    }
  ];

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrent(current + 1);
      window.scrollTo(0, 0);
    } catch {
      return;
    }
  };

  const handlePrev = () => {
    setCurrent(current - 1);
    window.scrollTo(0, 0);
  };

  const onFinish = async (values: any) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const formValues = { ...form.getFieldsValue(true), ...values };
      const payload = {
        consignorId: user.id,
        code: `CR-${Date.now()}`,
        status: "SUBMITTED",
        note: [formValues.name, formValues.note].filter(Boolean).join(" - "),
      };

      await http.post(endpoints.consignments, payload);
      message.success('Gửi yêu cầu ký gửi thành công!');
      navigate('/seller/consignments');
    } catch (error) {
      message.error('Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Form.Item
              name="name"
              label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Tên sản phẩm ký gửi</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input placeholder="Ví dụ: Túi Chanel Classic Flap Medium" className="h-14 rounded-2xl border-pink-100" />
            </Form.Item>

            <Form.Item
              name="category"
              label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Danh mục</span>}
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Input placeholder="Túi xách, Giày dép, Trang sức..." className="h-14 rounded-2xl border-pink-100" />
            </Form.Item>

            <Form.Item
              name="note"
              label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Mô tả tình trạng & Ghi chú</span>}
              rules={[{ required: true, message: 'Vui lòng mô tả sản phẩm' }]}
            >
              <Input.TextArea rows={6} placeholder="Mô tả chi tiết về độ mới, các vết trầy xước (nếu có), phụ kiện đi kèm..." className="rounded-2xl border-pink-100 p-4" />
            </Form.Item>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="rounded-[1.75rem] border border-dashed border-pink-200 bg-pink-50/20 p-6 text-center sm:rounded-[2rem] sm:p-10 lg:p-12">
              <Upload
                listType="picture-card"
                multiple
                maxCount={8}
                className="luxury-upload-large"
                beforeUpload={() => false}
              >
                <div className="flex flex-col items-center gap-3">
                  <CameraOutlined className="text-4xl text-primary/40" />
                  <div>
                    <div className="text-sm font-bold text-slate-700">Tải ảnh sản phẩm</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Tối đa 8 ảnh (PNG, JPG)</div>
                  </div>
                </div>
              </Upload>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[
                 { title: "Ảnh chính diện", desc: "Hiển thị toàn bộ sản phẩm" },
                 { title: "Ảnh chi tiết lỗi", desc: "Vết xước, sờn (nếu có)" },
                 { title: "Ảnh tem/nhãn", desc: "Chứng minh nguồn gốc" },
                 { title: "Ảnh phụ kiện", desc: "Hộp, túi vải, thẻ card" }
               ].map((tip, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-pink-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary text-xs font-black">{i+1}</div>
                    <div>
                      <div className="text-xs font-bold text-slate-700">{tip.title}</div>
                      <div className="text-[10px] text-slate-400 italic">{tip.desc}</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Form.Item
              name="price"
              label={<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Giá đề xuất bán (VND)</span>}
              rules={[{ required: true, message: 'Vui lòng nhập giá đề xuất' }]}
            >
              <InputNumber
                className="w-full h-14 rounded-2xl border-pink-100 flex items-center luxury-input-number"
                placeholder="0"
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                suffix="₫"
              />
            </Form.Item>

            <Card className="rounded-3xl border-none bg-primary/5 p-8">
              <div className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary text-xl shadow-sm">
                  <InfoCircleOutlined />
                </div>
                <div className="space-y-4">
                  <div>
                    <Title level={5} className="!m-0 !font-display uppercase tracking-widest text-xs">Cơ cấu hoa hồng Re:Wear</Title>
                    <Paragraph className="mt-2 text-sm text-slate-500 leading-relaxed">
                      Phí dịch vụ ký gửi được tính dựa trên giá trị sản phẩm được bán ra.
                      Mức phí chuẩn là <span className="font-bold text-primary">15%</span> giá trị đơn hàng, bao gồm:
                    </Paragraph>
                  </div>
                  <ul className="space-y-2">
                    {["Kiểm định hàng chính hãng chuyên sâu", "Chụp ảnh studio & Niêm yết sản phẩm", "Bảo quản trong kho tiêu chuẩn cao cấp", "Vận chuyển & Chăm sóc khách hàng"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-600">
                        <CheckCircleOutlined className="text-primary/60" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center py-10">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 text-5xl mb-8">
              <CheckCircleOutlined />
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <Title className="!m-0 !font-display !text-3xl !font-bold uppercase tracking-tight">Sẵn sàng gửi yêu cầu</Title>
              <Paragraph className="text-lg text-slate-400 italic">
                Vui lòng kiểm tra lại tất cả thông tin. Đội ngũ Re:Wear sẽ xem xét yêu cầu của bạn trong vòng 24-48 giờ làm việc.
              </Paragraph>
            </div>

            <div className="mt-10 space-y-6 rounded-[1.75rem] border border-pink-100 bg-white p-5 text-left sm:rounded-[2.5rem] sm:p-8">
               <div className="flex flex-wrap justify-between gap-3 border-b border-pink-50 pb-4">
                 <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sản phẩm</Text>
                 <Text className="font-bold text-slate-800">{form.getFieldValue('name')}</Text>
               </div>
               <div className="flex flex-wrap justify-between gap-3 border-b border-pink-50 pb-4">
                 <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Giá đề xuất</Text>
                 <Text className="font-display text-xl font-black text-primary">{(form.getFieldValue('price') || 0).toLocaleString()}₫</Text>
               </div>
               <div className="flex flex-wrap justify-between gap-3">
                 <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phí dịch vụ ước tính</Text>
                 <Text className="font-bold text-slate-500 italic">~ 15%</Text>
               </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="responsive-page max-w-[1200px]">
      <div className="responsive-toolbar items-start lg:items-end">
        <div className="space-y-4">
          <Title className="page-title uppercase">Ký gửi sản phẩm</Title>
          <Paragraph className="page-subtitle italic">
            Chia sẻ những tuyệt tác thời trang của bạn với cộng đồng yêu cái đẹp. Quy trình minh bạch và chuyên nghiệp.
          </Paragraph>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/seller/consignments')}
          className="h-12 w-full rounded-xl border-pink-100 px-6 font-bold text-slate-400 hover:border-primary sm:w-auto"
        >
          HỦY BỎ
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="rounded-[1.5rem] border border-pink-100/50 bg-white/70 p-4 sm:rounded-[2rem] sm:p-5 lg:sticky lg:top-32 lg:border-none lg:bg-transparent lg:p-0">
            <Steps
              responsive
              orientation="vertical"
              current={current}
              className="luxury-steps"
              items={steps.map(s => ({
                title: <span className="font-display text-xs font-black uppercase tracking-widest">{s.title}</span>,
                content: <span className="text-[10px] font-medium text-slate-400 italic">{s.description}</span>,
                icon: s.icon
              }))}
            />
          </div>
        </div>

        <div className="lg:col-span-8">
          <Card className="responsive-card flex min-h-[520px] flex-col border-pink-100/40 p-1 shadow-luxury sm:min-h-[560px] sm:p-4 lg:p-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
              className="flex-1"
            >
              <div className="mb-10">
                 <Badge status={current === 3 ? "Verified" : "Pending"}>BƯỚC {current + 1} / 4</Badge>
              </div>

              {renderStepContent()}

              <div className="mt-12 flex flex-col gap-4 border-t border-pink-50 pt-6 sm:mt-16 sm:flex-row sm:pt-8">
                {current > 0 && (
                  <Button
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={handlePrev}
                    className="h-14 rounded-2xl border-pink-100 px-8 font-bold text-slate-400"
                  >
                    QUAY LẠI
                  </Button>
                )}
                {current < steps.length - 1 ? (
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={handleNext}
                    className="h-14 rounded-2xl font-black shadow-luxury tracking-widest text-sm"
                  >
                    TIẾP THEO <ArrowRightOutlined />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    loading={isSubmitting}
                    className="h-14 rounded-2xl font-black shadow-luxury tracking-widest text-sm"
                  >
                    GỬI YÊU CẦU KÝ GỬI
                  </Button>
                )}
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
