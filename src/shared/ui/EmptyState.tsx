import React from 'react';
import { Empty as AntEmpty, Typography } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

type Props = { title?: string; description?: string; action?: React.ReactNode };

export const EmptyState: React.FC<Props> = ({ title = 'Không có dữ liệu', description = '', action }) => (
  <div className="flex flex-col items-center justify-center p-16 bg-pink-50/50 rounded-[3rem] border border-pink-100 italic text-center">
    <AntEmpty
      image={<ShoppingOutlined style={{ fontSize: 64, color: '#f9a8d4' }} />}
      description={
        <div className="space-y-3 mt-4">
          <Title level={4} className="!m-0 !font-serif !font-bold uppercase tracking-tight !text-gray-800">{title}</Title>
          <Text className="text-gray-400 font-medium opacity-70">{description}</Text>
        </div>
      }
    >
      {action && <div className="mt-8">{action}</div>}
    </AntEmpty>
  </div>
);

export default EmptyState;
