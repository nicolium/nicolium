import clsx from 'clsx';
import React from 'react';

interface IIndicator {
  state?: 'active' | 'pending' | 'error' | 'inactive';
  size?: 'sm';
}

/** Indicator dot component. */
const Indicator: React.FC<IIndicator> = ({ state = 'inactive', size = 'sm' }) => (
  <div className={clsx('indicator', `indicator--${size}`, `indicator--${state}`)} />
);

export { Indicator as default };
