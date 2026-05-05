import { Timeline, Card } from 'antd';

type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
};

type Props = {
  items: TimelineItem[];
  title?: string;
};

export default function TimelineWidget({ items, title }: Props) {
  return (
    <Card title={title || 'Timeline'}>
      <Timeline
        items={items.map((it) => ({
          key: it.id,
          content: (
            <div className="space-y-1.5">
              <div style={{ fontWeight: 600 }}>{it.title}</div>
              {it.description && <div style={{ color: '#666' }}>{it.description}</div>}
              {it.createdAt && <div style={{ color: '#999', fontSize: 12 }}>{it.createdAt}</div>}
            </div>
          ),
        }))}
      />
    </Card>
  );
}
