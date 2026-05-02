import React from 'react';
import { Rate, Typography } from 'antd';

const { Text } = Typography;

type Props = { rating?: number; count?: number };

export const StarRating: React.FC<Props> = ({ rating = 5, count = 0 }) => (
  <div className="flex items-center gap-2">
    <Rate disabled defaultValue={rating} style={{ fontSize: 12, color: '#f472b6' }} />
    {count > 0 && <Text className="text-[10px] text-gray-400 font-bold">({count})</Text>}
  </div>
);

export default StarRating;
