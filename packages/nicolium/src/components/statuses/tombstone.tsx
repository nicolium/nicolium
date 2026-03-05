import React from 'react';
import { FormattedMessage } from 'react-intl';

import Text from '@/components/ui/text';
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
    <Hotkeys handlers={handlers} className='h-16'>
      <div
        className='focusable flex h-[42px] items-center justify-center rounded-lg border-2 border-gray-200 text-center dark:border-gray-800'
        tabIndex={0}
      >
        <Text theme='muted'>
          {deleted ? (
            <FormattedMessage
              id='statuses.tombstone.deleted'
              defaultMessage='The post is deleted.'
            />
          ) : (
            <FormattedMessage
              id='statuses.tombstone'
              defaultMessage='One or more posts are unavailable.'
            />
          )}
        </Text>
      </div>
    </Hotkeys>
  );
};

export { Tombstone as default };
