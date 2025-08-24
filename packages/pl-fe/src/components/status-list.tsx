import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useRef, useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import LoadGap from 'pl-fe/components/load-gap';
import ScrollableList, { type IScrollableList } from 'pl-fe/components/scrollable-list';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import StatusContainer from 'pl-fe/containers/status-container';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import PendingStatus from 'pl-fe/features/ui/components/pending-status';

import type { VirtuosoHandle } from 'react-virtuoso';

interface IStatusList extends Omit<IScrollableList, 'onLoadMore' | 'children'> {
  /** Unique key to preserve the scroll position when navigating back. */
  scrollKey: string;
  /** List of status IDs to display. */
  statusIds: Array<string>;
  /** Last _unfiltered_ status ID (maxId) for pagination. */
  lastStatusId?: string;
  /** Pinned statuses to show at the top of the feed. */
  featuredStatusIds?: Array<string>;
  /** Pagination callback when the end of the list is reached. */
  onLoadMore?: (lastStatusId: string) => void;
  /** Whether the data is currently being fetched. */
  isLoading: boolean;
  /** Whether the server did not return a complete page. */
  isPartial?: boolean;
  /** Whether we expect an additional page of data. */
  hasMore: boolean;
  /** Message to display when the list is loaded but empty. */
  emptyMessage?: React.ReactNode;
  /** ID of the timeline in Redux. */
  timelineId?: string;
  /** Whether to show group information. */
  showGroup?: boolean;
}

/** Feed of statuses, built atop ScrollableList. */
const StatusList: React.FC<IStatusList> = ({
  statusIds,
  lastStatusId,
  featuredStatusIds,
  onLoadMore,
  timelineId,
  isLoading,
  isPartial,
  showGroup = true,
  className,
  ...other
}) => {
  const node = useRef<VirtuosoHandle>(null);

  const getFeaturedStatusCount = () => featuredStatusIds?.length || 0;

  const getCurrentStatusIndex = (id: string, featured: boolean): number => {
    if (featured) {
      return featuredStatusIds?.findIndex(key => key === id) || 0;
    } else {
      return statusIds.findIndex(key => key === id) + getFeaturedStatusCount();
    }
  };

  const handleMoveUp = (id: string, featured: boolean = false) => {
    const elementIndex = getCurrentStatusIndex(id, featured) - 1;
    selectChild(elementIndex);
  };

  const handleMoveDown = (id: string, featured: boolean = false) => {
    const elementIndex = getCurrentStatusIndex(id, featured) + 1;
    selectChild(elementIndex);
  };

  const handleLoadOlder = useCallback(debounce(() => {
    const maxId = lastStatusId || statusIds.at(-1);
    if (onLoadMore && maxId) {
      onLoadMore(maxId);
    }
  }, 300, { leading: true }), [onLoadMore, lastStatusId, statusIds.at(-1)]);

  const selectChild = (index: number) => {
    const selector = `#status-list [data-index="${index}"] .focusable`;
    const element = document.querySelector<HTMLDivElement>(selector);

    if (element) element.focus();

    node.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        if (!element) document.querySelector<HTMLDivElement>(selector)?.focus();
      },
    });
  };

  const renderLoadGap = (index: number) => {
    const ids = statusIds;
    const nextId = ids[index + 1];
    const prevId = ids[index - 1];

    if (index < 1 || !nextId || !prevId || !onLoadMore) return null;

    return (
      <LoadGap
        key={'gap:' + nextId}
        disabled={isLoading}
        maxId={prevId!}
        onClick={onLoadMore}
      />
    );
  };

  const renderStatus = (statusId: string) => (
    <StatusContainer
      key={statusId}
      id={statusId}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      contextType={timelineId}
      showGroup={showGroup}
      variant='slim'
      fromBookmarks={other.scrollKey === 'bookmarked_statuses'}
    />
  );

  const renderPendingStatus = (statusId: string) => {
    const idempotencyKey = statusId.replace(/^末pending-/, '');

    return (
      <PendingStatus
        key={statusId}
        idempotencyKey={idempotencyKey}
        variant='slim'
      />
    );
  };

  const scrollableContent = useMemo(() => {
    const renderFeaturedStatuses = (): React.ReactNode[] => {
      if (!featuredStatusIds) return [];

      return featuredStatusIds.map(statusId => (
        <StatusContainer
          key={`f-${statusId}`}
          id={statusId}
          featured
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          contextType={timelineId}
          showGroup={showGroup}
          variant='slim'
        />
      ));
    };

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

    const featuredStatuses = renderFeaturedStatuses();
    const statuses = renderStatuses();

    if (featuredStatuses && statuses) {
      return featuredStatuses.concat(statuses);
    } else {
      return statuses;
    }
  }, [featuredStatusIds, statusIds, isLoading, timelineId, showGroup]);

  if (isPartial) {
    return (
      <Stack className='py-2' space={2}>
        <Text size='2xl' weight='bold' tag='h2' align='center'>
          <FormattedMessage id='regeneration_indicator.label' tagName='strong' defaultMessage='Loading…' />
        </Text>

        <Text size='sm' theme='muted' align='center'>
          <FormattedMessage id='regeneration_indicator.sublabel' defaultMessage='Your home feed is being prepared!' />
        </Text>
      </Stack>
    );
  }

  return (
    <ScrollableList
      id='status-list'
      key='scrollable-list'
      isLoading={isLoading}
      showLoading={isLoading && statusIds.length === 0}
      onLoadMore={handleLoadOlder}
      placeholderComponent={() => <PlaceholderStatus variant='slim' />}
      placeholderCount={20}
      ref={node}
      listClassName={clsx('divide-y divide-solid divide-gray-200 dark:divide-gray-800', className)}
      {...other}
    >
      {scrollableContent}
    </ScrollableList>
  );
};

export { type IStatusList, StatusList as default };
