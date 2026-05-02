import { useState } from 'react';
import { Card, Rate, Input, Typography, message } from 'antd';
import { StarFilled, ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { http } from '@/shared/api/http';
import { endpoints } from '@/shared/api/endpoints';
import { Button } from '@/shared/ui';

const { Title, Text } = Typography;

type Props = {
  productId: string;
};

export default function ReviewSubmitPage({ productId }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!comment.trim()) {
      message.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      await http.post(`${endpoints.products}/${productId}/reviews`, { rating, comment });
      message.success('Cảm ơn bạn đã gửi đánh giá!');
    } catch {
      message.error('Gửi đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[800px] space-y-10 py-10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Text className="font-display text-sm font-bold uppercase tracking-[0.25em] text-primary/70">Phản hồi</Text>
          <div className="h-px flex-1 bg-pink-100/50" />
        </div>
        <Title className="!m-0 !font-display !text-4xl !font-bold uppercase tracking-tight text-text-dark">Đánh giá sản phẩm</Title>
      </div>

      <Card className="rounded-[2.5rem] border-pink-100/40 bg-white p-8 shadow-luxury">
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4 text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary text-3xl">
               <StarFilled className="text-yellow-400" />
             </div>
             <div>
               <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bạn cảm thấy sản phẩm thế nào?</div>
               <Rate
                 value={rating}
                 onChange={(v) => setRating(v)}
                 className="mt-2 !text-4xl !text-yellow-400"
               />
             </div>
          </div>

          <div className="space-y-2">
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-light/70 ml-1">Cảm nhận của bạn</Text>
            <Input.TextArea
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              className="rounded-2xl border-pink-100 p-6 text-lg focus:border-primary transition-soft"
            />
          </div>

          <div className="pt-4 space-y-4">
            <Button
              type="primary"
              size="large"
              block
              onClick={submit}
              loading={submitting}
              className="h-16 rounded-2xl font-black shadow-luxury text-lg"
            >
              GỬI ĐÁNH GIÁ NGAY
            </Button>
            <Button
              block
              type="text"
              icon={<ArrowLeftOutlined />}
              className="font-bold text-slate-400 hover:text-primary"
            >
              Quay lại sau
            </Button>
          </div>
        </div>
      </Card>

      <div className="rounded-[2rem] border border-pink-100/50 bg-white/40 p-8 text-center backdrop-blur-sm">
         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary text-xl">
           <ShoppingCartOutlined />
         </div>
         <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Ý kiến của bạn giúp Re:Wear hoàn thiện hơn mỗi ngày</div>
      </div>
    </div>
  );
}
