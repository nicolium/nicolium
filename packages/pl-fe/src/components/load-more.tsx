import { clsx } from 'clsx';
import React from 'react';
import { FormattedMessage } from 'react-intl';

interface ILoadMore {
  onClick: React.MouseEventHandler;
  disabled?: boolean;
  visible?: boolean;
  className?: string;
}

const LoadMore: React.FC<ILoadMore> = ({ onClick, disabled, visible = true, className }) => {
  if (!visible) {
    return null;
  }

  return (
    <button className={clsx('⁂-load-more', className)} disabled={disabled || !visible} onClick={onClick}>
      <FormattedMessage id='status.load_more' defaultMessage='Load more' />
    </button>
  );
};

export { LoadMore as default };
