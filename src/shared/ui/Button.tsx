import React from 'react';
import { Button as AntButton } from 'antd';

type Props = React.ComponentProps<typeof AntButton>;

export const Button: React.FC<Props> = ({ children, className = '', ...props }) => (
  <AntButton className={`${className} rounded-xl font-bold uppercase tracking-wider h-auto py-2.5 px-7`} {...props}>
    {children}
  </AntButton>
);

export default Button;
