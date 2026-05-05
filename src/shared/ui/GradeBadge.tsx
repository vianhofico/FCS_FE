import React from 'react';
import { Tag } from 'antd';

type Props = { grade?: string };

export const GradeBadge: React.FC<Props> = ({ grade }) => {
  const configs: Record<string, { color: string; label: string }> = {
    S: { color: '#f472b6', label: 'Hạng S • Hoàn hảo' },
    A: { color: '#fb923c', label: 'Hạng A • Rất tốt' },
    B: { color: '#60a5fa', label: 'Hạng B • Tốt' },
    C: { color: '#9ca3af', label: 'Hạng C • Trung bình' },
  };

  const config = (grade && configs[grade]) || configs.S;

  return (
    <Tag
      style={{ backgroundColor: config.color, color: '#fff', fontSize: 10, fontWeight: 700, border: 'none' }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 leading-5"
      title={config.label}
    >
      {grade}
    </Tag>
  );
};

export default GradeBadge;
