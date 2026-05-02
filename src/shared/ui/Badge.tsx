import React from 'react';
import { Tag } from 'antd';

const STATUS_COLORS: Record<string, string> = {
  Active: 'success',
  Inactive: 'default',
  Verified: 'success',
  Pending: 'warning',
  Suspended: 'error',
  Enabled: 'success',
  Disabled: 'error',
  Listed: 'success',
  Sold: 'pink',
  Returned: 'warning',
  Rejected: 'error',
  Submitted: 'default',
  OnlineReview: 'processing',
  PhysicalCheck: 'processing',
  PricingNegotiation: 'warning',
};

const STATUS_LABELS: Record<string, string> = {
  Active: 'Hoạt động',
  Inactive: 'Tạm ngưng',
  Verified: 'Đã xác minh',
  Pending: 'Chờ duyệt',
  Suspended: 'Bị khóa',
  Enabled: 'Đang bật',
  Disabled: 'Đã tắt',
  Listed: 'Niêm yết',
  Sold: 'Đã bán',
  Returned: 'Hoàn trả',
  Rejected: 'Từ chối',
  Submitted: 'Đã gửi',
  OnlineReview: 'Đang duyệt',
  PhysicalCheck: 'Kiểm định',
  PricingNegotiation: 'Thương lượng giá',
};

type Props = {
  status?: string;
  children?: React.ReactNode;
};

export const Badge: React.FC<Props> = ({ status, children }) => {
  const color = (status && STATUS_COLORS[status]) || 'default';
  const label = (status && STATUS_LABELS[status]) || (typeof children === 'string' ? children : undefined);
  return (
    <Tag color={color} className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider border-0">
      {label || children}
    </Tag>
  );
};

export default Badge;
