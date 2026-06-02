import iconArrowRight from '@phosphor-icons/core/regular/arrow-right.svg';
import { Link, type LinkProps } from '@tanstack/react-router';
import clsx from 'clsx';
import React, { useMemo } from 'react';

import IconButton from '@/components/ui/icon-button';

import Icon from './icon';

type IWidget = {
  /** Widget title text. */
  title?: React.ReactNode;
  /** URL to the svg icon for the widget action. */
  actionIcon?: string;
  /** Text for the action. */
  actionTitle?: string;
  action?: React.JSX.Element;
  children?: React.ReactNode;
  className?: string;
} & (
  | {
      /** Callback when the widget action is clicked. */
      onActionClick?: () => void;
    }
  | LinkProps
);

/** Sidebar widget. */
const Widget: React.FC<IWidget> = ({
  title,
  children,
  actionIcon = iconArrowRight,
  actionTitle,
  action,
  className,
  ...props
}): React.JSX.Element => {
  const widgetId = useMemo(() => crypto.randomUUID(), []);

  return (
    <div className={clsx('widget', className)} aria-labelledby={`widget-header-${widgetId}`}>
      {(title ?? action ?? ('onActionClick' in props || 'to' in props)) && (
        <div className='widget__header'>
          {title && <h1 id={`widget-header-${widgetId}`}>{title}</h1>}
          {action ??
            ('onActionClick' in props ? (
              <IconButton
                className='widget__icon'
                src={actionIcon}
                onClick={props.onActionClick}
                title={actionTitle}
              />
            ) : (
              'to' in props && (
                <Link className='widget__icon' title={actionTitle} {...props}>
                  <Icon src={actionIcon} aria-hidden />
                </Link>
              )
            ))}
        </div>
      )}
      <div className='widget__body'>{children}</div>
    </div>
  );
};

export { Widget as default };
