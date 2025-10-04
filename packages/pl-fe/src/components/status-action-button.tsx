import clsx from 'clsx';
import React from 'react';

import Icon from 'pl-fe/components/ui/icon';
import Text from 'pl-fe/components/ui/text';
import { useLongPress } from 'pl-fe/hooks/use-long-press';
import { useSettings } from 'pl-fe/hooks/use-settings';

import AnimatedNumber from './animated-number';

const COLORS = {
  accent: 'accent',
  success: 'success',
};

type Color = keyof typeof COLORS;

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
  color?: Color;
  text?: React.ReactNode;
  theme?: 'default' | 'inverse';
  onLongPress?: (event: React.MouseEvent | React.TouchEvent) => void;
}

const StatusActionButton = React.forwardRef<HTMLButtonElement, IStatusActionButton>((props, ref): JSX.Element => {
  const { icon, filledIcon, className, iconClassName, active, color, count = 0, text, theme = 'default', onLongPress, ...filteredProps } = props;

  const longPressBind = useLongPress((e) => {
    if (!onLongPress || e.type !== 'touchstart') return;

    e.stopPropagation();

    if ('vibrate' in navigator) navigator.vibrate(1);
    onLongPress(e);
  });

  const renderIcon = () => {
    return (
      <Icon
        src={active && filledIcon || icon}
        className={iconClassName}
      />
    );
  };

  const renderText = () => {
    if (text) {
      return (
        <Text tag='span' theme='inherit' size='sm'>
          {text}
        </Text>
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
        '-m-1 flex items-center rounded-full p-2 rtl:space-x-reverse',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-offset-0',
        {
          'text-gray-600 hover:text-gray-800 dark:hover:text-white bg-transparent hover:bg-primary-100 dark:hover:bg-primary-800 black:hover:bg-gray-800': theme === 'default',
          'text-white/80 hover:text-white bg-transparent dark:bg-transparent': theme === 'inverse',
          'hover:text-gray-600 dark:hover:text-white': !filteredProps.disabled,
          'text-accent-300 hover:text-accent-300 dark:hover:text-accent-300': active && color === COLORS.accent,
          'text-success-600 dark:text-success-400 hover:text-success-600 dark:hover:text-success-400': active && color === COLORS.success,
          'space-x-1': !text,
          'space-x-2': text,
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
