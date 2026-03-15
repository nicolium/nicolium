import clsx from 'clsx';
import React from 'react';

import Tombstone from '@/components/statuses/tombstone';
import StatusContainer from '@/containers/status-container';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useReplyCount, useReplyToId } from '@/stores/contexts';
import { useStatusMeta } from '@/stores/status-meta';

import type { FilterContextType } from '@/queries/settings/use-filters';

interface IThreadStatus {
  id: string;
  contextType?: FilterContextType;
  focusedStatusId: string;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  linear?: boolean;
}

/** Status with reply-connector in threads. */
const ThreadStatus: React.FC<IThreadStatus> = (props): React.JSX.Element => {
  const { id, focusedStatusId } = props;

  const replyToId = useReplyToId(id);
  const replyCount = useReplyCount(id);
  const { data: statusData } = useMinimalStatus(id);
  const isLoaded = Boolean(statusData);
  const { deleted } = useStatusMeta(id);

  if (deleted) {
    return (
      <div className='py-4 pb-8'>
        <Tombstone id={id} onMoveUp={props.onMoveUp} onMoveDown={props.onMoveDown} deleted />
      </div>
    );
  }

  const renderConnector = (): React.JSX.Element | null => {
    if (props.linear) return null;

    const isConnectedTop = replyToId && replyToId !== focusedStatusId;
    const isConnectedBottom = replyCount > 0;
    const isConnected = isConnectedTop || isConnectedBottom;

    if (!isConnected) return null;

    return (
      <div
        className={clsx(
          'absolute left-5 z-[1] hidden w-0.5 bg-gray-200 black:bg-gray-800 dark:bg-primary-800 rtl:left-auto rtl:right-5',
          {
            'top-[calc(12px+42px)] !block h-[calc(100%-42px-8px-1rem)]': isConnectedBottom,
          },
        )}
      />
    );
  };

  return (
    <div
      className={clsx('thread__status relative pb-4', { 'thread__status--linear': props.linear })}
    >
      {renderConnector()}
      {isLoaded ? (
        <StatusContainer {...props} showGroup={false} />
      ) : (
        <PlaceholderStatus variant='default' />
      )}
      {props.linear && (
        <hr className='-mx-4 mt-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />
      )}
    </div>
  );
};

export { ThreadStatus as default };
