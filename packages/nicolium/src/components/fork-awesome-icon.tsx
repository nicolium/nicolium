/**
 * ForkAwesomeIcon: renders a ForkAwesome icon.
 * Full list: https://forkaweso.me/Fork-Awesome/icons/
 * @module @/components/fork_awesome_icon
 * @see @/components/icon
 */

import clsx from 'clsx';
import React from 'react';

import 'line-awesome/dist/font-awesome-line-awesome/css/all.css';

interface IForkAwesomeIcon extends React.HTMLAttributes<HTMLLIElement> {
  id: string;
  className?: string;
  fixedWidth?: boolean;
}

const ForkAwesomeIcon: React.FC<IForkAwesomeIcon> = ({ id, className, fixedWidth, ...rest }) => (
  <i
    role='img'
    // alt={alt}
    className={clsx('fa', `fa-${id}`, className, { 'fa-fw': fixedWidth })}
    {...rest}
  />
);

export { ForkAwesomeIcon as default };
