import debounce from 'lodash/debounce';
import React, { useCallback, useMemo } from 'react';
import { defineMessages } from 'react-intl';

import { dequeueTimeline, scrollTopTimeline } from '@/actions/timelines';
import ScrollTopButton from '@/components/scroll-top-button';
import StatusList, { type IStatusList } from '@/components/status-list';
import Portal from '@/components/ui/portal';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import { useAppSelector } from '@/hooks/use-app-selector';
import { makeGetStatusIds } from '@/selectors';

const messages = defineMessages({
  queue: {
    id: 'status_list.queue_label',
    defaultMessage: 'Click to see {count} new {count, plural, one {post} other {posts}}',
  },
  queueLiveRegion: {
    id: 'status_list.queue_label.live_region',
    defaultMessage: '{count} new {count, plural, one {post} other {posts}}.',
  },
});

interface ITimeline extends Omit<IStatusList, 'statusIds' | 'isLoading' | 'hasMore'> {
  /** Unique key to preserve the scroll position when navigating back. */
  scrollKey: string;
  /** ID of the timeline in Redux. */
  timelineId: string;
  /** Settings path to use instead of the timelineId. */
  prefix?: string;
}

/** Scrollable list of statuses from a timeline in the Redux store. */
const Timeline: React.FC<ITimeline> = ({ timelineId, onLoadMore, prefix, ...rest }) => {
  const dispatch = useAppDispatch();
  const getStatusIds = useMemo(makeGetStatusIds, []);

  const statusIds = useAppSelector((state) => getStatusIds(state, { type: timelineId, prefix }));
  const lastStatusId = statusIds.at(-1);
  const isLoading = useAppSelector((state) => state.timelines[timelineId]?.isLoading);
  const isPartial = useAppSelector((state) => state.timelines[timelineId]?.isPartial || false);
  const hasMore = useAppSelector((state) => state.timelines[timelineId]?.hasMore);
  const totalQueuedItemsCount = useAppSelector(
    (state) => state.timelines[timelineId]?.totalQueuedItemsCount || 0,
  );

  const handleDequeueTimeline = useCallback(() => {
    dispatch(dequeueTimeline(timelineId, onLoadMore));
  }, []);

  const handleScroll = useCallback(
    debounce((startIndex?: number) => {
      dispatch(scrollTopTimeline(timelineId, startIndex === 0));
    }, 100),
    [timelineId],
  );

  return (
    <>
      <Portal>
        <ScrollTopButton
          key='timeline-queue-button-header'
          onClick={handleDequeueTimeline}
          count={totalQueuedItemsCount}
          message={messages.queue}
          liveRegionMessage={messages.queueLiveRegion}
        />
      </Portal>

      <StatusList
        timelineId={timelineId}
        onScroll={handleScroll}
        lastStatusId={lastStatusId}
        statusIds={statusIds}
        isLoading={isLoading}
        isPartial={isPartial}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        {...rest}
      />
    </>
  );
};

export { Timeline as default };
