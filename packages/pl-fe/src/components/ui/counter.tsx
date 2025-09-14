import React from 'react';

import AnimatedNumber from 'pl-fe/components/animated-number';

interface ICounter {
  /** Number this counter should display. */
  count: number;
  /** Optional max number (ie: N+) */
  countMax?: number;
}

/** A simple counter for notifications, etc. */
const Counter: React.FC<ICounter> = ({ count, countMax }) => (
  <span className='⁂-counter'>
    <AnimatedNumber value={count} max={countMax} />
  </span>
);

export { Counter as default };
