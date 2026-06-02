import clsx from 'clsx';
import React from 'react';

interface IOutlineBox extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/** Wraps children in a container with an outline. */
const OutlineBox: React.FC<IOutlineBox> = ({ children, className, ...rest }) => (
  <div className={clsx('outline-box', className)} {...rest}>
    {children}
  </div>
);

export { OutlineBox as default };
