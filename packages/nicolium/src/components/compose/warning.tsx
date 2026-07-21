import { animated, useSpring } from '@react-spring/web';
import clsx from 'clsx';
import React from 'react';

import { useSettings } from '@/stores/settings';

interface IWarning {
  message: React.ReactNode;
  animated?: boolean;
  className?: string;
}

/** Warning message displayed in ComposeForm. */
const Warning: React.FC<IWarning> = ({
  message,
  animated: animate,
  className: customClassName,
}) => {
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

  const className = clsx('compose-warning', customClassName);

  if (!message) return null;

  if (animate)
    return (
      <animated.div className={className} style={styles}>
        {message}
      </animated.div>
    );

  return <div className={className}>{message}</div>;
};

export { Warning as default };
