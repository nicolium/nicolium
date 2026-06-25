import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useTimelineStream } from '@/hooks/streaming/use-timeline-stream';
import { useClient } from '@/hooks/use-client';
import { importEntities } from '@/queries/utils/import-entities';
import {
  useTimelinesStore,
  useTimeline as useStoreTimeline,
  useTimelinesActions,
  type TimelineEntry,
} from '@/stores/timelines';
import { compareId } from '@/utils/comparators';

import { queryKeys } from '../keys';

import type { PaginatedResponse, PaginationParams, Status, StreamingParams } from 'pl-api';

type TimelineFetcher = (params?: PaginationParams) => Promise<PaginatedResponse<Status>>;

interface StreamConfig {
  stream: string;
  params?: StreamingParams;
}

interface TimelineOptions {
  polling?: boolean;
  restoringMaxId?: string;
  prefetchRebloggedRelationships?: boolean;
}

const POLLING_INTERVAL = 20_000;

const sinceIdUnsupported = (statuses: Status[], sinceId: string) =>
  statuses.length > 0 && statuses.some((status) => compareId(status.id, sinceId) <= 0);

const useTimeline = (
  timelineId: string,
  fetcher: TimelineFetcher,
  streamConfig?: StreamConfig,
  options?: TimelineOptions,
) => {
  const polling = options?.polling ?? true;
  const restoringMaxId = options?.restoringMaxId;

  const timeline = useStoreTimeline(timelineId);
  const pollingEnabled = useTimelinesStore((state) => state.pollingEnabled);
  const timelineActions = useTimelinesActions();
  const queryClient = useQueryClient();
  const client = useClient();

  const { connected: streamingConnected } = useTimelineStream(
    streamConfig?.stream ?? '',
    streamConfig?.params,
    !!streamConfig?.stream,
  );

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const newestStatusId = useRef<string | undefined>(undefined);

  const fetchMissingRelationships = async (items: Array<Status>) => {
    if (!options?.prefetchRebloggedRelationships) return;

    const missingRebloggedAccountIds = [
      ...new Set(items.filter((status) => !!status.reblog).map((status) => status.account.id)),
    ].filter(
      (accountId) =>
        queryClient.getQueryData(queryKeys.accountRelationships.show(accountId)) === undefined,
    );

    if (missingRebloggedAccountIds.length > 0) {
      const relationships = await client.accounts.getRelationships(missingRebloggedAccountIds);

      for (const relationship of relationships) {
        queryClient.setQueryData(
          queryKeys.accountRelationships.show(relationship.id),
          relationship,
        );
      }
    }
  };

  useEffect(() => {
    if (timeline.entries[0]?.type === 'status') {
      newestStatusId.current = timeline.entries[0].originalId;
    }
  }, [timeline.entries]);

  // polling fallback when streaming is not connected
  useEffect(() => {
    if (!polling || !pollingEnabled || streamingConnected || timeline.isPending || !newestStatusId)
      return;

    const poll = async () => {
      const sinceId =
        useTimelinesStore.getState().timelines[timelineId]?.newestStatusId ??
        newestStatusId.current;
      if (!sinceId) return;

      try {
        const response = await fetcherRef.current({ since_id: sinceId });
        if (sinceIdUnsupported(response.items, sinceId)) {
          timelineActions.disablePolling();
          return;
        }

        if (response.items.length === 0) return;

        importEntities({ statuses: response.items });
        await fetchMissingRelationships(response.items);

        for (const status of response.items) {
          timelineActions.receiveStreamingStatus(timelineId, status);
        }
      } catch {}
    };

    const interval = setInterval(poll, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [timelineId, polling, pollingEnabled, streamingConnected, timeline.isPending]);

  useEffect(() => {
    if (!timeline.isPending || timeline.isFetching || timeline.isError === 401) return;
    fetchInitial();
  }, [timelineId, timeline.isPending]);

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
        await fetchMissingRelationships(response.items);

        timelineActions.expandTimeline(
          timelineId,
          response.items,
          !!response.next,
          true,
          isRestoring && shouldInsertGap,
        );
      } catch (error) {
        timelineActions.setError(
          timelineId,
          true,
          (error as { response?: { status?: number } }).response?.status,
        );
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
      await fetchMissingRelationships(response.items);

      timelineActions.expandTimeline(timelineId, response.items, !!response.next, false);
    } catch (error) {
      timelineActions.setError(
        timelineId,
        true,
        (error as { response?: { status?: number } }).response?.status,
      );
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
      await fetchMissingRelationships(response.items);

      timelineActions.fillGap(timelineId, gap.minId, response.items, !!response.next, direction);
    },
    [timelineId, fetcher],
  );

  const refetch = useCallback(() => {
    timelineActions.resetTimeline(timelineId);
    return fetchInitial(false);
  }, [timelineId, fetchInitial]);

  return useMemo(
    () => ({
      ...timeline,
      timelineId,
      fetchNextPage,
      dequeueEntries,
      fillGap,
      refetch,
      hasStreamConfig: !!streamConfig,
      options,
    }),
    [timeline, timelineId, fetchNextPage, dequeueEntries, fillGap, refetch, !!streamConfig],
  );
};

export { useTimeline };
