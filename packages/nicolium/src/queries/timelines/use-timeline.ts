import { useCallback, useEffect, useMemo } from 'react';

import { importEntities } from '@/actions/importer';
import { useTimelineStream } from '@/api/hooks/streaming/use-timeline-stream';
import { useTimeline as useStoreTimeline, useTimelinesActions } from '@/stores/timelines';

import type { PaginatedResponse, Status, StreamingParams } from 'pl-api';

type PaginationParams = { max_id?: string; min_id?: string };
type TimelineFetcher = (params?: PaginationParams) => Promise<PaginatedResponse<Status>>;

interface StreamConfig {
  stream: string;
  params?: StreamingParams;
}

const useTimeline = (timelineId: string, fetcher: TimelineFetcher, streamConfig?: StreamConfig) => {
  const timeline = useStoreTimeline(timelineId);
  const timelineActions = useTimelinesActions();

  useTimelineStream(streamConfig?.stream ?? '', streamConfig?.params, !!streamConfig?.stream);

  useEffect(() => {
    if (!timeline.isPending) return;
    fetchInitial();
  }, []);

  const fetchInitial = useCallback(async () => {
    timelineActions.setLoading(timelineId, true);
    try {
      const response = await fetcher();
      importEntities({ statuses: response.items });
      timelineActions.expandTimeline(timelineId, response.items, !!response.next, true);
    } catch (error) {
      //
    }
  }, [timelineId]);

  const fetchNextPage = useCallback(async () => {
    timelineActions.setLoading(timelineId, true);

    try {
      const response = await fetcher({ max_id: timeline.oldestStatusId });

      importEntities({ statuses: response.items });

      timelineActions.expandTimeline(timelineId, response.items, !!response.next, false);
    } catch (error) {
      //
    }
  }, [timelineId, timeline.oldestStatusId]);

  const dequeueEntries = useCallback(() => {
    timelineActions.dequeueEntries(timelineId);
  }, [timelineId]);

  return useMemo(
    () => ({ ...timeline, timelineId, fetchNextPage, dequeueEntries }),
    [timeline, timelineId, fetchNextPage, dequeueEntries],
  );
};

export { useTimeline };
