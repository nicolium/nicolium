import { animated, useSpring } from '@react-spring/web';
import React from 'react';

import { useSettings } from '@/stores/settings';

interface IWarning {
  message: React.ReactNode;
  animated?: boolean;
}

/** Warning message displayed in ComposeForm. */
const Warning: React.FC<IWarning> = ({ message, animated: animate }) => {
  const { reduceMotion } = useSettings();

  const styles = useSpring({
    from: {
      opacity: 0,
      transform: 'scale(0.85, 0.75)',
    },
    to: {
      opacity: 1,
      transform: 'scale(1, 1)',
    },
    immediate: !animate || reduceMotion,
  });

  const className = 'rounded border border-solid border-gray-400 bg-transparent px-2.5 py-2 text-xs text-gray-900 dark:border-gray-800 dark:text-white';

  if (!message) return null;

  if (animate) return (
    <animated.div className={className} style={styles}>
      {message}
    </animated.div>
  );

  return (
    <div className={className}>
      {message}
    </div>
  );
};

export { Warning as default };
