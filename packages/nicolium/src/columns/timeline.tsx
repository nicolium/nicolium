import clsx from 'clsx';
import React from 'react';

import LoadMore from '@/components/load-more';
import ScrollableList from '@/components/scrollable-list';
import Status from '@/components/statuses/status';
import Tombstone from '@/components/statuses/tombstone';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import { useStatus } from '@/queries/statuses/use-status';
import { useHomeTimeline } from '@/queries/timelines/use-timelines';

import type { FilterContextType } from '@/queries/settings/use-filters';
import type { TimelineEntry } from '@/queries/timelines/use-timeline';

interface ITimelineStatus {
  id: string;
  contextType?: FilterContextType;
  isConnectedTop?: boolean;
  isConnectedBottom?: boolean;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

/** Status with reply-connector in threads. */
const TimelineStatus: React.FC<ITimelineStatus> = (props): React.JSX.Element => {
  const { id, isConnectedTop, isConnectedBottom } = props;

  const statusQuery = useStatus(id, { withFilteredResults: true });

  if (statusQuery.data?.deleted) {
    return (
      <div className='py-4 pb-8'>
        <Tombstone id={id} onMoveUp={props.onMoveUp} onMoveDown={props.onMoveDown} deleted />
      </div>
    );
  }

  const renderConnector = (): React.JSX.Element | null => {
    const isConnected = isConnectedTop || isConnectedBottom;

    if (!isConnected) return null;

    return (
      <div
        className={clsx(
          'absolute left-5 z-[1] hidden w-0.5 bg-gray-200 black:bg-gray-800 dark:bg-primary-800 rtl:left-auto rtl:right-5',
          {
            'top-[calc(28px+42px)] !block h-[calc(100%-42px-8px-1rem)]': isConnectedBottom,
          },
        )}
      />
    );
  };

  return (
    <div
      className={clsx('⁂-timeline-status relative', {
        '⁂-timeline-status--connected-bottom': isConnectedBottom,
        'border-b border-solid border-gray-200 dark:border-gray-800': !isConnectedBottom,
        '⁂-timeline-status--connected-top': isConnectedTop,
      })}
    >
      {renderConnector()}
      {statusQuery.isPending ? (
        <PlaceholderStatus variant='slim' />
      ) : statusQuery.data ? (
        <Status status={statusQuery.data!} variant='slim' {...props} />
      ) : null}
    </div>
  );
};

const NewTimelineColumn = () => {
  const { data, handleLoadMore, isLoading } = useHomeTimeline();

  const renderEntry = (entry: TimelineEntry) => {
    if (entry.type === 'status') {
      return (
        <TimelineStatus
          key={entry.id}
          id={entry.id}
          isConnectedTop={entry.isConnectedTop}
          isConnectedBottom={entry.isConnectedBottom}
          contextType='home'
          // onMoveUp={handleMoveUp}
          // onMoveDown={handleMoveDown}
          // contextType={timelineId}
          // showGroup={showGroup}
          // variant={divideType === 'border' ? 'slim' : 'rounded'}
          // fromBookmarks={other.scrollKey === 'bookmarked_statuses'}
        />
      );
    }
    if (entry.type === 'page-end' || entry.type === 'page-start') {
      return (
        <div className='m-4'>
          <LoadMore key='load-more' onClick={() => handleLoadMore(entry)} disabled={isLoading} />
        </div>
      );
    }
  };

  return (
    <ScrollableList
      id='status-list'
      key='scrollable-list'
      isLoading={isLoading}
      showLoading={isLoading && !data}
      placeholderComponent={() => <PlaceholderStatus variant={'slim'} />}
      placeholderCount={20}
      // className={className}
      // listClassName={clsx('divide-y divide-solid divide-gray-200 dark:divide-gray-800', {
      //   'divide-none': divideType !== 'border',
      // })}
      // itemClassName={clsx({
      //   'pb-3': divideType !== 'border',
      // })}
      // {...other}
    >
      {(data || []).map(renderEntry)}
    </ScrollableList>
  );
};

export { NewTimelineColumn };
