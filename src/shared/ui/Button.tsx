import React from 'react';
import { Button as AntButton } from 'antd';

type Props = React.ComponentProps<typeof AntButton>;

export const Button: React.FC<Props> = ({ children, className = '', ...props }) => (
  <AntButton className={`${className} inline-flex h-auto items-center justify-center gap-2.5 rounded-xl px-7 py-3 font-bold uppercase leading-snug tracking-wider`} {...props}>
    {children}
  </AntButton>
);

export default Button;
