import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useRef, useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import LoadGap from '@/components/load-gap';
import PlaceholderStatus from '@/components/placeholders/placeholder-status';
import ScrollableList, { type IScrollableList } from '@/components/scrollable-list';
import PendingStatus from '@/components/statuses/pending-status';
import StatusContainer from '@/components/statuses/status-container';
import { timelineToFilterContextType } from '@/queries/settings/use-filters';
import { selectChild } from '@/utils/scroll-utils';

import type { VirtuosoHandle } from 'react-virtuoso';

const PlaceholderStatusSlim = () => <PlaceholderStatus variant='slim' />;

interface IStatusList extends Omit<IScrollableList, 'onLoadMore' | 'children'> {
  /** Unique key to preserve the scroll position when navigating back. */
  scrollKey: string;
  /** List of status IDs to display. */
  statusIds: Array<string>;
  /** Last _unfiltered_ status ID (maxId) for pagination. */
  lastStatusId?: string;
  /** Pagination callback when the end of the list is reached. */
  onLoadMore?: (lastStatusId: string) => void;
  /** Whether the data is currently being fetched. */
  isLoading: boolean;
  /** Whether the server did not return a complete page. */
  isPartial?: boolean;
  /** Whether we expect an additional page of data. */
  hasMore: boolean;
  /** ID of the timeline in Redux. */
  timelineId?: string;
  /** Whether to show group information. */
  showGroup?: boolean;
}

/** Feed of statuses, built atop ScrollableList. */
const StatusList: React.FC<IStatusList> = ({
  statusIds,
  lastStatusId,
  onLoadMore,
  timelineId,
  isLoading,
  isPartial,
  showGroup = true,
  className,
  ...other
}) => {
  const columnId: string = useRef(`status-list-${crypto.randomUUID()}`).current;
  const node = useRef<VirtuosoHandle | null>(null);

  const contextType = timelineToFilterContextType(timelineId);

  const getCurrentStatusIndex = (id: string): number => {
    return statusIds.findIndex((key) => key === id);
  };

  const handleMoveUp = (id: string) => {
    const elementIndex = getCurrentStatusIndex(id) - 1;
    selectChild(elementIndex, node, document.getElementById(columnId) ?? undefined);
  };

  const handleMoveDown = (id: string) => {
    const elementIndex = getCurrentStatusIndex(id) + 1;
    selectChild(
      elementIndex,
      node,
      document.getElementById(columnId) ?? undefined,
      scrollableContent.length,
    );
  };

  const handleLoadOlder = useCallback(
    debounce(
      () => {
        const maxId = lastStatusId ?? statusIds.at(-1);
        if (onLoadMore && maxId) {
          onLoadMore(maxId);
        }
      },
      300,
      { leading: true },
    ),
    [onLoadMore, lastStatusId, statusIds.at(-1)],
  );

  const renderLoadGap = (index: number) => {
    const ids = statusIds;
    const nextId = ids[index + 1];
    const prevId = ids[index - 1];

    if (index < 1 || !nextId || !prevId || !onLoadMore) return null;

    return (
      <LoadGap key={'gap:' + nextId} disabled={isLoading} maxId={prevId} onClick={onLoadMore} />
    );
  };

  const renderStatus = (statusId: string) => (
    <StatusContainer
      key={statusId}
      id={statusId}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      contextType={contextType}
      showGroup={showGroup}
      variant='slim'
      fromBookmarks={other.scrollKey === 'bookmarked_statuses'}
    />
  );

  const renderPendingStatus = (statusId: string) => {
    const idempotencyKey = statusId.replace(/^末pending-/, '');

    return <PendingStatus key={statusId} idempotencyKey={idempotencyKey} variant='slim' />;
  };

  const scrollableContent = useMemo(() => {
    const renderStatuses = (): React.ReactNode[] => {
      if (isLoading || statusIds.length > 0) {
        return statusIds.reduce((acc, statusId, index) => {
          if (statusId === null) {
            const gap = renderLoadGap(index);
            if (gap) {
              acc.push(gap);
            }
          } else if (statusId.startsWith('末pending-')) {
            acc.push(renderPendingStatus(statusId));
          } else {
            acc.push(renderStatus(statusId));
          }

          return acc;
        }, [] as React.ReactNode[]);
      } else {
        return [];
      }
    };

    const statuses = renderStatuses();

    return statuses;
  }, [statusIds, isLoading, timelineId, showGroup]);

  if (isPartial) {
    return (
      <div className='status-list__empty'>
        <h2>
          <FormattedMessage
            id='regeneration_indicator.label'
            tagName='strong'
            defaultMessage='Loading…'
          />
        </h2>

        <p>
          <FormattedMessage
            id='regeneration_indicator.sublabel'
            defaultMessage='Your home feed is being prepared!'
          />
        </p>
      </div>
    );
  }

  return (
    <ScrollableList
      id={columnId}
      key='scrollable-list'
      isLoading={isLoading}
      showLoading={isLoading && statusIds.length === 0}
      onLoadMore={handleLoadOlder}
      placeholderComponent={PlaceholderStatusSlim}
      placeholderCount={20}
      ref={node}
      listClassName={clsx('status-list', className)}
      {...other}
    >
      {scrollableContent}
    </ScrollableList>
  );
};

export { StatusList as default };
