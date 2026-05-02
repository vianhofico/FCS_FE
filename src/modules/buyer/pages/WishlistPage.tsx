import { useEffect, useState } from 'react';
import { Card, List, Button, Spin } from 'antd';
import { http } from '@/shared/api/http';
import { API_PREFIX } from '@/shared/api/endpoints';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await http.get(`${API_PREFIX}/wishlist`);
        setItems(res.data?.data || []);
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card title="Wishlist">
      <Spin spinning={loading}>
        <List dataSource={items} renderItem={(item) => <List.Item>{JSON.stringify(item)}</List.Item>} />
      </Spin>
      <div style={{ marginTop: 12 }}>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    </Card>
  );
}
