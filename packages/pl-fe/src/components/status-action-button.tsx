import clsx from 'clsx';
import React from 'react';

import Icon from '@/components/ui/icon';
import Text from '@/components/ui/text';
import { useLongPress } from '@/hooks/use-long-press';
import { useSettings } from '@/stores/settings';

import AnimatedNumber from './animated-number';

interface IStatusActionCounter {
  count: number;
}

/** Action button numerical counter, eg "5" likes. */
const StatusActionCounter: React.FC<IStatusActionCounter> = React.memo(({ count = 0 }): JSX.Element => {
  const { demetricator } = useSettings();

  return (
    <Text size='xs' weight='semibold' theme='inherit'>
      <AnimatedNumber value={count} obfuscate={demetricator} short />
    </Text>
  );
});

interface IStatusActionButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconClassName?: string;
  icon: string;
  filledIcon?: string;
  count?: number;
  active?: boolean;
  text?: React.ReactNode;
  onLongPress?: (event: React.MouseEvent | React.TouchEvent) => void;
}

const StatusActionButton = React.forwardRef<HTMLButtonElement, IStatusActionButton>((props, ref): JSX.Element => {
  const { icon, filledIcon, className, iconClassName, active, count = 0, text, onLongPress, ...filteredProps } = props;

  const longPressBind = useLongPress((e) => {
    if (!onLongPress || e.type !== 'touchstart') return;

    e.stopPropagation();

    if ('vibrate' in navigator) navigator.vibrate(1);
    onLongPress(e);
  });

  const renderIcon = () => {
    return (
      <Icon
        src={active && filledIcon ? filledIcon : icon}
        className={iconClassName}
        aria-hidden
      />
    );
  };

  const renderText = () => {
    if (text) {
      return (
        <span className='⁂-status-action-bar__button__text'>
          {text}
        </span>
      );
    } else if (count) {
      return (
        <StatusActionCounter count={count} />
      );
    }
  };

  return (
    <button
      ref={ref}
      type='button'
      className={clsx(
        '⁂-status-action-bar__button',
        {
          '⁂-status-action-bar__button--active': active,
        },
        className,
      )}
      {...longPressBind}
      {...filteredProps}
    >
      {renderIcon()}
      {renderText()}
    </button>
  );
});

export { StatusActionButton as default };
