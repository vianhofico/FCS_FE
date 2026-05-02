import { Badge, Card, Empty, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi';
import type { Notification } from '@/shared/contracts/notificationContract';

const { Text, Paragraph } = Typography;

export default function NotificationCenterPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await notificationApi.getNotifications();
        const payload = res.data;
        const data = Array.isArray(payload) ? payload : payload?.content || [];
        setItems(data);
        setUnread(data.filter((item) => item.read === false || item.status !== 'READ').length);
      } catch {
        setItems([]);
        setUnread(0);
      }
    })();
  }, []);

  return (
    <Card title={<>Notifications <Badge count={unread} /></>}>
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <Text className="font-bold text-slate-800">{item.title}</Text>
                <Badge status={item.read === false || item.status !== 'READ' ? 'processing' : 'default'} text={item.type || item.status || 'Notification'} />
              </div>
              <Paragraph className="!mb-0 !mt-2 text-slate-500">{item.message ?? item.content}</Paragraph>
            </div>
          ))}
        </div>
      ) : (
        <Empty description="Không có thông báo" />
      )}
    </Card>
  );
}

