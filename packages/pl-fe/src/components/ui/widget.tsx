import clsx from 'clsx';
import React from 'react';

import IconButton from '@/components/ui/icon-button';

interface IWidget {
  /** Widget title text. */
  title?: React.ReactNode;
  /** Callback when the widget action is clicked. */
  onActionClick?: () => void;
  /** URL to the svg icon for the widget action. */
  actionIcon?: string;
  /** Text for the action. */
  actionTitle?: string;
  action?: JSX.Element;
  children?: React.ReactNode;
  className?: string;
}

/** Sidebar widget. */
const Widget: React.FC<IWidget> = ({
  title,
  children,
  onActionClick,
  actionIcon = require('@phosphor-icons/core/regular/arrow-right.svg'),
  actionTitle,
  action,
  className,
}): JSX.Element => (
  <div className={clsx('⁂-widget', className)}>
    {(title ?? action ?? onActionClick) && (
      <div className='⁂-widget__header'>
        {title && <h1>{title}</h1>}
        {action ??
          (onActionClick && (
            <IconButton
              className='⁂-widget__icon'
              src={actionIcon}
              onClick={onActionClick}
              title={actionTitle}
            />
          ))}
      </div>
    )}
    <div className='⁂-widget__body'>{children}</div>
  </div>
);

export { Widget as default };
