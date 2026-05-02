import { Card, List, Badge } from 'antd';
import { useEffect, useState } from 'react';
import { notificationApi } from '../api/notificationApi';

export default function NotificationCenterPage() {
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await notificationApi.getNotifications();
        const data = res?.data?.content || [];
        setItems(data);
        setUnread(data.filter((d: any) => !d.read).length);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  return (
    <Card title={<>Notifications <Badge count={unread} /></>}>
      <List dataSource={items} renderItem={(item) => <List.Item>{JSON.stringify(item)}</List.Item>} />
    </Card>
  );
}

