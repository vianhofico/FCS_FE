import React from 'react';
import { Button as AntButton } from 'antd';

type Props = React.ComponentProps<typeof AntButton>;

export const Button: React.FC<Props> = ({ children, className = '', ...props }) => (
  <AntButton className={`${className} inline-flex h-auto min-h-10 max-w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-bold leading-snug tracking-wide sm:px-6 sm:py-3`} {...props}>
    {children}
  </AntButton>
);

export default Button;
