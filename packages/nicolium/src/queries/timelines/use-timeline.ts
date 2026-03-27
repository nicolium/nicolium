import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useTimelineStream } from '@/hooks/streaming/use-timeline-stream';
import { importEntities } from '@/queries/utils/import-entities';
import {
  useTimelinesStore,
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

interface TimelineOptions {
  polling?: boolean;
  restoringMaxId?: string;
}

const POLLING_INTERVAL = 20_000;

const useTimeline = (
  timelineId: string,
  fetcher: TimelineFetcher,
  streamConfig?: StreamConfig,
  options?: TimelineOptions,
) => {
  const polling = options?.polling ?? true;
  const restoringMaxId = options?.restoringMaxId;

  const timeline = useStoreTimeline(timelineId);
  const timelineActions = useTimelinesActions();

  const { connected: streamingConnected } = useTimelineStream(
    streamConfig?.stream ?? '',
    streamConfig?.params,
    !!streamConfig?.stream,
  );

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const newestStatusId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (timeline.entries[0]?.type === 'status') {
      newestStatusId.current = timeline.entries[0].originalId;
    }
  }, [timeline.entries]);

  // polling fallback when streaming is not connected
  useEffect(() => {
    if (!polling || streamingConnected || timeline.isPending || !newestStatusId) return;

    const poll = async () => {
      const sinceId =
        useTimelinesStore.getState().timelines[timelineId]?.newestStatusId ??
        newestStatusId.current;
      if (!sinceId) return;

      try {
        const response = await fetcherRef.current({ since_id: sinceId });
        if (response.items.length === 0) return;

        importEntities({ statuses: response.items });
        for (const status of response.items) {
          timelineActions.receiveStreamingStatus(timelineId, status);
        }
      } catch {}
    };

    const interval = setInterval(poll, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [timelineId, polling, streamingConnected, timeline.isPending]);

  useEffect(() => {
    if (!timeline.isPending || timeline.isFetching) return;
    fetchInitial();
  }, [timelineId]);

  const fetchInitial = useCallback(
    async (isRestoring = !!restoringMaxId) => {
      timelineActions.setLoading(timelineId, true);
      try {
        const [response, shouldInsertGap] = await Promise.all([
          fetcher(),
          !restoringMaxId
            ? Promise.resolve(false)
            : fetcher({ since_id: restoringMaxId, limit: 1 })
                .then((res) => res.items.length > 0)
                .catch(() => true),
        ]);
        importEntities({ statuses: response.items });
        timelineActions.expandTimeline(
          timelineId,
          response.items,
          !!response.next,
          true,
          isRestoring && shouldInsertGap,
        );
      } catch (error) {
        timelineActions.setError(timelineId, true);
      }
    },
    [timelineId, restoringMaxId],
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
