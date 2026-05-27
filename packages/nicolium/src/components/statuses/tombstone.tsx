import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Hotkeys } from '@/features/ui/components/hotkeys';

interface ITombstone {
  id: string;
  onMoveUp?: (statusId: string) => void | boolean;
  onMoveDown?: (statusId: string) => void | boolean;
  deleted?: boolean;
}

/** Represents a deleted item. */
const Tombstone: React.FC<ITombstone> = ({ id, onMoveUp, onMoveDown, deleted }) => {
  const handlers = {
    moveUp: () => onMoveUp?.(id),
    moveDown: () => onMoveDown?.(id),
  };

  return (
    <Hotkeys handlers={handlers} className='status-tombstone__container'>
      <div className='focusable status-tombstone' tabIndex={0}>
        {deleted ? (
          <FormattedMessage id='statuses.tombstone.deleted' defaultMessage='The post is deleted.' />
        ) : id.endsWith('-unavailable') ? (
          <FormattedMessage
            id='statuses.tombstone.unavailable'
            defaultMessage='The post is not visible to you.'
          />
        ) : (
          <FormattedMessage
            id='statuses.tombstone'
            defaultMessage='One or more posts are unavailable.'
          />
        )}
      </div>
    </Hotkeys>
  );
};

export { Tombstone as default };
