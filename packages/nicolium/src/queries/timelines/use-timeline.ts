import { useCallback, useEffect, useMemo } from 'react';

import { importEntities } from '@/actions/importer';
import { useTimelineStream } from '@/api/hooks/streaming/use-timeline-stream';
import {
  useTimeline as useStoreTimeline,
  useTimelinesActions,
  type TimelineEntry,
} from '@/stores/timelines';

import type { PaginatedResponse, PaginationParams, Status, StreamingParams } from 'pl-api';

type TimelineFetcher = (params?: PaginationParams) => Promise<PaginatedResponse<Status>>;

interface StreamConfig {
  stream: string;
  params?: StreamingParams;
}

const useTimeline = (
  timelineId: string,
  fetcher: TimelineFetcher,
  streamConfig?: StreamConfig,
  restoring?: boolean,
) => {
  const timeline = useStoreTimeline(timelineId);
  const timelineActions = useTimelinesActions();

  useTimelineStream(streamConfig?.stream ?? '', streamConfig?.params, !!streamConfig?.stream);

  useEffect(() => {
    if (!timeline.isPending || timeline.isFetching) return;
    fetchInitial();
  }, [timelineId]);

  const fetchInitial = useCallback(
    async (isRestoring = restoring) => {
      timelineActions.setLoading(timelineId, true);
      try {
        const response = await fetcher();
        importEntities({ statuses: response.items });
        timelineActions.expandTimeline(
          timelineId,
          response.items,
          !!response.next,
          true,
          isRestoring,
        );
      } catch (error) {
        timelineActions.setError(timelineId, true);
      }
    },
    [timelineId, restoring],
  );

  const fetchNextPage = useCallback(async () => {
    if (timeline.isFetching) return;

    timelineActions.setLoading(timelineId, true);

    try {
      const response = await fetcher({ max_id: timeline.oldestStatusId });

      importEntities({ statuses: response.items });

      timelineActions.expandTimeline(timelineId, response.items, !!response.next, false);
    } catch (error) {
      timelineActions.setError(timelineId, true);
    }
  }, [timelineId, timeline.oldestStatusId, timeline.isFetching]);

  const dequeueEntries = useCallback(() => {
    timelineActions.dequeueEntries(timelineId);
  }, [timelineId]);

  const fillGap = useCallback(
    async (gap: Extract<TimelineEntry, { type: 'gap' }>, direction: 'up' | 'down') => {
      let params: PaginationParams;
      if (direction === 'up') {
        const gapIndex = timeline.entries.indexOf(gap);
        const previousEntry = gapIndex > 0 ? timeline.entries[gapIndex - 1] : null;
        const maxId =
          previousEntry && previousEntry.type === 'status' ? previousEntry.originalId : undefined;
        params = { min_id: gap.minId, max_id: maxId };
      } else {
        params = { max_id: gap.maxId, since_id: gap.minId };
      }

      const response = await fetcher(params);
      importEntities({ statuses: response.items });
      timelineActions.fillGap(timelineId, gap.minId, response.items, !!response.next, direction);
    },
    [timelineId, fetcher],
  );

  const refetch = useCallback(() => {
    timelineActions.resetTimeline(timelineId);
    return fetchInitial(false);
  }, [timelineId, fetchInitial]);

  return useMemo(
    () => ({ ...timeline, timelineId, fetchNextPage, dequeueEntries, fillGap, refetch }),
    [timeline, timelineId, fetchNextPage, dequeueEntries, fillGap, refetch],
  );
};

export { useTimeline };
