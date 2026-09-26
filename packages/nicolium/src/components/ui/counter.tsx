import clsx from 'clsx';
import React from 'react';

import AnimatedNumber from '@/components/animated-number';

interface ICounter {
  className?: string;
  /** Number this counter should display. */
  count: number;
  /** Optional max number (ie: N+) */
  countMax?: number;
}

/** A simple counter for notifications, etc. */
const Counter: React.FC<ICounter> = ({ className, count, countMax }) => (
  <span className={clsx(className, 'counter')}>
    <AnimatedNumber value={count} max={countMax} />
  </span>
);

export { Counter as default };
