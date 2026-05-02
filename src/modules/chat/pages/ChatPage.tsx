import { Card, List, Input, Button } from "antd";
import { useEffect, useState } from 'react';
import { useStompClient } from '../hooks/useStompClient';

export default function ChatPage() {
  const client = useStompClient('/ws');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const unsub = client.subscribe((d) => {
      setMessages((m) => [...m, d]);
    });
    return unsub;
  }, [client]);

  return (
    <Card title="Chat">
      <List bordered dataSource={messages} renderItem={(item) => <List.Item>{JSON.stringify(item)}</List.Item>} />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <Input placeholder="Type a message" />
        <Button type="primary">Send</Button>
      </div>
    </Card>
  );
}
