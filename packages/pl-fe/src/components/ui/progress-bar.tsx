import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import React from 'react';

import { useSettings } from '@/stores/settings';

interface IProgressBar {
  /** Number between 0 and 1 to represent the percentage complete. */
  progress: number;
  /** Height of the progress bar. */
  size?: 'sm' | 'md';
}

/** A horizontal meter filled to the given percentage. */
const ProgressBar: React.FC<IProgressBar> = ({ progress, size = 'md' }) => {
  const { reduceMotion } = useSettings();

  const styles = useSpring({
    from: { width: '0%' },
    to: { width: `${progress}%` },
    reset: true,
    immediate: reduceMotion,
  });

  return (
    <div
      className={clsx('h-2.5 w-full overflow-hidden rounded-lg bg-gray-300 dark:bg-primary-800', {
        'h-2.5': size === 'md',
        'h-[6px]': size === 'sm',
      })}
    >
      <animated.div
        className='h-full bg-secondary-500'
        style={styles}
      />
    </div>
  );
};

export { ProgressBar as default };
