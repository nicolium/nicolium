import iconArrowRight from '@phosphor-icons/core/regular/arrow-right.svg';
import clsx from 'clsx';
import React, { useMemo } from 'react';

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
  action?: React.JSX.Element;
  children?: React.ReactNode;
  className?: string;
}

/** Sidebar widget. */
const Widget: React.FC<IWidget> = ({
  title,
  children,
  onActionClick,
  actionIcon = iconArrowRight,
  actionTitle,
  action,
  className,
}): React.JSX.Element => {
  const widgetId = useMemo(() => crypto.randomUUID(), []);

  return (
    <div className={clsx('⁂-widget', className)} aria-labelledby={`widget-header-${widgetId}`}>
      {(title ?? action ?? onActionClick) && (
        <div className='⁂-widget__header'>
          {title && <h1 id={`widget-header-${widgetId}`}>{title}</h1>}
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
};

export { Widget as default };
