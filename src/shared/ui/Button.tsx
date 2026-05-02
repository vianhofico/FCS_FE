import React from 'react';
import { Button as AntButton } from 'antd';

type Props = React.ComponentProps<typeof AntButton>;

export const Button: React.FC<Props> = ({ children, className = '', ...props }) => (
  <AntButton className={`${className} rounded-2xl font-bold uppercase tracking-wider h-auto py-3 px-8`} {...props}>
    {children}
  </AntButton>
);

export default Button;
