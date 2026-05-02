import { useState } from 'react';
import { Card, Rate, Input, Button, message } from 'antd';
import { http } from '@/shared/api/http';
import { endpoints } from '@/shared/api/endpoints';

type Props = {
  productId: string;
};

export default function ReviewSubmitPage({ productId }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submit = async () => {
    try {
      await http.post(`${endpoints.products}/${productId}/reviews`, { rating, comment });
      message.success('Review submitted');
    } catch {
      message.error('Submit failed');
    }
  };

  return (
    <Card title="Submit Review">
      <Rate value={rating} onChange={(v) => setRating(v)} />
      <Input.TextArea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} style={{ marginTop: 12 }} />
      <div style={{ marginTop: 12 }}>
        <Button type="primary" onClick={submit}>Submit</Button>
      </div>
    </Card>
  );
}
