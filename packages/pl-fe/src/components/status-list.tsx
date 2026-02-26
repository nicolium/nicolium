import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useRef, useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import LoadGap from '@/components/load-gap';
import ScrollableList, { type IScrollableList } from '@/components/scrollable-list';
import StatusContainer from '@/containers/status-container';
import PlaceholderStatus from '@/features/placeholder/components/placeholder-status';
import PendingStatus from '@/features/ui/components/pending-status';
import { selectChild } from '@/utils/scroll-utils';

import Icon from './ui/icon';

import type { VirtuosoHandle } from 'react-virtuoso';

const SkipPinned: React.FC<React.ComponentProps<'button'>> = ({ onClick }) => {
  return (
    <button className='⁂-skip-pinned' onClick={onClick}>
      <Icon src={require('@phosphor-icons/core/regular/arrow-line-down.svg')} />

      <p>
        <FormattedMessage id='status.skip_pinned' defaultMessage='Skip pinned posts' />
      </p>
    </button>
  );
};

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
  const node = useRef<VirtuosoHandle | null>(null);

  const getFeaturedStatusCount = () => featuredStatusIds?.length ?? 0;

  const getCurrentStatusIndex = (id: string, featured: boolean): number => {
    if (featured) {
      return featuredStatusIds?.findIndex((key) => key === id) ?? 0;
    } else {
      return statusIds.findIndex((key) => key === id) + getFeaturedStatusCount();
    }
  };

  const handleMoveUp = (id: string, featured: boolean = false) => {
    const elementIndex = getCurrentStatusIndex(id, featured) - 1;
    selectChild(elementIndex, node, document.getElementById('status-list') ?? undefined);
  };

  const handleMoveDown = (id: string, featured: boolean = false) => {
    const elementIndex = getCurrentStatusIndex(id, featured) + 1;
    selectChild(
      elementIndex,
      node,
      document.getElementById('status-list') ?? undefined,
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

  const handleSkipPinned = () => {
    const skipPinned = () => {
      selectChild(
        getFeaturedStatusCount(),
        node,
        document.getElementById('status-list') ?? undefined,
        scrollableContent.length,
        'start',
      );
    };

    skipPinned();

    setTimeout(() => skipPinned, 0);
  };

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
      contextType={timelineId}
      showGroup={showGroup}
      variant='slim'
      fromBookmarks={other.scrollKey === 'bookmarked_statuses'}
      fromHomeTimeline={timelineId === 'home'}
    />
  );

  const renderPendingStatus = (statusId: string) => {
    const idempotencyKey = statusId.replace(/^末pending-/, '');

    return <PendingStatus key={statusId} idempotencyKey={idempotencyKey} variant='slim' />;
  };

  const scrollableContent = useMemo(() => {
    const renderFeaturedStatuses = (): React.ReactNode[] => {
      if (!featuredStatusIds) return [];

      return featuredStatusIds.map((statusId) => (
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
      <div className='⁂-status-list__empty'>
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
    <>
      {featuredStatusIds && featuredStatusIds.length > 3 && statusIds.length > 0 && (
        <SkipPinned onClick={handleSkipPinned} />
      )}
      <ScrollableList
        id='status-list'
        key='scrollable-list'
        isLoading={isLoading}
        showLoading={isLoading && statusIds.length === 0}
        onLoadMore={handleLoadOlder}
        placeholderComponent={() => <PlaceholderStatus variant='slim' />}
        placeholderCount={20}
        ref={node}
        listClassName={clsx('⁂-status-list', className)}
        {...other}
      >
        {scrollableContent}
      </ScrollableList>
    </>
  );
};

export { type IStatusList, StatusList as default };
