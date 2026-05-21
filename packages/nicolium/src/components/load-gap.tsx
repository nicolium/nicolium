import iconDotsThree from '@phosphor-icons/core/regular/dots-three.svg';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from '@/components/ui/icon';

const messages = defineMessages({
  loadMore: { id: 'status.load_more', defaultMessage: 'Load more' },
});

interface ILoadGap {
  disabled?: boolean;
  maxId: string;
  onClick: (id: string) => void;
}

const LoadGap: React.FC<ILoadGap> = ({ disabled, maxId, onClick }) => {
  const intl = useIntl();

  const handleClick = () => {
    onClick(maxId);
  };

  return (
    <button
      className='⁂-load-gap'
      disabled={disabled}
      onClick={handleClick}
      title={intl.formatMessage(messages.loadMore)}
      aria-label={intl.formatMessage(messages.loadMore)}
    >
      <Icon src={iconDotsThree} aria-hidden />
    </button>
  );
};

export { LoadGap as default };
