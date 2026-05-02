import { useEffect, useState } from 'react';
import { Card, List, Button, Spin } from 'antd';
import { http } from '@/shared/api/http';
import { endpoints } from '@/shared/api/endpoints';

type AddressItem = {
  fullAddress?: string;
};

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await http.get(`${endpoints.iamUsers}/addresses`);
        setAddresses(res.data?.data || []);
      } catch {
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card title="Address Book">
      <Button type="primary" style={{ marginBottom: 12 }}>Add Address</Button>
      <Spin spinning={loading}>
        <List dataSource={addresses} renderItem={(a) => <List.Item>{a.fullAddress || 'No address'}</List.Item>} />
      </Spin>
    </Card>
  );
}
