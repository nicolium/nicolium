import { clsx } from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Hotkeys } from '@/features/ui/components/hotkeys';

interface ILoadMore {
  onClick: React.MouseEventHandler;
  onMoveUp?: () => void;
  disabled?: boolean;
  visible?: boolean;
  className?: string;
}

const LoadMore: React.FC<ILoadMore> = ({
  onClick,
  onMoveUp,
  disabled,
  visible = true,
  className,
}) => {
  if (!visible) {
    return null;
  }

  const button = (
    <button
      className={clsx('load-more', className)}
      disabled={disabled ?? !visible}
      onClick={onClick}
    >
      <FormattedMessage id='status.load_more' defaultMessage='Load more' />
    </button>
  );

  if (!onMoveUp) {
    return button;
  }

  return (
    <Hotkeys handlers={{ moveUp: onMoveUp }} focusable={false}>
      {button}
    </Hotkeys>
  );
};

export { LoadMore as default };
